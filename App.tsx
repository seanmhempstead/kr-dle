import React, { useState, useEffect, useCallback } from 'react';
import Grid from './components/Grid';
import Keyboard from './components/Keyboard';
import HelpModal from './components/HelpModal';
import { RowData, CharStatus, KeyState, SyllableBlock, JamoPart } from './types';
import { assembleJamo, decomposeHangul, disassembleForKeyboard } from './utils/hangul';
import { WORD_LIST } from './wordList';

function App() {
  const [targetWord, setTargetWord] = useState<string>("");
  const [targetMeaning, setTargetMeaning] = useState<string>("");

  // Game State
  const [guesses, setGuesses] = useState<RowData[]>([]);
  const [currentJamoInput, setCurrentJamoInput] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [keyState, setKeyState] = useState<KeyState>({});
  const [shake, setShake] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Initialize / Reset Game
  const startNewGame = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
    const selection = WORD_LIST[randomIndex];
    setTargetWord(selection.word);
    setTargetMeaning(selection.meaning);

    setGuesses([]);
    setCurrentJamoInput([]);
    setGameStatus('playing');
    setKeyState({});
    setShake(false);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Helper: Evaluate a guess against the target
  const evaluateGuess = (inputSyllables: string[]): RowData => {
    const targetSyllables = [targetWord[0], targetWord[1]];
    const syllableBlocks: SyllableBlock[] = [];
    const newKeyState = { ...keyState };

    // --- PRE-CALCULATE FREQUENCIES ---

    // 1. Global Word Frequency (Atomic)
    const globalTargetFreq: Record<string, number> = {};
    targetSyllables.forEach(s => {
      decomposeHangul(s).forEach(p => {
        if (p) {
          globalTargetFreq[p] = (globalTargetFreq[p] || 0) + 1;
        }
      });
    });

    // 2. Per-Syllable Frequency (Atomic)
    const syllableTargetFreqs: Record<string, number>[] = targetSyllables.map(s => {
      const freq: Record<string, number> = {};
      decomposeHangul(s).forEach(p => {
        if (p) {
          freq[p] = (freq[p] || 0) + 1;
        }
      });
      return freq;
    });

    // Prepare data structure for input atoms to track their status
    const evaluatedSyllables = inputSyllables.map((sChar, sIdx) => {
      const sParts = decomposeHangul(sChar);
      const tParts = decomposeHangul(targetSyllables[sIdx]);

      return sParts.map((pChar, pIdx) => {
        if (pChar === '') return { char: '', status: CharStatus.Absent, tChar: '' };

        return {
          char: pChar,
          status: CharStatus.Absent, // Initial status
          tChar: tParts[pIdx] // Corresponding target part for alignment check
        };
      });
    });

    // --- PASS 1: CORRECT (Green) ---
    evaluatedSyllables.forEach((parts, sIdx) => {
      parts.forEach((part) => {
        if (!part.char) return;

        // Check alignment with target part (Exact Match of the component)
        if (part.char === part.tChar) {
          part.status = CharStatus.Correct;
          // Decrement counts
          if (syllableTargetFreqs[sIdx][part.char] > 0) syllableTargetFreqs[sIdx][part.char]--;
          if (globalTargetFreq[part.char] > 0) globalTargetFreq[part.char]--;
        }
      });
    });

    // --- PASS 2: PRESENT (Yellow - In Current Syllable) ---
    evaluatedSyllables.forEach((parts, sIdx) => {
      parts.forEach(part => {
        if (!part.char) return;
        if (part.status === CharStatus.Correct) return;

        // Check if in current syllable
        if (syllableTargetFreqs[sIdx][part.char] > 0) {
          part.status = CharStatus.Present;
          syllableTargetFreqs[sIdx][part.char]--;
          if (globalTargetFreq[part.char] > 0) globalTargetFreq[part.char]--;
        }
      });
    });

    // --- PASS 3: MISPLACED SYLLABLE (Blue - In Word) ---
    evaluatedSyllables.forEach((parts, sIdx) => {
      parts.forEach(part => {
        if (!part.char) return;
        if (part.status === CharStatus.Correct || part.status === CharStatus.Present) return;

        // Check if in global word
        if (globalTargetFreq[part.char] > 0) {
          part.status = CharStatus.MisplacedSyllable;
          globalTargetFreq[part.char]--;
        }
      });
    });

    // --- CONSTRUCT RESULT & UPDATE KEYBOARD ---
    evaluatedSyllables.forEach((parts, sIdx) => {
      const finalParts: JamoPart[] = parts.map(part => {
        if (!part.char) return { char: '', status: CharStatus.None };

        // Update Keyboard
        // For complex characters (e.g. ㅘ), we need to update status for component keys (ㅗ, ㅏ)
        const atomsForKeyboard = disassembleForKeyboard(part.char);
        const atomStatus = part.status;

        atomsForKeyboard.forEach(atom => {
          const currentKeyStatus = newKeyState[atom] || CharStatus.None;

          // Priority: Correct > Present > MisplacedSyllable > Absent
          const priority = {
            [CharStatus.Correct]: 4,
            [CharStatus.Present]: 3,
            [CharStatus.MisplacedSyllable]: 2,
            [CharStatus.Absent]: 1,
            [CharStatus.None]: 0
          };

          if (priority[atomStatus] > priority[currentKeyStatus]) {
            newKeyState[atom] = atomStatus;
          }
        });
        return {
          char: part.char,
          status: part.status
        };
      });

      // Determine Syllable Status (for the big block border)
      let syllableStatus = CharStatus.Absent;
      const allPartStatuses = finalParts.map(p => p.status);

      if (allPartStatuses.length > 0) {
        if (allPartStatuses.every(s => s === CharStatus.Correct)) {
          syllableStatus = CharStatus.Correct;
        } else if (allPartStatuses.some(s => s === CharStatus.Present)) {
          syllableStatus = CharStatus.Present;
        } else if (allPartStatuses.some(s => s === CharStatus.MisplacedSyllable)) {
          syllableStatus = CharStatus.MisplacedSyllable;
        }
      }

      syllableBlocks.push({
        char: inputSyllables[sIdx],
        status: syllableStatus,
        parts: finalParts
      });
    });

    setKeyState(newKeyState);
    return { syllables: syllableBlocks, isValid: true };
  };

  const handleInput = useCallback((char: string) => {
    if (gameStatus !== 'playing') return;

    // Check if input would create > 2 blocks
    const potentialInput = [...currentJamoInput, char];
    const assembled = assembleJamo(potentialInput);

    if (assembled.length > 2) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setCurrentJamoInput(potentialInput);
  }, [gameStatus, currentJamoInput]);

  const handleDelete = useCallback(() => {
    if (gameStatus !== 'playing') return;
    setCurrentJamoInput(prev => prev.slice(0, -1));
  }, [gameStatus]);

  const handleEnter = useCallback(() => {
    if (gameStatus !== 'playing') return;

    const assembled = assembleJamo(currentJamoInput);

    // Validation: Must be exactly 2 syllables
    if (assembled.length !== 2) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    // Validate if they are complete Hangul chars (not loose jamo)
    if (!assembled.every(c => c.charCodeAt(0) >= 44032 && c.charCodeAt(0) <= 55203)) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const newRowData = evaluateGuess(assembled);
    const newGuesses = [...guesses, newRowData];
    setGuesses(newGuesses);
    setCurrentJamoInput([]);

    // Check Win/Loss
    const guessWord = assembled.join('');
    if (guessWord === targetWord) {
      setGameStatus('won');
    } else if (newGuesses.length >= 5) {
      setGameStatus('lost');
    }

  }, [currentJamoInput, gameStatus, guesses, targetWord, keyState]);

  // Physical Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') handleDelete();
      if (e.key === 'Enter') handleEnter();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDelete, handleEnter]);


  const assembledDisplay = assembleJamo(currentJamoInput);

  return (
    <div className={`flex flex-col h-full w-full max-w-lg mx-auto bg-slate-900 relative ${shake ? 'shake' : ''}`}>
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-400 tracking-wider">KR-dle</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={startNewGame}
            className="p-2 text-white bg-slate-700 hover:bg-slate-600 rounded-full border border-slate-600 transition-colors"
            title="Get a new word"
            aria-label="New Word"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>

          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2 text-white bg-slate-700 hover:bg-slate-600 rounded-full border border-slate-600 transition-colors"
            title="Help"
            aria-label="Help"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
          </button>

          <button
            className="p-2 text-white bg-slate-700 hover:bg-slate-600 rounded-full border border-slate-600 transition-colors"
            title="Settings"
            aria-label="Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.581-.495.644-.869l.214-1.281z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Grid Area */}
      <Grid
        guesses={guesses}
        currentGuess={currentJamoInput}
        currentRowIndex={guesses.length}
        assembledCurrentGuess={assembledDisplay}
      />

      {/* Input Area */}
      <div className="p-2">
        <Keyboard
          onChar={handleInput}
          onDelete={handleDelete}
          onEnter={handleEnter}
          keyState={keyState}
        />
      </div>

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Game Over Modal */}
      {gameStatus !== 'playing' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            <h2 className={`text-3xl font-bold mb-4 ${gameStatus === 'won' ? 'text-green-500' : 'text-red-500'}`}>
              {gameStatus === 'won' ? 'Correct!' : 'Game Over'}
            </h2>
            <div className="mb-6">
              <p className="text-slate-400 mb-2">The word was:</p>
              <div className="text-5xl font-bold text-white mb-2">{targetWord}</div>
              <p className="text-blue-300 text-lg">{targetMeaning}</p>
            </div>

            <button
              onClick={startNewGame}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors w-full"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;