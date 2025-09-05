import { TrigramModel } from '../model/TrigramModel';
import { StringAndScores } from '../utils/StringProcessor';
export declare class StringScorer {
    private model;
    constructor(model: TrigramModel);
    scoreString(stringAndScores: StringAndScores): void;
    scoreStrings(strings: StringAndScores[]): void;
    private calculateTrigrams;
    getModel(): TrigramModel;
    static getMinimumStringLength(): number;
}
//# sourceMappingURL=StringScorer.d.ts.map