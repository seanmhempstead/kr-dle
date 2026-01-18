import { CHOS, JUNGS, JONGS } from '../constants';

const HANGUL_START = 44032;
const HANGUL_END = 55203;

// Maps for complex composition
const COMPLEX_VOWELS: Record<string, string> = {
  'ㅗㅏ': 'ㅘ',
  'ㅗㅐ': 'ㅙ',
  'ㅗㅣ': 'ㅚ',
  'ㅜㅓ': 'ㅝ',
  'ㅜㅔ': 'ㅞ',
  'ㅜㅣ': 'ㅟ',
  'ㅡㅣ': 'ㅢ'
};

const COMPLEX_JONGS: Record<string, string> = {
  'ㄱㅅ': 'ㄳ',
  'ㄴㅈ': 'ㄵ',
  'ㄴㅎ': 'ㄶ',
  'ㄹㄱ': 'ㄺ',
  'ㄹㅁ': 'ㄻ',
  'ㄹㅂ': 'ㄼ',
  'ㄹㅅ': 'ㄽ',
  'ㄹㅌ': 'ㄾ',
  'ㄹㅍ': 'ㄿ',
  'ㄹㅎ': 'ㅀ',
  'ㅂㅅ': 'ㅄ'
};

// Checks if a character is a valid complete Hangul syllable
export const isHangulChar = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return code >= HANGUL_START && code <= HANGUL_END;
};

// Decomposes a syllable into [Cho, Jung, Jong]
export const decomposeHangul = (char: string): string[] => {
  if (!isHangulChar(char)) return [char];

  const code = char.charCodeAt(0) - HANGUL_START;
  const jongIndex = code % 28;
  const jungIndex = Math.floor((code % 588) / 28);
  const choIndex = Math.floor(code / 588);

  return [
    CHOS[choIndex],
    JUNGS[jungIndex],
    JONGS[jongIndex]
  ];
};

// Composes indices back to a character
export const composeHangul = (choIdx: number, jungIdx: number, jongIdx: number = 0): string => {
  return String.fromCharCode(HANGUL_START + (choIdx * 588) + (jungIdx * 28) + jongIdx);
};

export const getVowelType = (char: string): 'vertical' | 'horizontal' | 'mixed' => {
  const HORIZONTAL = ['ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ'];
  const MIXED = ['ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'];

  if (MIXED.includes(char)) return 'mixed';
  if (HORIZONTAL.includes(char)) return 'horizontal';
  return 'vertical';
};



/**
 * A robust Hangul Automaton to convert a stream of Jamo into Syllables.
 * Handles complex vowels (ㅢ, ㅘ) and standard Jongseong lookahead rules.
 */
export const assembleJamo = (jamos: string[]): string[] => {
  const result: string[] = [];
  let i = 0;

  while (i < jamos.length) {
    const c1 = jamos[i];

    // 1. Start with Consonant (Cho)
    if (CHOS.includes(c1)) {
      const choIdx = CHOS.indexOf(c1);
      let jungIdx = -1;
      let jongIdx = 0;

      // Peek Next: Is it a Vowel?
      if (i + 1 < jamos.length && JUNGS.includes(jamos[i + 1])) {
        const v1 = jamos[i + 1];
        i++; // Consume v1

        // Check for Complex Vowel (e.g., ㅡ + ㅣ = ㅢ)
        // OR e.g. ㅜ + ㅓ = ㅝ (for 월)
        if (i + 1 < jamos.length && JUNGS.includes(jamos[i + 1])) {
          const v2 = jamos[i + 1];
          const complexKey = v1 + v2;
          if (COMPLEX_VOWELS[complexKey]) {
            jungIdx = JUNGS.indexOf(COMPLEX_VOWELS[complexKey]);
            i++; // Consume v2
          } else {
            jungIdx = JUNGS.indexOf(v1);
          }
        } else {
          jungIdx = JUNGS.indexOf(v1);
        }

        // We have Cho + Jung. Now check for Jongseong.
        if (i + 1 < jamos.length) {
          const c2 = jamos[i + 1];
          // Potential Jongseong?
          // It must be in JONGS list AND not followed immediately by a Vowel (which would make it Cho of next block)
          if (JONGS.includes(c2)) {
            // Lookahead for Vowel
            const nextIsVowel = (i + 2 < jamos.length) && JUNGS.includes(jamos[i + 2]);

            if (!nextIsVowel) {
              // It is likely a Jongseong.
              // Check for Complex Jongseong (e.g., ㄹ + ㄱ = ㄺ)
              let potentialJongIdx = JONGS.indexOf(c2);
              let consumedJong = 1;

              if (i + 2 < jamos.length) {
                const c3 = jamos[i + 2];
                const complexJongKey = c2 + c3;
                // Only combine if valid complex AND not followed by vowel (if followed by vowel, the second char splits off)
                const afterComplexIsVowel = (i + 3 < jamos.length) && JUNGS.includes(jamos[i + 3]);

                if (COMPLEX_JONGS[complexJongKey] && !afterComplexIsVowel) {
                  potentialJongIdx = JONGS.indexOf(COMPLEX_JONGS[complexJongKey]);
                  consumedJong = 2;
                }
              }

              jongIdx = potentialJongIdx;
              i += consumedJong;
            }
          }
        }

        result.push(composeHangul(choIdx, jungIdx, jongIdx));
      } else {
        // Consonant without Vowel -> Loose Char
        result.push(c1);
      }
    } else {
      // Loose Vowel or invalid start
      result.push(c1);
    }
    i++;
  }

  return result;
};