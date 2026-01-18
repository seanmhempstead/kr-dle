import { describe, it, expect } from 'vitest';
import { decomposeHangul, assembleJamo } from './hangul';

describe('decomposeHangul', () => {
    it('decomposes simple syllables correctly', () => {
        expect(decomposeHangul('가')).toEqual(['ㄱ', 'ㅏ', '']);
        expect(decomposeHangul('각')).toEqual(['ㄱ', 'ㅏ', 'ㄱ']);
        expect(decomposeHangul('한')).toEqual(['ㅎ', 'ㅏ', 'ㄴ']);
    });

    it('decomposes syllables with complex vowels correctly (atomic)', () => {
        // '과' = ㄱ + ㅘ + ''
        expect(decomposeHangul('과')).toEqual(['ㄱ', 'ㅘ', '']);

        // '왜' = ㅇ + ㅙ + ''
        expect(decomposeHangul('왜')).toEqual(['ㅇ', 'ㅙ', '']);

        // '의' = ㅇ + ㅢ + ''
        expect(decomposeHangul('의')).toEqual(['ㅇ', 'ㅢ', '']);
    });

    it('decomposes syllables with double batchims correctly (atomic)', () => {
        // '닭' = ㄷ + ㅏ + ㄺ
        expect(decomposeHangul('닭')).toEqual(['ㄷ', 'ㅏ', 'ㄺ']);

        // '삶' = ㅅ + ㅏ + ㄻ
        expect(decomposeHangul('삶')).toEqual(['ㅅ', 'ㅏ', 'ㄻ']);
    });

    it('handles non-Hangul characters', () => {
        expect(decomposeHangul('A')).toEqual(['A']);
        expect(decomposeHangul('!')).toEqual(['!']);
    });
});

describe('assembleJamo', () => {
    it('assembles simple jamos into syllables', () => {
        expect(assembleJamo(['ㄱ', 'ㅏ'])).toEqual(['가']);
        expect(assembleJamo(['ㄱ', 'ㅏ', 'ㄱ'])).toEqual(['각']);
    });

    it('assembles complex vowels from loose jamo', () => {
        // ㄱ + ㅗ + ㅏ -> 과
        expect(assembleJamo(['ㄱ', 'ㅗ', 'ㅏ'])).toEqual(['과']);
    });

    it('assembles double batchim from loose jamo', () => {
        // ㄷ + ㅏ + ㄹ + ㄱ -> 닭
        expect(assembleJamo(['ㄷ', 'ㅏ', 'ㄹ', 'ㄱ'])).toEqual(['닭']);
    });

    it('handles loose jamo mixed with syllables', () => {
        // This behavior might depend on exact implementation, but generally we want it to form blocks
        expect(assembleJamo(['ㅎ', 'ㅏ', 'ㄴ', 'ㄱ', 'ㅡ', 'ㄹ'])).toEqual(['한', '글']);
    });
});
