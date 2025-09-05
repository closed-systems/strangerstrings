"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringScorer = void 0;
const constants_1 = require("../utils/constants");
class StringScorer {
    constructor(model) {
        this.model = model;
    }
    scoreString(stringAndScores) {
        const asciiCodes = stringAndScores.asciiCodes;
        let ngScore;
        if (asciiCodes.length < constants_1.MINIMUM_STRING_LENGTH) {
            ngScore = constants_1.DEFAULT_LOG_VALUE;
        }
        else {
            ngScore = this.calculateTrigrams(asciiCodes);
        }
        stringAndScores.ngramScore = ngScore;
        // Set threshold based on string length
        const strLen = stringAndScores.asciiCodes.length;
        const thresholdToUse = strLen >= constants_1.NG_THRESHOLDS.length ? constants_1.MAX_NG_THRESHOLD : constants_1.NG_THRESHOLDS[strLen];
        stringAndScores.scoreThreshold = thresholdToUse;
    }
    scoreStrings(strings) {
        for (const str of strings) {
            this.scoreString(str);
        }
    }
    calculateTrigrams(asciiCodes) {
        const stringLength = asciiCodes.length;
        const maxIndNgram = stringLength - 3;
        let localLikelihood = 0;
        // We can't calculate a score for strings less than length 3
        if (stringLength < constants_1.MINIMUM_STRING_LENGTH) {
            return constants_1.DEFAULT_LOG_VALUE;
        }
        // Add beginning of string trigram probability: [^] + first two chars
        localLikelihood += this.model.getBeginTrigramProb(asciiCodes[0], asciiCodes[1]);
        // Add all middle trigram probabilities
        let charIndex = 1;
        while (charIndex <= maxIndNgram) {
            localLikelihood += this.model.getTrigramProb(asciiCodes[charIndex], asciiCodes[charIndex + 1], asciiCodes[charIndex + 2]);
            charIndex++;
        }
        // Add end of string trigram probability: last two chars + [$]
        localLikelihood += this.model.getEndTrigramProb(asciiCodes[charIndex], asciiCodes[charIndex + 1]);
        // Return average log probability per character
        return localLikelihood / stringLength;
    }
    getModel() {
        return this.model;
    }
    static getMinimumStringLength() {
        return constants_1.MINIMUM_STRING_LENGTH;
    }
}
exports.StringScorer = StringScorer;
//# sourceMappingURL=StringScorer.js.map