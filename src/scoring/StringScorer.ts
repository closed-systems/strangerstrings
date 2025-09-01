import { TrigramModel } from '../model/TrigramModel';
import { StringAndScores } from '../utils/StringProcessor';
import { DEFAULT_LOG_VALUE, NG_THRESHOLDS, MAX_NG_THRESHOLD, MINIMUM_STRING_LENGTH } from '../utils/constants';

export class StringScorer {
  private model: TrigramModel;

  constructor(model: TrigramModel) {
    this.model = model;
  }

  public scoreString(stringAndScores: StringAndScores): void {
    const asciiCodes = stringAndScores.asciiCodes;
    
    let ngScore: number;
    
    if (asciiCodes.length < MINIMUM_STRING_LENGTH) {
      ngScore = DEFAULT_LOG_VALUE;
    } else {
      ngScore = this.calculateTrigrams(asciiCodes);
    }
    
    stringAndScores.ngramScore = ngScore;
    
    // Set threshold based on string length
    const strLen = stringAndScores.asciiCodes.length;
    const thresholdToUse = strLen >= NG_THRESHOLDS.length ? MAX_NG_THRESHOLD : NG_THRESHOLDS[strLen];
    stringAndScores.scoreThreshold = thresholdToUse;
  }

  public scoreStrings(strings: StringAndScores[]): void {
    for (const str of strings) {
      this.scoreString(str);
    }
  }

  private calculateTrigrams(asciiCodes: number[]): number {
    const stringLength = asciiCodes.length;
    const maxIndNgram = stringLength - 3;
    
    let localLikelihood = 0;
    
    // We can't calculate a score for strings less than length 3
    if (stringLength < MINIMUM_STRING_LENGTH) {
      return DEFAULT_LOG_VALUE;
    }
    
    // Add beginning of string trigram probability: [^] + first two chars
    localLikelihood += this.model.getBeginTrigramProb(asciiCodes[0], asciiCodes[1]);
    
    // Add all middle trigram probabilities
    let charIndex = 1;
    while (charIndex <= maxIndNgram) {
      localLikelihood += this.model.getTrigramProb(
        asciiCodes[charIndex], 
        asciiCodes[charIndex + 1], 
        asciiCodes[charIndex + 2]
      );
      charIndex++;
    }
    
    // Add end of string trigram probability: last two chars + [$]
    localLikelihood += this.model.getEndTrigramProb(
      asciiCodes[charIndex], 
      asciiCodes[charIndex + 1]
    );
    
    // Return average log probability per character
    return localLikelihood / stringLength;
  }

  public getModel(): TrigramModel {
    return this.model;
  }

  public static getMinimumStringLength(): number {
    return MINIMUM_STRING_LENGTH;
  }
}