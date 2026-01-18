// Standard Dubelsik Layout
export const KEYBOARD_ROWS = [
  ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
  ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ']
];

export const SHIFT_MAP: Record<string, string> = {
  'ㅂ': 'ㅃ',
  'ㅈ': 'ㅉ',
  'ㄷ': 'ㄸ',
  'ㄱ': 'ㄲ',
  'ㅅ': 'ㅆ',
  'ㅐ': 'ㅒ',
  'ㅔ': 'ㅖ'
};

// Hangul Composition Constants
export const CHOS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

export const JUNGS = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

export const JONGS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// Simple identification
export const isCho = (c: string) => CHOS.includes(c);
export const isJung = (c: string) => JUNGS.includes(c);
export const isJong = (c: string) => JONGS.includes(c) && c !== '';

// Fallback word if API fails
export const FALLBACK_TARGET = "사람"; // Sa-ram

export const QWERTY_MAP: Record<string, string> = {
  'q': 'ㅂ', 'Q': 'ㅃ',
  'w': 'ㅈ', 'W': 'ㅉ',
  'e': 'ㄷ', 'E': 'ㄸ',
  'r': 'ㄱ', 'R': 'ㄲ',
  't': 'ㅅ', 'T': 'ㅆ',
  'y': 'ㅛ',
  'u': 'ㅕ',
  'i': 'ㅑ',
  'o': 'ㅐ', 'O': 'ㅒ',
  'p': 'ㅔ', 'P': 'ㅖ',
  'a': 'ㅁ',
  's': 'ㄴ',
  'd': 'ㅇ',
  'f': 'ㄹ',
  'g': 'ㅎ',
  'h': 'ㅗ',
  'j': 'ㅓ',
  'k': 'ㅏ',
  'l': 'ㅣ',
  'z': 'ㅋ',
  'x': 'ㅌ',
  'c': 'ㅊ',
  'v': 'ㅍ',
  'b': 'ㅠ',
  'n': 'ㅜ',
  'm': 'ㅡ'
};