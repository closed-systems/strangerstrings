import { describe, it, expect } from 'vitest';
import { StringProcessor } from '../src/utils/StringProcessor';

describe('StringProcessor', () => {
  describe('processString', () => {
    it('should process basic ASCII string', () => {
      const result = StringProcessor.processString('hello', false);
      
      expect(result.originalString).toBe('hello');
      expect(result.scoredString).toBe('hello');
      expect(result.asciiCodes).toEqual([104, 101, 108, 108, 111]); // h,e,l,l,o
    });

    it('should convert to lowercase when using lowercase model', () => {
      const result = StringProcessor.processString('Hello', true);
      
      expect(result.originalString).toBe('Hello');
      expect(result.scoredString).toBe('hello');
      expect(result.asciiCodes).toEqual([104, 101, 108, 108, 111]);
    });

    it('should not convert to lowercase when not using lowercase model', () => {
      const result = StringProcessor.processString('Hello', false);
      
      expect(result.originalString).toBe('Hello');
      expect(result.scoredString).toBe('Hello');
      expect(result.asciiCodes).toEqual([72, 101, 108, 108, 111]); // H,e,l,l,o
    });

    it('should normalize spaces', () => {
      const result = StringProcessor.processString('  hello   world  ', false);
      
      expect(result.scoredString).toBe('hello world');
    });

    it('should collapse multiple spaces', () => {
      const result = StringProcessor.processString('hello    world', false);
      
      expect(result.scoredString).toBe('hello world');
    });

    it('should collapse multiple tabs', () => {
      const result = StringProcessor.processString('hello\t\t\tworld', false);
      
      expect(result.scoredString).toBe('hello\tworld');
    });

    it('should replace non-ASCII characters with spaces', () => {
      const result = StringProcessor.processString('héllo', false);
      
      expect(result.scoredString).toBe('h llo');
    });
  });

  describe('isScoreAboveThreshold', () => {
    it('should return true when score is above threshold', () => {
      const stringAndScores = {
        originalString: 'test',
        scoredString: 'test',
        asciiCodes: [116, 101, 115, 116],
        ngramScore: -3.0,
        scoreThreshold: -4.0
      };
      
      expect(StringProcessor.isScoreAboveThreshold(stringAndScores)).toBe(true);
    });

    it('should return false when score is below threshold', () => {
      const stringAndScores = {
        originalString: 'test',
        scoredString: 'test',
        asciiCodes: [116, 101, 115, 116],
        ngramScore: -5.0,
        scoreThreshold: -4.0
      };
      
      expect(StringProcessor.isScoreAboveThreshold(stringAndScores)).toBe(false);
    });
  });
});