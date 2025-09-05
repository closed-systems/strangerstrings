export { StrangerStrings, StringAnalysisOptions, StringAnalysisResult } from './StrangerStrings';
export { TrigramModel, TrigramCounts, TrigramProbabilities } from './model/TrigramModel';
export { ModelParser } from './model/ModelParser';
export { StringScorer } from './scoring/StringScorer';
export { StringProcessor, StringAndScores } from './utils/StringProcessor';
export * from './utils/constants';
import { StringAnalysisResult } from './StrangerStrings';
export declare function analyzeStringsWithModel(candidateStrings: string[], modelPath: string): Promise<StringAnalysisResult[]>;
export declare function analyzeBinaryWithModel(buffer: Buffer, modelPath: string, minLength?: number): Promise<StringAnalysisResult[]>;
export declare const VERSION = "1.0.0";
//# sourceMappingURL=index.d.ts.map