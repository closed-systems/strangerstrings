"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrangerStrings = void 0;
const TrigramModel_1 = require("./model/TrigramModel");
const ModelParser_1 = require("./model/ModelParser");
const StringScorer_1 = require("./scoring/StringScorer");
const StringProcessor_1 = require("./utils/StringProcessor");
class StrangerStrings {
    constructor() {
        this.isInitialized = false;
        this.model = new TrigramModel_1.TrigramModel();
        this.scorer = new StringScorer_1.StringScorer(this.model);
    }
    async loadModel(options) {
        if (options.modelPath) {
            const { counts, modelType } = await ModelParser_1.ModelParser.parseModelFile(options.modelPath);
            this.model.loadFromCounts(counts, modelType);
        }
        else if (options.modelContent) {
            const { counts, modelType } = ModelParser_1.ModelParser.parseModelString(options.modelContent);
            this.model.loadFromCounts(counts, modelType);
        }
        else {
            throw new Error('Either modelPath or modelContent must be provided');
        }
        this.isInitialized = true;
    }
    analyzeString(candidateString, offset) {
        if (!this.isInitialized) {
            throw new Error('Model must be loaded before analyzing strings');
        }
        const processedString = StringProcessor_1.StringProcessor.processString(candidateString, this.model.isLowerCaseModel());
        this.scorer.scoreString(processedString);
        const result = {
            originalString: processedString.originalString,
            score: processedString.ngramScore,
            threshold: processedString.scoreThreshold,
            isValid: StringProcessor_1.StringProcessor.isScoreAboveThreshold(processedString),
            normalizedString: processedString.scoredString
        };
        if (offset !== undefined) {
            result.offset = offset;
        }
        return result;
    }
    analyzeStrings(candidateStrings) {
        if (!this.isInitialized) {
            throw new Error('Model must be loaded before analyzing strings');
        }
        const results = [];
        for (const candidateString of candidateStrings) {
            results.push(this.analyzeString(candidateString));
        }
        return results;
    }
    extractValidStrings(candidateStrings) {
        const results = this.analyzeStrings(candidateStrings);
        return results.filter(result => result.isValid);
    }
    getModelInfo() {
        if (!this.isInitialized) {
            throw new Error('Model must be loaded before getting model info');
        }
        return {
            type: this.model.getModelType(),
            isLowerCase: this.model.isLowerCaseModel()
        };
    }
    // Binary file analysis utility
    extractStringsFromBinary(buffer, minLength = 4) {
        const strings = [];
        let currentString = '';
        let stringStartOffset = 0;
        for (let i = 0; i < buffer.length; i++) {
            const byte = buffer[i];
            if (byte === undefined)
                continue;
            // Check if byte is printable ASCII (excluding control characters except space and tab)
            if ((byte >= 32 && byte <= 126) || byte === 9) {
                if (currentString.length === 0) {
                    stringStartOffset = i; // Mark start of new string
                }
                currentString += String.fromCharCode(byte);
            }
            else {
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
    analyzeBinaryFile(buffer, options = {}) {
        const minLength = options.minLength || 4;
        const candidateStrings = this.extractStringsFromBinary(buffer, minLength);
        // Analyze each string with its offset
        const results = [];
        for (const { string, offset } of candidateStrings) {
            const result = this.analyzeString(string, offset);
            // Return all results, both valid and rejected
            results.push(result);
        }
        return results;
    }
}
exports.StrangerStrings = StrangerStrings;
//# sourceMappingURL=StrangerStrings.js.map