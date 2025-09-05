import { TrigramCounts } from './TrigramModel';
export declare class ModelParser {
    private static readonly MODEL_TYPE_PREFIX;
    private static readonly BEGIN_MARKER;
    private static readonly END_MARKER;
    static parseModelFile(filePath: string): Promise<{
        counts: TrigramCounts;
        modelType: string;
    }>;
    static parseModelString(content: string): {
        counts: TrigramCounts;
        modelType: string;
    };
    private static convertToAsciiCodes;
    private static create3DArray;
    private static create2DArray;
}
//# sourceMappingURL=ModelParser.d.ts.map