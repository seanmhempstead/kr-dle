import React, { useState, useEffect, useCallback } from 'react';
import Grid from './components/Grid';
import Keyboard from './components/Keyboard';
import { RowData, CharStatus, KeyState, SyllableBlock, JamoPart } from './types';
import { assembleJamo, decomposeHangul, disassembleComplexJamo } from './utils/hangul';
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
        if (p) disassembleComplexJamo(p).forEach(atom => {
          globalTargetFreq[atom] = (globalTargetFreq[atom] || 0) + 1;
        });
      });
    });

    // 2. Per-Syllable Frequency (Atomic)
    const syllableTargetFreqs: Record<string, number>[] = targetSyllables.map(s => {
      const freq: Record<string, number> = {};
      decomposeHangul(s).forEach(p => {
        if (p) disassembleComplexJamo(p).forEach(atom => {
          freq[atom] = (freq[atom] || 0) + 1;
        });
      });
      return freq;
    });

    // Prepare data structure for input atoms to track their status
    const evaluatedSyllables = inputSyllables.map((sChar, sIdx) => {
      const sParts = decomposeHangul(sChar);
      const tParts = decomposeHangul(targetSyllables[sIdx]);

      return sParts.map((pChar, pIdx) => {
        if (pChar === '') return { char: '', atoms: [], atomStatuses: [], tChar: '' };

        const atoms = disassembleComplexJamo(pChar);
        // Initial status for atoms
        const atomStatuses = atoms.map(() => CharStatus.Absent);

        return {
          char: pChar,
          atoms,
          atomStatuses,
          tChar: tParts[pIdx] // Corresponding target part for alignment check
        };
      });
    });

    // --- PASS 1: CORRECT (Green) ---
    evaluatedSyllables.forEach((parts, sIdx) => {
      parts.forEach((part, pIdx) => {
        if (!part.char) return;

        // Check alignment with target part (Exact Match of the component)
        if (part.char === part.tChar) {
          part.atomStatuses.fill(CharStatus.Correct);
          // Decrement counts
          part.atoms.forEach(atom => {
            if (syllableTargetFreqs[sIdx][atom] > 0) syllableTargetFreqs[sIdx][atom]--;
            if (globalTargetFreq[atom] > 0) globalTargetFreq[atom]--;
          });
        }
      });
    });

    // --- PASS 2: PRESENT (Yellow - In Current Syllable) ---
    evaluatedSyllables.forEach((parts, sIdx) => {
      parts.forEach(part => {
        if (!part.char) return;

        part.atoms.forEach((atom, aIdx) => {
          if (part.atomStatuses[aIdx] === CharStatus.Correct) return;

          // Check if in current syllable
          if (syllableTargetFreqs[sIdx][atom] > 0) {
            part.atomStatuses[aIdx] = CharStatus.Present;
            syllableTargetFreqs[sIdx][atom]--;
            if (globalTargetFreq[atom] > 0) globalTargetFreq[atom]--;
          }
        });
      });
    });

    // --- PASS 3: MISPLACED SYLLABLE (Blue - In Word) ---
    evaluatedSyllables.forEach((parts, sIdx) => {
      parts.forEach(part => {
        if (!part.char) return;

        part.atoms.forEach((atom, aIdx) => {
          if (part.atomStatuses[aIdx] === CharStatus.Correct || part.atomStatuses[aIdx] === CharStatus.Present) return;

          // Check if in global word
          if (globalTargetFreq[atom] > 0) {
            part.atomStatuses[aIdx] = CharStatus.MisplacedSyllable;
            globalTargetFreq[atom]--;
          }
        });
      });
    });

    // --- CONSTRUCT RESULT & UPDATE KEYBOARD ---
    evaluatedSyllables.forEach((parts, sIdx) => {
      const finalParts: JamoPart[] = parts.map(part => {
        if (!part.char) return { char: '', status: CharStatus.None };

        // Determine aggregate status for the JamoPart
        let status = CharStatus.Absent;

        // If all atoms are correct -> Correct
        if (part.atomStatuses.every(s => s === CharStatus.Correct)) {
          status = CharStatus.Correct;
        }
        // If any atom is Present -> Present (takes precedence over Misplaced)
        else if (part.atomStatuses.some(s => s === CharStatus.Present)) {
          status = CharStatus.Present;
        }
        // If any atom is Misplaced -> Misplaced
        else if (part.atomStatuses.some(s => s === CharStatus.MisplacedSyllable)) {
          status = CharStatus.MisplacedSyllable;
        }

        // Substatus for complex chars
        const subStatus = part.atoms.length > 1 ? part.atomStatuses : undefined;

        // Update Keyboard
        part.atoms.forEach((atom, i) => {
          const atomStatus = part.atomStatuses[i];
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
          status,
          subStatus
        };
      });

      // Determine Syllable Status (for the big block border)
      let syllableStatus = CharStatus.Absent;
      const allPartStatuses = finalParts.flatMap(p => p.subStatus || p.status);

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
        <button
          onClick={startNewGame}
          className="px-3 py-1.5 text-xs font-bold text-white bg-slate-700 hover:bg-slate-600 rounded border border-slate-600 transition-colors"
          title="Get a new word"
        >
          New Word
        </button>
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