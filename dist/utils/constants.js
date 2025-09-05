"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_NG_THRESHOLD = exports.NG_THRESHOLDS = exports.DESCRIPTION_TO_ASCII = exports.ASCII_TO_DESCRIPTION = exports.MINIMUM_STRING_LENGTH = exports.DEFAULT_LOG_VALUE = exports.ASCII_CHAR_COUNT = void 0;
exports.ASCII_CHAR_COUNT = 128;
exports.DEFAULT_LOG_VALUE = -20;
exports.MINIMUM_STRING_LENGTH = 3;
// Special character mappings from ASCII codes to display representations
exports.ASCII_TO_DESCRIPTION = new Map([
    [0, ['[NUL]', 'null']],
    [1, ['[SOH]', 'start of header']],
    [2, ['[STX]', 'start of text']],
    [3, ['[ETX]', 'end of text']],
    [4, ['[EOT]', 'end of transmission']],
    [5, ['[ENQ]', 'enquiry']],
    [6, ['[ACK]', 'acknowledgement']],
    [7, ['[BEL]', 'bell']],
    [8, ['[BS]', 'backspace']],
    [9, ['[HT]', 'horizontal tab']],
    [10, ['[LF]', 'line feed']],
    [11, ['[VT]', 'vertical tab']],
    [12, ['[FF]', 'form feed']],
    [13, ['[CR]', 'carriage return']],
    [14, ['[SO]', 'shift out']],
    [15, ['[SI]', 'shift in']],
    [16, ['[DLE]', 'data link escape']],
    [17, ['[DC1]', 'device control 1']],
    [18, ['[DC2]', 'device control 2']],
    [19, ['[DC3]', 'device control 3']],
    [20, ['[DC4]', 'device control 4']],
    [21, ['[NAK]', 'negative acknowledge']],
    [22, ['[SYN]', 'synchronous idle']],
    [23, ['[ETB]', 'end of transmission block']],
    [24, ['[CAN]', 'cancel']],
    [25, ['[EM]', 'end of medium']],
    [26, ['[SUB]', 'substitute']],
    [27, ['[ESC]', 'escape']],
    [28, ['[FS]', 'file separator']],
    [29, ['[GS]', 'group separator']],
    [30, ['[RS]', 'record separator']],
    [31, ['[US]', 'unit separator']],
    [32, ['[SP]', 'space']],
    [127, ['[DEL]', 'delete']]
]);
// Reverse mapping for parsing model files
exports.DESCRIPTION_TO_ASCII = new Map(Array.from(exports.ASCII_TO_DESCRIPTION.entries()).map(([key, [desc]]) => [desc, key]));
// Thresholds by string length (index represents string length)
// Strings < 4 use threshold of 10 (impossible to pass since scores are negative)
exports.NG_THRESHOLDS = Object.freeze([
    10.0, 10.0, 10.0, 10.0, -2.71, -3.26, -3.52, -3.84, -4.23, -4.49, // 0 - 9
    -4.55, -4.74, -4.88, -5.03, -5.06, -5.2, -5.24, -5.29, -5.29, -5.42, // 10 - 19
    -5.51, -5.52, -5.53, -5.6, -5.6, -5.62, -5.7, -5.7, -5.78, -5.79, // 20 - 29
    -5.81, -5.81, -5.84, -5.85, -5.86, -5.88, -5.92, -5.92, -5.93, -5.95, // 30 - 39
    -5.99, -6.0, -6.0, -6.0, -6.02, -6.02, -6.02, -6.05, -6.06, -6.07, // 40 - 49
    -6.08, -6.1, -6.12, -6.12, -6.13, -6.13, -6.13, -6.13, -6.13, -6.13, // 50 - 59
    -6.13, -6.15, -6.15, -6.16, -6.16, -6.16, -6.17, -6.19, -6.19, -6.21, // 60 - 69
    -6.21, -6.21, -6.21, -6.21, -6.21, -6.25, -6.25, -6.25, -6.25, -6.25, // 70 - 79 
    -6.25, -6.25, -6.26, -6.26, -6.26, -6.26, -6.26, -6.26, -6.26, -6.26, // 80 - 89
    -6.26, -6.29, -6.29, -6.3, -6.3, -6.3, -6.3, -6.3, -6.3, -6.3, -6.3 // 90 - 100
]);
exports.MAX_NG_THRESHOLD = -6.3;
//# sourceMappingURL=constants.js.map