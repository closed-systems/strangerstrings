"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringProcessor = void 0;
class StringProcessor {
    static processString(str, isLowerCaseModel) {
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
    static replaceInvalidAscii(str) {
        const chars = str.split('');
        return chars.map(char => {
            const code = char.charCodeAt(0);
            return (code >= 0 && code <= 127) ? char : ' ';
        }).join('');
    }
    static normalizeSpaces(str) {
        // Remove leading and trailing spaces
        let normalized = str.trim();
        // Collapse consecutive spaces into 1 space
        normalized = normalized.replace(/ {2,}/g, ' ');
        // Collapse consecutive tabs into 1 tab
        normalized = normalized.replace(/\t{2,}/g, '\t');
        return normalized;
    }
    static convertToAsciiCodes(str) {
        const codes = [];
        for (let i = 0; i < str.length; i++) {
            codes.push(str.charCodeAt(i));
        }
        return codes;
    }
    static isScoreAboveThreshold(stringAndScores) {
        return stringAndScores.ngramScore > stringAndScores.scoreThreshold;
    }
}
exports.StringProcessor = StringProcessor;
//# sourceMappingURL=StringProcessor.js.map