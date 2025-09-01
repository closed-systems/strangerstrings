export interface StringAndScores {
  originalString: string;
  scoredString: string;
  asciiCodes: number[];
  ngramScore: number;
  scoreThreshold: number;
}

export class StringProcessor {
  public static processString(str: string, isLowerCaseModel: boolean): StringAndScores {
    const originalString = str;
    let scoredString = isLowerCaseModel ? originalString.toLowerCase() : originalString;

    // Check if all characters are ASCII and replace non-ASCII with spaces
    if (!scoredString.match(/^[\x00-\x7F]*$/)) {
      scoredString = this.replaceInvalidAscii(scoredString);
    }

    // Normalize spaces and tabs
    scoredString = this.normalizeSpaces(scoredString);

    // Convert to ASCII codes
    const asciiCodes = this.convertToAsciiCodes(scoredString);

    return {
      originalString,
      scoredString,
      asciiCodes,
      ngramScore: -100, // Will be set by scorer
      scoreThreshold: 10 // Will be set by scorer
    };
  }

  private static replaceInvalidAscii(str: string): string {
    const chars = str.split('');
    return chars.map(char => {
      const code = char.charCodeAt(0);
      return (code >= 0 && code <= 127) ? char : ' ';
    }).join('');
  }

  private static normalizeSpaces(str: string): string {
    // Remove leading and trailing spaces
    let normalized = str.trim();

    // Collapse consecutive spaces into 1 space
    normalized = normalized.replace(/ {2,}/g, ' ');

    // Collapse consecutive tabs into 1 tab
    normalized = normalized.replace(/\t{2,}/g, '\t');

    return normalized;
  }

  private static convertToAsciiCodes(str: string): number[] {
    const codes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      codes.push(str.charCodeAt(i));
    }
    return codes;
  }

  public static isScoreAboveThreshold(stringAndScores: StringAndScores): boolean {
    return stringAndScores.ngramScore > stringAndScores.scoreThreshold;
  }
}