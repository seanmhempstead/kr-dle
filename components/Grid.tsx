import React from 'react';
import { RowData, CharStatus, SyllableBlock, JamoPart } from '../types';
import { decomposeHangul, getVowelType, disassembleComplexJamo } from '../utils/hangul';

interface GridProps {
  guesses: RowData[];
  currentGuess: string[]; // Raw Jamo list
  currentRowIndex: number;
  assembledCurrentGuess: string[]; // Assembled syllables for current row
}

const Cell: React.FC<{ syllable: SyllableBlock | null, isCurrent: boolean }> = ({ syllable, isCurrent }) => {
    // Base Syllable Block Styles
    let borderColor = "border-slate-700";
    
    if (syllable) {
        if (syllable.status === CharStatus.Correct) borderColor = "border-green-600";
        else if (syllable.status === CharStatus.Present) borderColor = "border-yellow-600";
        else if (syllable.status === CharStatus.Absent) borderColor = "border-slate-700";
        else if (isCurrent) borderColor = "border-slate-500";
    }

    // Render Empty State
    if (!syllable) {
        return <div className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-slate-800 bg-slate-800/50 rounded-lg" />;
    }

    // Render Current Input (Typing) - Show whole character
    if (isCurrent) {
        return (
            <div className={`w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-4xl sm:text-5xl font-bold rounded-lg border-2 bg-slate-800 text-white animate-pulse ${borderColor}`}>
                {syllable.char}
            </div>
        );
    }

    // Render Submitted Guess (Decomposed View)
    const parts = syllable.parts;
    const cho = parts[0] || { char: '', status: CharStatus.None };
    const jung = parts[1] || { char: '', status: CharStatus.None };
    const jong = parts[2] || { char: '', status: CharStatus.None };
    
    const hasJong = jong.char !== '';
    const vowelType = getVowelType(jung.char);

    const getBgColor = (status: CharStatus) => {
        switch (status) {
            case CharStatus.Correct: return "bg-green-600 text-white";
            case CharStatus.Present: return "bg-yellow-500 text-white";
            case CharStatus.Absent: return "bg-slate-700 text-slate-400";
            default: return "bg-slate-800";
        }
    };

    const JamoBox = ({ part, className }: { part: JamoPart, className: string }) => (
        <div className={`flex items-center justify-center font-bold text-lg sm:text-xl ${getBgColor(part.status)} ${className}`}>
            {part.char}
        </div>
    );

    // Handle Mixed Vowels (e.g. ㅘ -> ㅗ + ㅏ)
    if (vowelType === 'mixed') {
        const complexParts = disassembleComplexJamo(jung.char);
        
        // Use granular subStatus if available, otherwise fall back to main status
        const s0 = (jung.subStatus && jung.subStatus[0]) ? jung.subStatus[0] : jung.status;
        const s1 = (jung.subStatus && jung.subStatus[1]) ? jung.subStatus[1] : jung.status;

        const vHoriz: JamoPart = { char: complexParts[0], status: s0 };
        const vVert: JamoPart = { char: complexParts[1], status: s1 };

        return (
            <div className={`w-20 h-20 sm:w-24 sm:h-24 flex flex-col rounded-lg overflow-hidden border-4 ${borderColor} box-border`}>
                {/* Top Section: Cho + Vowels */}
                <div className={`flex w-full gap-[1px] ${hasJong ? 'h-[66%]' : 'h-full'}`}>
                     {/* Left Column: Cho + Horizontal Vowel */}
                     <div className="flex flex-col flex-1 gap-[1px]">
                        <JamoBox part={cho} className="flex-1" />
                        <JamoBox part={vHoriz} className="flex-1" />
                     </div>
                     {/* Right Column: Vertical Vowel */}
                     <div className="flex-1">
                        <JamoBox part={vVert} className="w-full h-full" />
                     </div>
                </div>
                {/* Bottom Section: Jong */}
                {hasJong && (
                    <div className="h-[34%] w-full bg-slate-900 border-t border-slate-900">
                         <JamoBox part={jong} className="w-full h-full" />
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={`w-20 h-20 sm:w-24 sm:h-24 flex flex-col rounded-lg overflow-hidden border-4 ${borderColor} box-border`}>
            {/* Horizontal Vowel Layout (Stack) */}
            {vowelType === 'horizontal' ? (
                <div className="flex flex-col h-full w-full gap-[1px] bg-slate-900">
                    <JamoBox part={cho} className="flex-1" />
                    <JamoBox part={jung} className="flex-1" />
                    {hasJong && <JamoBox part={jong} className="flex-1" />}
                </div>
            ) : (
                // Vertical Vowel Layout
                <div className="flex flex-col h-full w-full gap-[1px] bg-slate-900">
                    {/* Top Half: Cho + Jung */}
                    <div className={`flex w-full gap-[1px] ${hasJong ? 'h-[66%]' : 'h-full'}`}>
                        <JamoBox part={cho} className="flex-1 h-full" />
                        <JamoBox part={jung} className="flex-1 h-full" />
                    </div>
                    {/* Bottom Half: Jong */}
                    {hasJong && (
                        <div className="h-[34%] w-full">
                            <JamoBox part={jong} className="w-full h-full" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Grid: React.FC<GridProps> = ({ guesses, currentRowIndex, assembledCurrentGuess }) => {
  const emptyRows = Array.from({ length: 5 - 1 - currentRowIndex }); 

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 p-4 overflow-y-auto">
        {/* Completed Guesses */}
        {guesses.map((guess, i) => (
            <div key={`row-${i}`} className="flex gap-2">
                <Cell syllable={guess.syllables[0]} isCurrent={false} />
                <Cell syllable={guess.syllables[1]} isCurrent={false} />
            </div>
        ))}

        {/* Current Guess (Active Editing) */}
        {currentRowIndex < 5 && (
            <div className="flex gap-2">
                <Cell 
                    syllable={{ 
                        char: assembledCurrentGuess[0] || '', 
                        status: CharStatus.None, 
                        parts: assembledCurrentGuess[0] ? decomposeHangul(assembledCurrentGuess[0]).map(c => ({ char: c, status: CharStatus.None })) : []
                    }} 
                    isCurrent={true} 
                />
                <Cell 
                    syllable={{ 
                        char: assembledCurrentGuess[1] || '', 
                        status: CharStatus.None, 
                        parts: assembledCurrentGuess[1] ? decomposeHangul(assembledCurrentGuess[1]).map(c => ({ char: c, status: CharStatus.None })) : []
                    }} 
                    isCurrent={true} 
                />
            </div>
        )}

        {/* Empty Rows */}
        {emptyRows.map((_, i) => (
            <div key={`empty-${i}`} className="flex gap-2 opacity-30">
                <Cell syllable={null} isCurrent={false} />
                <Cell syllable={null} isCurrent={false} />
            </div>
        ))}
    </div>
  );
};

export default Grid;