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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = exports.StringProcessor = exports.StringScorer = exports.ModelParser = exports.TrigramModel = exports.StrangerStrings = void 0;
exports.analyzeStringsWithModel = analyzeStringsWithModel;
exports.analyzeBinaryWithModel = analyzeBinaryWithModel;
// Main exports
var StrangerStrings_1 = require("./StrangerStrings");
Object.defineProperty(exports, "StrangerStrings", { enumerable: true, get: function () { return StrangerStrings_1.StrangerStrings; } });
// Core components
var TrigramModel_1 = require("./model/TrigramModel");
Object.defineProperty(exports, "TrigramModel", { enumerable: true, get: function () { return TrigramModel_1.TrigramModel; } });
var ModelParser_1 = require("./model/ModelParser");
Object.defineProperty(exports, "ModelParser", { enumerable: true, get: function () { return ModelParser_1.ModelParser; } });
var StringScorer_1 = require("./scoring/StringScorer");
Object.defineProperty(exports, "StringScorer", { enumerable: true, get: function () { return StringScorer_1.StringScorer; } });
var StringProcessor_1 = require("./utils/StringProcessor");
Object.defineProperty(exports, "StringProcessor", { enumerable: true, get: function () { return StringProcessor_1.StringProcessor; } });
// Constants and utilities
__exportStar(require("./utils/constants"), exports);
// Convenience function for quick analysis
const StrangerStrings_2 = require("./StrangerStrings");
async function analyzeStringsWithModel(candidateStrings, modelPath) {
    const analyzer = new StrangerStrings_2.StrangerStrings();
    await analyzer.loadModel({ modelPath });
    return analyzer.analyzeStrings(candidateStrings);
}
async function analyzeBinaryWithModel(buffer, modelPath, minLength = 4) {
    const analyzer = new StrangerStrings_2.StrangerStrings();
    await analyzer.loadModel({ modelPath });
    return analyzer.analyzeBinaryFile(buffer, { minLength });
}
// Version info
exports.VERSION = '1.0.0';
//# sourceMappingURL=index.js.map