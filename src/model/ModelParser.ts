import * as fs from 'fs';
import * as readline from 'readline';
import { ASCII_CHAR_COUNT, DESCRIPTION_TO_ASCII } from '../utils/constants';
import { TrigramCounts } from './TrigramModel';

export class ModelParser {
  private static readonly MODEL_TYPE_PREFIX = 'Model Type: ';
  private static readonly BEGIN_MARKER = '[^]';
  private static readonly END_MARKER = '[$]';

  public static async parseModelFile(filePath: string): Promise<{ counts: TrigramCounts; modelType: string }> {
    const counts: TrigramCounts = {
      trigramCounts: this.create3DArray(),
      beginTrigramCounts: this.create2DArray(),
      endTrigramCounts: this.create2DArray(),
      totalTrigrams: 0
    };
    
    let modelType = '';
    
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      if (line.startsWith('#')) {
        // Parse comment lines for model type
        if (line.includes(this.MODEL_TYPE_PREFIX)) {
          const prefixIndex = line.indexOf(this.MODEL_TYPE_PREFIX);
          modelType = line.substring(prefixIndex + this.MODEL_TYPE_PREFIX.length);
        }
        continue;
      }

      if (line.trim().length === 0) {
        continue;
      }

      const parts = line.split('\t');
      if (parts.length !== 4) {
        throw new Error(`Invalid line format in model file: ${line}`);
      }

      const count = parseInt(parts[3], 10);
      if (isNaN(count)) {
        throw new Error(`Invalid count in model file: ${line}`);
      }

      const chars = this.convertToAsciiCodes(parts);

      if (chars[0] === this.BEGIN_MARKER) {
        // Beginning of string trigram
        if (chars[2] !== this.END_MARKER) {
          const char1 = chars[1] as number;
          const char2 = chars[2] as number;
          counts.beginTrigramCounts[char1][char2] += count;
        }
      } else if (chars[2] === this.END_MARKER) {
        // End of string trigram
        const char1 = chars[0] as number;
        const char2 = chars[1] as number;
        counts.endTrigramCounts[char1][char2] += count;
      } else {
        // Regular trigram
        const char1 = chars[0] as number;
        const char2 = chars[1] as number;
        const char3 = chars[2] as number;
        counts.trigramCounts[char1][char2][char3] += count;
      }

      counts.totalTrigrams += count;
    }

    if (!modelType) {
      throw new Error('Model file does not contain model type');
    }

    return { counts, modelType };
  }

  public static parseModelString(content: string): { counts: TrigramCounts; modelType: string } {
    const counts: TrigramCounts = {
      trigramCounts: this.create3DArray(),
      beginTrigramCounts: this.create2DArray(),
      endTrigramCounts: this.create2DArray(),
      totalTrigrams: 0
    };
    
    let modelType = '';
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.startsWith('#')) {
        // Parse comment lines for model type
        if (line.includes(this.MODEL_TYPE_PREFIX)) {
          const prefixIndex = line.indexOf(this.MODEL_TYPE_PREFIX);
          modelType = line.substring(prefixIndex + this.MODEL_TYPE_PREFIX.length);
        }
        continue;
      }

      if (line.trim().length === 0) {
        continue;
      }

      const parts = line.split('\t');
      if (parts.length !== 4) {
        continue; // Skip invalid lines
      }

      const count = parseInt(parts[3], 10);
      if (isNaN(count)) {
        continue;
      }

      const chars = this.convertToAsciiCodes(parts);

      if (chars[0] === this.BEGIN_MARKER) {
        // Beginning of string trigram
        if (chars[2] !== this.END_MARKER) {
          const char1 = chars[1] as number;
          const char2 = chars[2] as number;
          counts.beginTrigramCounts[char1][char2] += count;
        }
      } else if (chars[2] === this.END_MARKER) {
        // End of string trigram
        const char1 = chars[0] as number;
        const char2 = chars[1] as number;
        counts.endTrigramCounts[char1][char2] += count;
      } else {
        // Regular trigram
        const char1 = chars[0] as number;
        const char2 = chars[1] as number;
        const char3 = chars[2] as number;
        counts.trigramCounts[char1][char2][char3] += count;
      }

      counts.totalTrigrams += count;
    }

    if (!modelType) {
      throw new Error('Model file does not contain model type');
    }

    return { counts, modelType };
  }

  private static convertToAsciiCodes(parts: string[]): (number | string)[] {
    const result: (number | string)[] = [];
    
    // Only convert first 3 parts (4th is the count)
    for (let i = 0; i < 3; i++) {
      const char = parts[i];
      if (!char) {
        throw new Error(`Missing character at position ${i}`);
      }
      
      if (char === this.BEGIN_MARKER || char === this.END_MARKER) {
        result.push(char);
      } else if (char.length > 1) {
        // Special character representation
        if (DESCRIPTION_TO_ASCII.has(char)) {
          result.push(DESCRIPTION_TO_ASCII.get(char)!);
        } else {
          throw new Error(`Unknown character representation: ${char}`);
        }
      } else {
        // Regular character
        result.push(char.charCodeAt(0));
      }
    }
    
    return result;
  }

  private static create3DArray(): number[][][] {
    const arr: number[][][] = [];
    for (let i = 0; i < ASCII_CHAR_COUNT; i++) {
      arr[i] = [];
      for (let j = 0; j < ASCII_CHAR_COUNT; j++) {
        arr[i][j] = new Array(ASCII_CHAR_COUNT).fill(0);
      }
    }
    return arr;
  }

  private static create2DArray(): number[][] {
    const arr: number[][] = [];
    for (let i = 0; i < ASCII_CHAR_COUNT; i++) {
      arr[i] = new Array(ASCII_CHAR_COUNT).fill(0);
    }
    return arr;
  }
}