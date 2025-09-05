export interface StringAndScores {
    originalString: string;
    scoredString: string;
    asciiCodes: number[];
    ngramScore: number;
    scoreThreshold: number;
}
export declare class StringProcessor {
    static processString(str: string, isLowerCaseModel: boolean): StringAndScores;
    private static replaceInvalidAscii;
    private static normalizeSpaces;
    private static convertToAsciiCodes;
    static isScoreAboveThreshold(stringAndScores: StringAndScores): boolean;
}
//# sourceMappingURL=StringProcessor.d.ts.map