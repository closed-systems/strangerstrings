// Main exports
export { StrangerStrings, StringAnalysisOptions, StringAnalysisResult } from './StrangerStrings';

// Core components
export { TrigramModel, TrigramCounts, TrigramProbabilities } from './model/TrigramModel';
export { ModelParser } from './model/ModelParser';
export { StringScorer } from './scoring/StringScorer';
export { StringProcessor, StringAndScores } from './utils/StringProcessor';

// Constants and utilities
export * from './utils/constants';

// Convenience function for quick analysis
import { StrangerStrings, StringAnalysisResult } from './StrangerStrings';

export async function analyzeStringsWithModel(
  candidateStrings: string[],
  modelPath: string
): Promise<StringAnalysisResult[]> {
  const analyzer = new StrangerStrings();
  await analyzer.loadModel({ modelPath });
  return analyzer.analyzeStrings(candidateStrings);
}

export async function analyzeBinaryWithModel(
  buffer: Buffer,
  modelPath: string,
  minLength: number = 4
): Promise<StringAnalysisResult[]> {
  const analyzer = new StrangerStrings();
  await analyzer.loadModel({ modelPath });
  return analyzer.analyzeBinaryFile(buffer, { minLength });
}

// Version info
export const VERSION = '1.0.0';