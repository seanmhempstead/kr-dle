import React from 'react';
import { RowData, CharStatus, SyllableBlock, JamoPart } from '../types';
import { decomposeHangul, getVowelType } from '../utils/hangul';
import { STATUS_STYLES } from '../constants/colours';

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
        if (syllable.status !== CharStatus.None) {
            borderColor = STATUS_STYLES[syllable.status].border;
        } else if (isCurrent) {
            borderColor = "border-slate-500";
        }
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
        const style = STATUS_STYLES[status];
        if (status === CharStatus.None) return "bg-slate-800";
        return `${style.bg} ${style.text}`;
    };

    const JamoBox = ({ part, className }: { part: JamoPart, className: string }) => (
        <div className={`flex items-center justify-center font-bold text-lg sm:text-xl ${getBgColor(part.status)} ${className}`}>
            {part.char}
        </div>
    );

    // Handle Mixed Vowels or Normal Vowels together (Simpler View)
    // We no longer split complex vowels.
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
                // Vertical or Mixed Vowel Layout
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