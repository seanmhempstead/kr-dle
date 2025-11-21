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

    // 1. Evaluate Whole Syllables first (Green/Orange/Grey)
    const targetSyllablesFreq: Record<string, number> = {};
    targetSyllables.forEach(s => targetSyllablesFreq[s] = (targetSyllablesFreq[s] || 0) + 1);

    const evaluatedSyllables: { char: string; status: CharStatus }[] = inputSyllables.map((char, idx) => {
        let status: CharStatus = CharStatus.Absent;
        if (char === targetSyllables[idx]) {
            status = CharStatus.Correct;
            targetSyllablesFreq[char]--;
        }
        return { char, status };
    });

    // Second pass for Syllable Orange (Present)
    evaluatedSyllables.forEach((item, idx) => {
        if (item.status !== CharStatus.Correct && targetSyllablesFreq[item.char] > 0) {
            item.status = CharStatus.Present;
            targetSyllablesFreq[item.char]--;
        }
    });

    // 2. Evaluate Jamo Parts (The detailed breakdown)
    // We create a pool of ATOMIC target Jamos (e.g., ㅢ becomes ㅡ, ㅣ) to allow partial matching hints
    const atomicTargetJamos: string[] = [];
    targetSyllables.forEach(s => {
        decomposeHangul(s).forEach(p => {
            if (p) atomicTargetJamos.push(...disassembleComplexJamo(p));
        });
    });

    const atomicTargetFreq: Record<string, number> = {};
    atomicTargetJamos.forEach(c => atomicTargetFreq[c] = (atomicTargetFreq[c] || 0) + 1);

    inputSyllables.forEach((sChar, sIdx) => {
        const sParts = decomposeHangul(sChar); // ['ㅎ', 'ㅏ', 'ㄴ']
        const tParts = decomposeHangul(targetSyllables[sIdx]); // Target parts at same index

        const evaluatedParts: JamoPart[] = sParts.map((pChar, pIdx) => {
             // Skip empty Jongseong
             if (pChar === '') return { char: '', status: CharStatus.None };

             let status: CharStatus = CharStatus.Absent;
             let subStatus: CharStatus[] | undefined;

             const atoms = disassembleComplexJamo(pChar);

             // Green Check (Exact match in this slot)
             if (tParts[pIdx] === pChar) {
                 status = CharStatus.Correct;
                 // Decrement frequency for atomic components of this correct match
                 atoms.forEach(atom => {
                    if (atomicTargetFreq[atom] > 0) atomicTargetFreq[atom]--;
                 });
             } else {
                 // Yellow Check: Is this Jamo (or its parts) in the target?
                 // If it's a complex char, we check each atom individually
                 if (atoms.length > 1) {
                     subStatus = atoms.map(atom => {
                         return atomicTargetFreq[atom] > 0 ? CharStatus.Present : CharStatus.Absent;
                     });
                     
                     // If any part is present, the whole block is technically "Present"
                     if (subStatus.some(s => s === CharStatus.Present)) {
                         status = CharStatus.Present;
                     }
                 } else {
                     // Simple char logic
                     if (atomicTargetFreq[pChar] > 0) {
                         status = CharStatus.Present;
                     }
                 }
             }
             
             // Update Keyboard State (Global best status)
             atoms.forEach((atom, i) => {
                 let atomStatus: CharStatus = status;
                 // Use granular status if available and not a perfect match
                 if (status !== CharStatus.Correct && subStatus && subStatus[i]) {
                     atomStatus = subStatus[i];
                 }

                 const currentKeyStatus = newKeyState[atom] || CharStatus.None;
                 if (atomStatus === CharStatus.Correct) {
                     newKeyState[atom] = CharStatus.Correct;
                 } else if (atomStatus === CharStatus.Present && currentKeyStatus !== CharStatus.Correct) {
                     newKeyState[atom] = CharStatus.Present;
                 } else if (atomStatus === CharStatus.Absent && currentKeyStatus === CharStatus.None) {
                     newKeyState[atom] = CharStatus.Absent;
                 }
             });

             return { char: pChar, status, subStatus };
        });

        syllableBlocks.push({
            char: sChar,
            status: evaluatedSyllables[sIdx].status,
            parts: evaluatedParts
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