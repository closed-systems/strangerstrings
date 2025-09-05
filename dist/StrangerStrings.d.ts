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
    offset?: number;
}
export declare class StrangerStrings {
    private model;
    private scorer;
    private isInitialized;
    constructor();
    loadModel(options: StringAnalysisOptions): Promise<void>;
    analyzeString(candidateString: string, offset?: number): StringAnalysisResult;
    analyzeStrings(candidateStrings: string[]): StringAnalysisResult[];
    extractValidStrings(candidateStrings: string[]): StringAnalysisResult[];
    getModelInfo(): {
        type: string;
        isLowerCase: boolean;
    };
    extractStringsFromBinary(buffer: Buffer, minLength?: number): {
        string: string;
        offset: number;
    }[];
    analyzeBinaryFile(buffer: Buffer, options?: {
        minLength?: number;
    }): StringAnalysisResult[];
}
//# sourceMappingURL=StrangerStrings.d.ts.map