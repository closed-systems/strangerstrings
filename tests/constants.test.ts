import { describe, it, expect } from 'vitest';
import { ASCII_TO_DESCRIPTION, DESCRIPTION_TO_ASCII, NG_THRESHOLDS, MAX_NG_THRESHOLD } from '../src/utils/constants';

describe('Constants', () => {
  describe('ASCII mappings', () => {
    it('should have correct ASCII to description mappings', () => {
      expect(ASCII_TO_DESCRIPTION.get(0)).toEqual(['[NUL]', 'null']);
      expect(ASCII_TO_DESCRIPTION.get(9)).toEqual(['[HT]', 'horizontal tab']);
      expect(ASCII_TO_DESCRIPTION.get(32)).toEqual(['[SP]', 'space']);
      expect(ASCII_TO_DESCRIPTION.get(127)).toEqual(['[DEL]', 'delete']);
    });

    it('should have reverse mapping from description to ASCII', () => {
      expect(DESCRIPTION_TO_ASCII.get('[NUL]')).toBe(0);
      expect(DESCRIPTION_TO_ASCII.get('[HT]')).toBe(9);
      expect(DESCRIPTION_TO_ASCII.get('[SP]')).toBe(32);
      expect(DESCRIPTION_TO_ASCII.get('[DEL]')).toBe(127);
    });

    it('should have consistent forward and reverse mappings', () => {
      for (const [ascii, [desc]] of ASCII_TO_DESCRIPTION) {
        expect(DESCRIPTION_TO_ASCII.get(desc)).toBe(ascii);
      }
    });
  });

  describe('NG_THRESHOLDS', () => {
    it('should have correct length', () => {
      expect(NG_THRESHOLDS.length).toBe(101); // 0 to 100
    });

    it('should have correct values for short strings', () => {
      expect(NG_THRESHOLDS[0]).toBe(10.0);
      expect(NG_THRESHOLDS[1]).toBe(10.0);
      expect(NG_THRESHOLDS[2]).toBe(10.0);
      expect(NG_THRESHOLDS[3]).toBe(10.0);
    });

    it('should have correct value for length 4', () => {
      expect(NG_THRESHOLDS[4]).toBe(-2.71);
    });

    it('should have correct value for length 5', () => {
      expect(NG_THRESHOLDS[5]).toBe(-3.26);
    });

    it('should be immutable', () => {
      expect(() => {
        // @ts-ignore - trying to modify readonly array
        NG_THRESHOLDS[0] = 999;
      }).toThrow();
    });
  });

  describe('MAX_NG_THRESHOLD', () => {
    it('should be -6.3', () => {
      expect(MAX_NG_THRESHOLD).toBe(-6.3);
    });
  });
});