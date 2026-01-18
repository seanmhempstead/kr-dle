import { describe, it, expect } from 'vitest';
import { decomposeHangul, assembleJamo } from './hangul';

describe('decomposeHangul', () => {
    it('decomposes simple syllables correctly', () => {
        expect(decomposeHangul('가')).toEqual(['ㄱ', 'ㅏ', '']);
        expect(decomposeHangul('각')).toEqual(['ㄱ', 'ㅏ', 'ㄱ']);
        expect(decomposeHangul('한')).toEqual(['ㅎ', 'ㅏ', 'ㄴ']);
    });

    describe('Complex Vowels (Decomposition)', () => {
        // Test all 7 complex vowels: ㅘ, ㅙ, ㅚ, ㅝ, ㅞ, ㅟ, ㅢ
        // Using common words where possible, or synthetic syllables

        it('handles ㅘ (wa)', () => {
            expect(decomposeHangul('과')).toEqual(['ㄱ', 'ㅘ', '']);
        });
        it('handles ㅙ (wae)', () => {
            expect(decomposeHangul('왜')).toEqual(['ㅇ', 'ㅙ', '']);
        });
        it('handles ㅚ (oe)', () => {
            expect(decomposeHangul('괴')).toEqual(['ㄱ', 'ㅚ', '']);
        });
        it('handles ㅝ (wo)', () => {
            expect(decomposeHangul('원')).toEqual(['ㅇ', 'ㅝ', 'ㄴ']);
        });
        it('handles ㅞ (we)', () => {
            expect(decomposeHangul('웨')).toEqual(['ㅇ', 'ㅞ', '']);
        });
        it('handles ㅟ (wi)', () => {
            expect(decomposeHangul('위')).toEqual(['ㅇ', 'ㅟ', '']);
        });
        it('handles ㅢ (ui)', () => {
            expect(decomposeHangul('의')).toEqual(['ㅇ', 'ㅢ', '']);
        });
    });

    describe('Double Batchim (Decomposition)', () => {
        // Test all 11 double batchims: ㄳ, ㄵ, ㄶ, ㄺ, ㄻ, ㄼ, ㄽ, ㄾ, ㄿ, ㅀ, ㅄ

        it('handles ㄳ (gs)', () => {
            expect(decomposeHangul('몫')).toEqual(['ㅁ', 'ㅗ', 'ㄳ']);
        });
        it('handles ㄵ (nj)', () => {
            expect(decomposeHangul('앉')).toEqual(['ㅇ', 'ㅏ', 'ㄵ']);
        });
        it('handles ㄶ (nh)', () => {
            expect(decomposeHangul('않')).toEqual(['ㅇ', 'ㅏ', 'ㄶ']);
        });
        it('handles ㄺ (lg)', () => {
            expect(decomposeHangul('닭')).toEqual(['ㄷ', 'ㅏ', 'ㄺ']);
        });
        it('handles ㄻ (lm)', () => {
            expect(decomposeHangul('삶')).toEqual(['ㅅ', 'ㅏ', 'ㄻ']);
        });
        it('handles ㄼ (lb)', () => {
            expect(decomposeHangul('밟')).toEqual(['ㅂ', 'ㅏ', 'ㄼ']);
        });
        it('handles ㄽ (ls)', () => {
            expect(decomposeHangul('곬')).toEqual(['ㄱ', 'ㅗ', 'ㄽ']);
        });
        it('handles ㄾ (lt)', () => {
            expect(decomposeHangul('핥')).toEqual(['ㅎ', 'ㅏ', 'ㄾ']);
        });
        it('handles ㄿ (lp)', () => {
            expect(decomposeHangul('읊')).toEqual(['ㅇ', 'ㅡ', 'ㄿ']);
        });
        it('handles ㅀ (lh)', () => {
            expect(decomposeHangul('잃')).toEqual(['ㅇ', 'ㅣ', 'ㅀ']);
        });
        it('handles ㅄ (bs)', () => {
            expect(decomposeHangul('없')).toEqual(['ㅇ', 'ㅓ', 'ㅄ']);
        });
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

    describe('Complex Vowels (Assembly)', () => {
        it('assembles ㅘ from ㅗ + ㅏ', () => {
            expect(assembleJamo(['ㄱ', 'ㅗ', 'ㅏ'])).toEqual(['과']);
        });
        it('assembles ㅙ from ㅗ + ㅐ', () => {
            expect(assembleJamo(['ㅇ', 'ㅗ', 'ㅐ'])).toEqual(['왜']);
        });
        it('assembles ㅚ from ㅗ + ㅣ', () => {
            expect(assembleJamo(['ㄱ', 'ㅗ', 'ㅣ'])).toEqual(['괴']);
        });
        it('assembles ㅝ from ㅜ + ㅓ', () => {
            expect(assembleJamo(['ㅇ', 'ㅜ', 'ㅓ', 'ㄴ'])).toEqual(['원']);
        });
        it('assembles ㅞ from ㅜ + ㅔ', () => {
            expect(assembleJamo(['ㅇ', 'ㅜ', 'ㅔ'])).toEqual(['웨']);
        });
        it('assembles ㅟ from ㅜ + ㅣ', () => {
            expect(assembleJamo(['ㅇ', 'ㅜ', 'ㅣ'])).toEqual(['위']);
        });
        it('assembles ㅢ from ㅡ + ㅣ', () => {
            expect(assembleJamo(['ㅇ', 'ㅡ', 'ㅣ'])).toEqual(['의']);
        });
    });

    describe('Double Batchim (Assembly)', () => {
        it('assembles ㄳ from ㄱ + ㅅ', () => {
            expect(assembleJamo(['ㅁ', 'ㅗ', 'ㄱ', 'ㅅ'])).toEqual(['몫']);
        });
        it('assembles ㄵ from ㄴ + ㅈ', () => {
            expect(assembleJamo(['ㅇ', 'ㅏ', 'ㄴ', 'ㅈ'])).toEqual(['앉']);
        });
        it('assembles ㄶ from ㄴ + ㅎ', () => {
            expect(assembleJamo(['ㅇ', 'ㅏ', 'ㄴ', 'ㅎ'])).toEqual(['않']);
        });
        it('assembles ㄺ from ㄹ + ㄱ', () => {
            expect(assembleJamo(['ㄷ', 'ㅏ', 'ㄹ', 'ㄱ'])).toEqual(['닭']);
        });
        it('assembles ㄻ from ㄹ + ㅁ', () => {
            expect(assembleJamo(['ㅅ', 'ㅏ', 'ㄹ', 'ㅁ'])).toEqual(['삶']);
        });
        it('assembles ㄼ from ㄹ + ㅂ', () => {
            expect(assembleJamo(['ㅂ', 'ㅏ', 'ㄹ', 'ㅂ'])).toEqual(['밟']);
        });
        it('assembles ㄽ from ㄹ + ㅅ', () => {
            expect(assembleJamo(['ㄱ', 'ㅗ', 'ㄹ', 'ㅅ'])).toEqual(['곬']);
        });
        it('assembles ㄾ from ㄹ + ㅌ', () => {
            expect(assembleJamo(['ㅎ', 'ㅏ', 'ㄹ', 'ㅌ'])).toEqual(['핥']);
        });
        it('assembles ㄿ from ㄹ + ㅍ', () => {
            expect(assembleJamo(['ㅇ', 'ㅡ', 'ㄹ', 'ㅍ'])).toEqual(['읊']);
        });
        it('assembles ㅀ from ㄹ + ㅎ', () => {
            expect(assembleJamo(['ㅇ', 'ㅣ', 'ㄹ', 'ㅎ'])).toEqual(['잃']);
        });
        it('assembles ㅄ from ㅂ + ㅅ', () => {
            expect(assembleJamo(['ㅇ', 'ㅓ', 'ㅂ', 'ㅅ'])).toEqual(['없']);
        });
    });

    it('handles loose jamo mixed with syllables', () => {
        expect(assembleJamo(['ㅎ', 'ㅏ', 'ㄴ', 'ㄱ', 'ㅡ', 'ㄹ'])).toEqual(['한', '글']);
        expect(assembleJamo(['ㄱ', 'ㅏ', 'ㄴ', 'ㅏ', 'ㄷ', 'ㅏ'])).toEqual(['가', '나', '다']);
        expect(assembleJamo(['ㅁ', 'ㅗ', 'ㄱ', 'ㅅ', 'ㅇ', 'ㅣ'])).toEqual(['몫', '이']); // Checking batchim carry over rules or plain block formation
        // Note: assembleJamo standard logic often prefers greedy matching for complex batchim unless next is vowel
        // In standard Korean typing 'dh' -> 'da' + 'h' if followed by vowel? 
        // Actually current implementation:
        // If JONGS.includes(c2) -> checks if next is vowel. If next IS vowel, c2 starts new block.
        // 'ㅁ', 'ㅗ', 'ㄱ', 'ㅅ', 'ㅇ', 'ㅣ' -> '목', '싱' would be correct typing rule but let's see implementation.
        // Wait, 'ㄱ', 'ㅅ' -> valid complex 'ㄳ'. 
        // followed by 'ㅇ'(cho/void) which is CHOS, but assembleJamo treats input as Jamo stream.
        // 'ㅇ' is in CHOS. But 'ㅇ' is also in JONGS? No 'ㅇ' is JONG but 'ㅇ' is also CHO.
        // logic: if (i+2 < jamos.length) && JUNGS.includes(jamos[i+2]).
        // here 'ㅇ' is NOT in JUNGS. 'ㅣ' is in JUNGS.
        // So for '몫이', typing is usually ㅁ ㅗ ㄱ ㅅ ㅇ ㅣ.
        // Implementation: c2='ㅅ'. next is 'ㅇ'. 'ㅇ' is NOT in JUNGS. 
        // So 'ㄱ'+'ㅅ' -> 'ㄳ'.
        // Then next block start with 'ㅇ'.
        // So Expected: ['몫', '이'].
    });
});
