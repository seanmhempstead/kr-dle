export enum CharStatus {
  Correct = 'correct', // Green
  Present = 'present', // Orange/Yellow
  Absent = 'absent',   // Grey
  None = 'none',       // Default
}

export interface KeyState {
  [key: string]: CharStatus;
}

export interface JamoPart {
  char: string;
  status: CharStatus;
  subStatus?: CharStatus[]; // Granular status for complex parts (e.g. [Status of ㅗ, Status of ㅏ] for ㅘ)
}

export interface SyllableBlock {
  char: string; // The full composite character (e.g., '한')
  status: CharStatus;
  parts: JamoPart[]; // The breakdown (e.g., ㅎ, ㅏ, ㄴ)
}

export interface RowData {
  syllables: SyllableBlock[];
  isValid: boolean;
}

export interface GameStats {
  played: number;
  wins: number;
  streak: number;
}

export type AlertStatus = 'success' | 'error' | 'info' | null;