import { TrigramModel } from './model/TrigramModel';
import { ModelParser } from './model/ModelParser';
import { StringScorer } from './scoring/StringScorer';
import { StringProcessor, StringAndScores } from './utils/StringProcessor';

export interface StringAnalysisOptions {
  modelPath?: string;
  modelContent?: string;
  minimumLength?: number;
}

export interface StringAnalysisResult {
  originalString: string;
  score: number;
  threshold: number;
  isValid: boolean;
  normalizedString: string;
  offset?: number; // File offset where string was found
}

export class StrangerStrings {
  private model: TrigramModel;
  private scorer: StringScorer;
  private isInitialized: boolean = false;

  constructor() {
    this.model = new TrigramModel();
    this.scorer = new StringScorer(this.model);
  }

  public async loadModel(options: StringAnalysisOptions): Promise<void> {
    if (options.modelPath) {
      const { counts, modelType } = await ModelParser.parseModelFile(options.modelPath);
      this.model.loadFromCounts(counts, modelType);
    } else if (options.modelContent) {
      const { counts, modelType } = ModelParser.parseModelString(options.modelContent);
      this.model.loadFromCounts(counts, modelType);
    } else {
      throw new Error('Either modelPath or modelContent must be provided');
    }
    
    this.isInitialized = true;
  }

  public analyzeString(candidateString: string, offset?: number): StringAnalysisResult {
    if (!this.isInitialized) {
      throw new Error('Model must be loaded before analyzing strings');
    }

    const processedString = StringProcessor.processString(candidateString, this.model.isLowerCaseModel());
    this.scorer.scoreString(processedString);

    const result: StringAnalysisResult = {
      originalString: processedString.originalString,
      score: processedString.ngramScore,
      threshold: processedString.scoreThreshold,
      isValid: StringProcessor.isScoreAboveThreshold(processedString),
      normalizedString: processedString.scoredString
    };
    
    if (offset !== undefined) {
      result.offset = offset;
    }
    
    return result;
  }

  public analyzeStrings(candidateStrings: string[]): StringAnalysisResult[] {
    if (!this.isInitialized) {
      throw new Error('Model must be loaded before analyzing strings');
    }

    const results: StringAnalysisResult[] = [];
    
    for (const candidateString of candidateStrings) {
      results.push(this.analyzeString(candidateString));
    }

    return results;
  }

  public extractValidStrings(candidateStrings: string[]): StringAnalysisResult[] {
    const results = this.analyzeStrings(candidateStrings);
    return results.filter(result => result.isValid);
  }

  public getModelInfo(): { type: string; isLowerCase: boolean } {
    if (!this.isInitialized) {
      throw new Error('Model must be loaded before getting model info');
    }

    return {
      type: this.model.getModelType(),
      isLowerCase: this.model.isLowerCaseModel()
    };
  }

  // Binary file analysis utility
  public extractStringsFromBinary(buffer: Buffer, minLength: number = 4): { string: string; offset: number }[] {
    const strings: { string: string; offset: number }[] = [];
    let currentString = '';
    let stringStartOffset = 0;
    
    for (let i = 0; i < buffer.length; i++) {
      const byte = buffer[i];
      if (byte === undefined) continue;
      
      // Check if byte is printable ASCII (excluding control characters except space and tab)
      if ((byte >= 32 && byte <= 126) || byte === 9) {
        if (currentString.length === 0) {
          stringStartOffset = i; // Mark start of new string
        }
        currentString += String.fromCharCode(byte);
      } else {
        // Non-printable character - end current string if it meets minimum length
        if (currentString.length >= minLength) {
          strings.push({ string: currentString, offset: stringStartOffset });
        }
        currentString = '';
      }
    }
    
    // Don't forget the last string if we hit EOF
    if (currentString.length >= minLength) {
      strings.push({ string: currentString, offset: stringStartOffset });
    }
    
    return strings;
  }

  public analyzeBinaryFile(buffer: Buffer, options: { minLength?: number } = {}): StringAnalysisResult[] {
    const minLength = options.minLength || 4;
    const candidateStrings = this.extractStringsFromBinary(buffer, minLength);
    
    // Analyze each string with its offset
    const results: StringAnalysisResult[] = [];
    for (const { string, offset } of candidateStrings) {
      const result = this.analyzeString(string, offset);
      // Return all results, both valid and rejected
      results.push(result);
    }
    
    return results;
  }
}