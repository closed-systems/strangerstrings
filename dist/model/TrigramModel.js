"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrigramModel = void 0;
const constants_1 = require("../utils/constants");
class TrigramModel {
    constructor() {
        this.modelType = '';
        this.isLowerCase = false;
        // Initialize arrays for log probabilities
        this.trigramProbs = this.create3DArray();
        this.beginTrigramProbs = this.create2DArray();
        this.endTrigramProbs = this.create2DArray();
    }
    create3DArray() {
        const arr = [];
        for (let i = 0; i < constants_1.ASCII_CHAR_COUNT; i++) {
            arr[i] = [];
            for (let j = 0; j < constants_1.ASCII_CHAR_COUNT; j++) {
                arr[i][j] = new Array(constants_1.ASCII_CHAR_COUNT).fill(0);
            }
        }
        return arr;
    }
    create2DArray() {
        const arr = [];
        for (let i = 0; i < constants_1.ASCII_CHAR_COUNT; i++) {
            arr[i] = new Array(constants_1.ASCII_CHAR_COUNT).fill(0);
        }
        return arr;
    }
    loadFromCounts(counts, modelType) {
        this.modelType = modelType;
        this.isLowerCase = modelType.toLowerCase() === 'lowercase';
        // Create copies of the counts for smoothing
        const trigramCounts = this.deepCopy3D(counts.trigramCounts);
        const beginTrigramCounts = this.deepCopy2D(counts.beginTrigramCounts);
        const endTrigramCounts = this.deepCopy2D(counts.endTrigramCounts);
        let totalTrigrams = counts.totalTrigrams;
        // Apply Laplace smoothing (add 1 to all zero counts)
        for (let i = 0; i < constants_1.ASCII_CHAR_COUNT; i++) {
            for (let j = 0; j < constants_1.ASCII_CHAR_COUNT; j++) {
                if (beginTrigramCounts[i][j] === 0) {
                    beginTrigramCounts[i][j] = 1;
                    totalTrigrams++;
                }
                if (endTrigramCounts[i][j] === 0) {
                    endTrigramCounts[i][j] = 1;
                    totalTrigrams++;
                }
                for (let k = 0; k < constants_1.ASCII_CHAR_COUNT; k++) {
                    if (trigramCounts[i][j][k] === 0) {
                        trigramCounts[i][j][k] = 1;
                        totalTrigrams++;
                    }
                }
            }
        }
        // Calculate log probabilities (base 10)
        for (let i = 0; i < constants_1.ASCII_CHAR_COUNT; i++) {
            for (let j = 0; j < constants_1.ASCII_CHAR_COUNT; j++) {
                this.beginTrigramProbs[i][j] = Math.log10(beginTrigramCounts[i][j] / totalTrigrams);
                this.endTrigramProbs[i][j] = Math.log10(endTrigramCounts[i][j] / totalTrigrams);
                for (let k = 0; k < constants_1.ASCII_CHAR_COUNT; k++) {
                    this.trigramProbs[i][j][k] = Math.log10(trigramCounts[i][j][k] / totalTrigrams);
                }
            }
        }
    }
    deepCopy3D(arr) {
        const copy = [];
        for (let i = 0; i < arr.length; i++) {
            copy[i] = [];
            for (let j = 0; j < arr[i].length; j++) {
                copy[i][j] = [...arr[i][j]];
            }
        }
        return copy;
    }
    deepCopy2D(arr) {
        return arr.map(row => [...row]);
    }
    getTrigramProb(char1, char2, char3) {
        return this.trigramProbs[char1][char2][char3];
    }
    getBeginTrigramProb(char1, char2) {
        return this.beginTrigramProbs[char1][char2];
    }
    getEndTrigramProb(char1, char2) {
        return this.endTrigramProbs[char1][char2];
    }
    getModelType() {
        return this.modelType;
    }
    isLowerCaseModel() {
        return this.isLowerCase;
    }
    getProbabilities() {
        return {
            trigramProbs: this.trigramProbs,
            beginTrigramProbs: this.beginTrigramProbs,
            endTrigramProbs: this.endTrigramProbs
        };
    }
}
exports.TrigramModel = TrigramModel;
//# sourceMappingURL=TrigramModel.js.map