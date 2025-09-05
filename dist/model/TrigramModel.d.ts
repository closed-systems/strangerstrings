export interface TrigramCounts {
    trigramCounts: number[][][];
    beginTrigramCounts: number[][];
    endTrigramCounts: number[][];
    totalTrigrams: number;
}
export interface TrigramProbabilities {
    trigramProbs: number[][][];
    beginTrigramProbs: number[][];
    endTrigramProbs: number[][];
}
export declare class TrigramModel {
    private trigramProbs;
    private beginTrigramProbs;
    private endTrigramProbs;
    private modelType;
    private isLowerCase;
    constructor();
    private create3DArray;
    private create2DArray;
    loadFromCounts(counts: TrigramCounts, modelType: string): void;
    private deepCopy3D;
    private deepCopy2D;
    getTrigramProb(char1: number, char2: number, char3: number): number;
    getBeginTrigramProb(char1: number, char2: number): number;
    getEndTrigramProb(char1: number, char2: number): number;
    getModelType(): string;
    isLowerCaseModel(): boolean;
    getProbabilities(): TrigramProbabilities;
}
//# sourceMappingURL=TrigramModel.d.ts.map