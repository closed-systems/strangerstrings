import { describe, it, expect, beforeAll } from 'vitest';
import * as path from 'path';
import { StrangerStrings } from '../src/StrangerStrings';

describe('Integration Tests', () => {
  let analyzer: StrangerStrings;
  const modelPath = path.join(__dirname, '..', 'StringModel.sng');

  beforeAll(async () => {
    analyzer = new StrangerStrings();
    await analyzer.loadModel({ modelPath });
  });

  describe('analyzeString', () => {
    it('should recognize valid English words', () => {
      const result = analyzer.analyzeString('hello');
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(result.threshold);
    });

    it('should reject random character sequences', () => {
      const result = analyzer.analyzeString('.CRT$XIC');
      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThanOrEqual(result.threshold);
    });

    it('should reject obviously random sequences', () => {
      const result = analyzer.analyzeString('Ta&@');
      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThanOrEqual(result.threshold);
    });

    it('should accept meaningful strings with format specifiers', () => {
      const result = analyzer.analyzeString('total %qu');
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(result.threshold);
    });

    it('should accept valid identifier-like strings', () => {
      const result = analyzer.analyzeString('file_inherit');
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(result.threshold);
    });

    it('should handle strings too short for scoring', () => {
      const result = analyzer.analyzeString('ab');
      expect(result.score).toBe(-20); // DEFAULT_LOG_VALUE
    });

    it('should apply appropriate thresholds by length', () => {
      const result4 = analyzer.analyzeString('test');
      const result10 = analyzer.analyzeString('testtestte');
      
      expect(result4.threshold).toBe(-2.71); // Length 4 threshold
      expect(result10.threshold).toBe(-4.55); // Length 10 threshold
    });
  });

  describe('binary string extraction', () => {
    it('should extract strings from binary data', () => {
      // Create a buffer with some printable strings mixed with binary data
      const buffer = Buffer.from([
        // "hello" followed by null bytes
        0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x00, 0x00, 0x00,
        // Some binary data
        0xff, 0xfe, 0x01, 0x02,
        // "world test" with space
        0x77, 0x6f, 0x72, 0x6c, 0x64, 0x20, 0x74, 0x65, 0x73, 0x74,
        // More binary
        0x00, 0x00
      ]);

      const strings = analyzer.extractStringsFromBinary(buffer, 4);
      expect(strings.filter(x => x.string=="hello" && x.offset==0)).toBeTruthy();
      expect(strings.filter(x => x.string=="world test"&& x.offset==12)).toBeTruthy();

    });

    it('should analyze extracted binary strings', () => {
      const buffer = Buffer.from([
        // "function" - should be valid
        0x66, 0x75, 0x6e, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x00,
        // Some noise
        0xff, 0xfe,
        // Random characters - should be invalid
        0x41, 0x42, 0x40, 0x23, 0x24, 0x25, 0x00
      ]);

      const results = analyzer.analyzeBinaryFile(buffer);
      const validStrings = results.filter(r => r.isValid);
      const invalidStrings = results.filter(r => !r.isValid);

      expect(validStrings.length).toBeGreaterThan(0);
      expect(validStrings.some(r => r.originalString === 'function')).toBe(true);
    });
  });

  describe('model information', () => {
    it('should provide model information', () => {
      const info = analyzer.getModelInfo();
      expect(info.type).toBe('lowercase');
      expect(info.isLowerCase).toBe(true);
    });
  });
});