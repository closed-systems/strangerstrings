#!/usr/bin/env node

import { Command } from 'commander';
import { StrangerStrings } from './StrangerStrings';
import { NG_THRESHOLDS, MAX_NG_THRESHOLD } from './utils/constants';
import * as fs from 'fs';

const program = new Command();

interface CLIOptions {
  model?: string;
  verbose?: boolean;
  minLength?: number;
  output?: string;
  format?: 'text' | 'json' | 'csv';
  unique?: boolean;
  sort?: 'score' | 'alpha' | 'offset';
}

program
  .name('strangerstrings')
  .description('Extract and analyze meaningful strings from binary files using trigram scoring')
  .version('1.0.0')
  .addHelpText('before', () => {
    return '';
  })
  .argument('[input]', 'Input file to analyze, or "-" to read from stdin')
  .option('-m, --model <path>', 'Path to .sng model file', './StringModel.sng')
  .option('-v, --verbose', 'Show detailed scoring information')
  .option('-l, --min-length <number>', 'Minimum string length for binary extraction', '4')
  .option('-u, --unique', 'Show each unique string only once (removes duplicates)')
  .option('-s, --sort <method>', 'Sort results by: score (default), alpha (alphabetical), offset (file position)', 'score')
  .option('-o, --output <path>', 'Output file (default: stdout)')
  .option('-f, --format <format>', 'Output format: text, json, csv', 'text')
  .option('--info', 'Show model information and exit')
  .option('--test', 'Run with sample test strings')
  .action(async (input, options: CLIOptions & { info?: boolean; test?: boolean }) => {
    try {
      // Handle special options first
      if (options.info) {
        await infoCommand(options);
        return;
      }
      
      if (options.test) {
        await testCommand(options);
        return;
      }
      
      // If no input provided, show help
      if (!input) {
        program.help();
        return;
      }
      
      // Default action: analyze
      await analyzeCommand(input, options);
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

async function analyzeCommand(input: string, options: CLIOptions) {
  const analyzer = new StrangerStrings();
  
  // Load model
  const modelPath = options.model || './StringModel.sng';
  if (!fs.existsSync(modelPath)) {
    throw new Error(`Model file not found: ${modelPath}`);
  }
  
  if (options.verbose) {
    console.error(`Loading model: ${modelPath}`);
  }
  
  await analyzer.loadModel({ modelPath });
  
  if (options.verbose) {
    const modelInfo = analyzer.getModelInfo();
    console.error(`Model type: ${modelInfo.type}, Lowercase: ${modelInfo.isLowerCase}`);
  }

  let results: any[] = [];
  let isBinaryFile = false;

  if (input === '-') {
    // Read from stdin when - is specified
    if (options.verbose) {
      console.error(`Reading from stdin...`);
    }
    
    const stdin = process.stdin;
    let inputData = '';
    
    stdin.setEncoding('utf8');
    for await (const chunk of stdin) {
      inputData += chunk;
    }
    
    const candidateStrings = inputData.split(/\s+/).filter(s => s.length > 0);
    results = analyzer.analyzeStrings(candidateStrings);
  } else {
    // Check if file exists
    if (!fs.existsSync(input)) {
      throw new Error(`File not found: ${input}`);
    }
    
    // Analyze file
    if (options.verbose) {
      console.error(`Analyzing file: ${input}`);
    }
    
    const buffer = fs.readFileSync(input);
    const minLength = parseInt((options.minLength || '4').toString(), 10);
    
    if (options.verbose) {
      const extractedStrings = analyzer.extractStringsFromBinary(buffer, minLength);
      console.error(`Extracted ${extractedStrings.length} candidate strings (min length: ${minLength})`);
    }
    
    results = analyzer.analyzeBinaryFile(buffer, { minLength });
    isBinaryFile = true;
  }

  // Use default thresholds from the model

  // Filter to valid strings if not in verbose mode
  let outputResults = options.verbose ? results : results.filter(r => r.isValid);

  // Remove duplicates if unique option is specified
  if (options.unique) {
    const seen = new Map<string, any>();
    
    for (const result of outputResults) {
      const key = result.originalString;
      if (!seen.has(key) || (seen.has(key) && result.score > seen.get(key).score)) {
        seen.set(key, result);
      }
    }
    
    outputResults = Array.from(seen.values());
  }

  // Sort results based on the sort option
  const sortMethod = options.sort || 'score';
  switch (sortMethod) {
    case 'score':
      outputResults.sort((a, b) => b.score - a.score); // Best score first
      break;
    case 'alpha':
      outputResults.sort((a, b) => a.originalString.localeCompare(b.originalString)); // Alphabetical
      break;
    case 'offset':
      if (isBinaryFile) {
        outputResults.sort((a, b) => (a.offset || 0) - (b.offset || 0)); // File position
      } else {
        console.error('Warning: Offset sorting only available for binary files, sorting by score instead');
        outputResults.sort((a, b) => b.score - a.score);
      }
      break;
    default:
      outputResults.sort((a, b) => b.score - a.score);
  }

  // Output results
  const outputContent = formatOutput(outputResults, options);
  
  if (options.output) {
    fs.writeFileSync(options.output, outputContent);
    if (options.verbose) {
      console.error(`Results written to: ${options.output}`);
    }
  } else {
    console.log(outputContent);
  }

  if (options.verbose) {
    const validCount = results.filter(r => r.isValid).length;
    const rejectedCount = results.length - validCount;
    const uniqueNote = options.unique ? ` (${outputResults.length} unique shown)` : '';
    console.error(`\nSummary:`);
    console.error(`  Accepted: ${validCount} strings`);
    console.error(`  Rejected: ${rejectedCount} strings`);
    console.error(`  Total: ${results.length} strings`);
    console.error(`  Acceptance rate: ${(validCount/results.length*100).toFixed(1)}%${uniqueNote}`);
  }
}

async function testCommand(options: CLIOptions) {
  const analyzer = new StrangerStrings();
  
  const modelPath = options.model || './StringModel.sng';
  await analyzer.loadModel({ modelPath });
  
  const testCases = [
    { category: 'Valid English', strings: ['hello', 'world', 'function', 'initialize', 'process'] },
    { category: 'Valid Technical', strings: ['file_inherit', 'total %qu', 'Error: %s', 'main()', 'sizeof'] },
    { category: 'Invalid Random', strings: ['.CRT$XIC', 'Ta&@', 'xZ#@$%', '!@#$%^&*', '}{][++'] },
    { category: 'Edge Cases', strings: ['ab', 'a', '', '123', 'XML'] }
  ];

  console.log('=== StrangerStrings Test Results ===\n');
  
  const modelInfo = analyzer.getModelInfo();
  console.log(`Model: ${modelInfo.type} (lowercase: ${modelInfo.isLowerCase})\n`);

  for (const testCase of testCases) {
    console.log(`${testCase.category}:`);
    console.log('-'.repeat(testCase.category.length + 1));
    
    for (const testString of testCase.strings) {
      const result = analyzer.analyzeString(testString);
      const isValid = result.isValid;
      const status = isValid ? '✓' : '✗';
      
      if (options.verbose) {
        console.log(`  ${status} "${testString}" → score: ${result.score.toFixed(3)}, threshold: ${result.threshold.toFixed(3)}`);
      } else {
        console.log(`  ${status} "${testString}"`);
      }
    }
    console.log();
  }
}

async function infoCommand(options: CLIOptions) {
  const analyzer = new StrangerStrings();
  
  const modelPath = options.model || './StringModel.sng';
  if (!fs.existsSync(modelPath)) {
    throw new Error(`Model file not found: ${modelPath}`);
  }
  
  await analyzer.loadModel({ modelPath });
  
  const modelInfo = analyzer.getModelInfo();
  const stats = fs.statSync(modelPath);
  
  console.log('=== Model Information ===');
  console.log(`File: ${modelPath}`);
  console.log(`Size: ${(stats.size / 1024).toFixed(1)} KB`);
  console.log(`Type: ${modelInfo.type}`);
  console.log(`Lowercase: ${modelInfo.isLowerCase}`);
  console.log(`Modified: ${stats.mtime.toISOString()}`);
  
  console.log('\n=== Threshold Information ===');
  console.log('Length-based thresholds:');
  for (let i = 4; i <= 20; i++) {
    const threshold = i >= NG_THRESHOLDS.length ? MAX_NG_THRESHOLD : NG_THRESHOLDS[i];
    console.log(`  Length ${i.toString().padStart(2)}: ${threshold.toFixed(3)}`);
  }
  console.log(`  Length 50+: ${NG_THRESHOLDS[50] || MAX_NG_THRESHOLD}`);
  console.log(`  Length 100+: ${MAX_NG_THRESHOLD}`);
}

function formatOutput(results: any[], options: CLIOptions): string {
  switch (options.format) {
    case 'json':
      return JSON.stringify(results, null, 2);
    
    case 'csv':
      const hasOffsets = results.some(r => r.offset !== undefined);
      const headers = hasOffsets 
        ? 'string,score,threshold,valid,normalized,offset'
        : 'string,score,threshold,valid,normalized';
      const rows = results.map(r => {
        const baseRow = `"${r.originalString.replace(/"/g, '""')}",${r.score},${r.threshold},${r.isValid},"${r.normalizedString.replace(/"/g, '""')}"`;
        return hasOffsets ? `${baseRow},${r.offset || ''}` : baseRow;
      });
      return [headers, ...rows].join('\n');
    
    case 'text':
    default:
      if (options.verbose) {
        const hasOffsets = results.some(r => r.offset !== undefined);
        const headers = hasOffsets 
          ? ['String'.padEnd(20), 'Score'.padEnd(12), 'Threshold'.padEnd(12), 'Offset'.padEnd(10), 'Valid']
          : ['String'.padEnd(20), 'Score'.padEnd(12), 'Threshold'.padEnd(12), 'Valid'];
        
        const output = [headers.join('')];
        const separatorLength = hasOffsets ? 70 : 60;
        output.push('-'.repeat(separatorLength));
        
        for (const result of results) {
          const status = result.isValid ? '✓' : '✗';
          const row = [
            `"${result.originalString}"`.padEnd(20),
            result.score.toFixed(3).padEnd(12),
            result.threshold.toFixed(3).padEnd(12)
          ];
          
          if (hasOffsets) {
            row.push((result.offset !== undefined ? `0x${result.offset.toString(16).toUpperCase()}` : '').padEnd(10));
          }
          
          row.push(status);
          output.push(row.join(''));
        }
        
        return output.join('\n');
      } else {
        return results.map(r => r.originalString).join('\n');
      }
  }
}

// Run the CLI
if (require.main === module) {
  program.parse();
}

export { program };