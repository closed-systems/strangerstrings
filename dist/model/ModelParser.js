"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelParser = void 0;
const fs = __importStar(require("fs"));
const readline = __importStar(require("readline"));
const constants_1 = require("../utils/constants");
class ModelParser {
    static async parseModelFile(filePath) {
        const counts = {
            trigramCounts: this.create3DArray(),
            beginTrigramCounts: this.create2DArray(),
            endTrigramCounts: this.create2DArray(),
            totalTrigrams: 0
        };
        let modelType = '';
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        for await (const line of rl) {
            if (line.startsWith('#')) {
                // Parse comment lines for model type
                if (line.includes(this.MODEL_TYPE_PREFIX)) {
                    const prefixIndex = line.indexOf(this.MODEL_TYPE_PREFIX);
                    modelType = line.substring(prefixIndex + this.MODEL_TYPE_PREFIX.length);
                }
                continue;
            }
            if (line.trim().length === 0) {
                continue;
            }
            const parts = line.split('\t');
            if (parts.length !== 4) {
                throw new Error(`Invalid line format in model file: ${line}`);
            }
            const count = parseInt(parts[3], 10);
            if (isNaN(count)) {
                throw new Error(`Invalid count in model file: ${line}`);
            }
            const chars = this.convertToAsciiCodes(parts);
            if (chars[0] === this.BEGIN_MARKER) {
                // Beginning of string trigram
                if (chars[2] !== this.END_MARKER) {
                    const char1 = chars[1];
                    const char2 = chars[2];
                    counts.beginTrigramCounts[char1][char2] += count;
                }
            }
            else if (chars[2] === this.END_MARKER) {
                // End of string trigram
                const char1 = chars[0];
                const char2 = chars[1];
                counts.endTrigramCounts[char1][char2] += count;
            }
            else {
                // Regular trigram
                const char1 = chars[0];
                const char2 = chars[1];
                const char3 = chars[2];
                counts.trigramCounts[char1][char2][char3] += count;
            }
            counts.totalTrigrams += count;
        }
        if (!modelType) {
            throw new Error('Model file does not contain model type');
        }
        return { counts, modelType };
    }
    static parseModelString(content) {
        const counts = {
            trigramCounts: this.create3DArray(),
            beginTrigramCounts: this.create2DArray(),
            endTrigramCounts: this.create2DArray(),
            totalTrigrams: 0
        };
        let modelType = '';
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.startsWith('#')) {
                // Parse comment lines for model type
                if (line.includes(this.MODEL_TYPE_PREFIX)) {
                    const prefixIndex = line.indexOf(this.MODEL_TYPE_PREFIX);
                    modelType = line.substring(prefixIndex + this.MODEL_TYPE_PREFIX.length);
                }
                continue;
            }
            if (line.trim().length === 0) {
                continue;
            }
            const parts = line.split('\t');
            if (parts.length !== 4) {
                continue; // Skip invalid lines
            }
            const count = parseInt(parts[3], 10);
            if (isNaN(count)) {
                continue;
            }
            const chars = this.convertToAsciiCodes(parts);
            if (chars[0] === this.BEGIN_MARKER) {
                // Beginning of string trigram
                if (chars[2] !== this.END_MARKER) {
                    const char1 = chars[1];
                    const char2 = chars[2];
                    counts.beginTrigramCounts[char1][char2] += count;
                }
            }
            else if (chars[2] === this.END_MARKER) {
                // End of string trigram
                const char1 = chars[0];
                const char2 = chars[1];
                counts.endTrigramCounts[char1][char2] += count;
            }
            else {
                // Regular trigram
                const char1 = chars[0];
                const char2 = chars[1];
                const char3 = chars[2];
                counts.trigramCounts[char1][char2][char3] += count;
            }
            counts.totalTrigrams += count;
        }
        if (!modelType) {
            throw new Error('Model file does not contain model type');
        }
        return { counts, modelType };
    }
    static convertToAsciiCodes(parts) {
        const result = [];
        // Only convert first 3 parts (4th is the count)
        for (let i = 0; i < 3; i++) {
            const char = parts[i];
            if (!char) {
                throw new Error(`Missing character at position ${i}`);
            }
            if (char === this.BEGIN_MARKER || char === this.END_MARKER) {
                result.push(char);
            }
            else if (char.length > 1) {
                // Special character representation
                if (constants_1.DESCRIPTION_TO_ASCII.has(char)) {
                    result.push(constants_1.DESCRIPTION_TO_ASCII.get(char));
                }
                else {
                    throw new Error(`Unknown character representation: ${char}`);
                }
            }
            else {
                // Regular character
                result.push(char.charCodeAt(0));
            }
        }
        return result;
    }
    static create3DArray() {
        const arr = [];
        for (let i = 0; i < constants_1.ASCII_CHAR_COUNT; i++) {
            arr[i] = [];
            for (let j = 0; j < constants_1.ASCII_CHAR_COUNT; j++) {
                arr[i][j] = new Array(constants_1.ASCII_CHAR_COUNT).fill(0);
            }
        }
        return arr;
    }
    static create2DArray() {
        const arr = [];
        for (let i = 0; i < constants_1.ASCII_CHAR_COUNT; i++) {
            arr[i] = new Array(constants_1.ASCII_CHAR_COUNT).fill(0);
        }
        return arr;
    }
}
exports.ModelParser = ModelParser;
ModelParser.MODEL_TYPE_PREFIX = 'Model Type: ';
ModelParser.BEGIN_MARKER = '[^]';
ModelParser.END_MARKER = '[$]';
//# sourceMappingURL=ModelParser.js.map