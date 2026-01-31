import React, { useRef, useEffect } from 'react';
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
    let borderColor = "border-zinc-800/50";

    if (syllable) {
        if (syllable.status !== CharStatus.None) {
            borderColor = STATUS_STYLES[syllable.status].border;
        } else if (isCurrent) {
            borderColor = "border-zinc-500/50";
        }
    }

    // Render Empty State
    if (!syllable) {
        return <div className="w-20 h-20 sm:w-24 sm:h-24 border border-zinc-700/20 bg-zinc-800/10 rounded-xl" />;
    }

    // Render Current Input (Typing) - Show whole character
    if (isCurrent) {
        return (
            <div className={`w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-4xl sm:text-5xl font-bold rounded-xl border bg-zinc-800/40 text-zinc-100 animate-pulse transition-all ${borderColor}`}>
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
        if (status === CharStatus.None) return "bg-zinc-800/40";
        return `${style.bg} ${style.text}`;
    };

    const JamoBox = ({ part, className }: { part: JamoPart, className: string }) => (
        <div className={`flex items-center justify-center font-bold text-lg sm:text-xl leading-none transition-all ${getBgColor(part.status)} ${className}`}>
            {part.char}
        </div>
    );

    // Handle Mixed Vowels or Normal Vowels together (Simpler View)
    // We no longer split complex vowels.
    return (
        <div className={`w-20 h-20 sm:w-24 sm:h-24 flex flex-col rounded-xl overflow-hidden border ${borderColor} box-border shadow-lg transition-transform hover:scale-[1.02]`}>
            {/* Horizontal Vowel Layout (Stack) */}
            {vowelType === 'horizontal' ? (
                <div className="flex flex-col h-full w-full gap-[1px] bg-zinc-950/20">
                    <JamoBox part={cho} className="flex-1" />
                    <JamoBox part={jung} className="flex-1" />
                    {hasJong && <JamoBox part={jong} className="flex-1" />}
                </div>
            ) : (
                // Vertical or Mixed Vowel Layout
                <div className="flex flex-col h-full w-full gap-[1px] bg-zinc-950/20">
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
    const activeRowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeRowRef.current) {
            activeRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentRowIndex]);

    return (
        <div className="flex-1 w-full overflow-y-auto relative">
            <div className="min-h-full flex flex-col items-center justify-center gap-2 p-4 box-border">
                {/* Completed Guesses */}
                {guesses.map((guess, i) => (
                    <div key={`row-${i}`} className="flex gap-2">
                        <Cell syllable={guess.syllables[0]} isCurrent={false} />
                        <Cell syllable={guess.syllables[1]} isCurrent={false} />
                    </div>
                ))}

                {/* Current Guess (Active Editing) */}
                {currentRowIndex < 5 && (
                    <div className="flex gap-2" ref={activeRowRef}>
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
        </div>
    );
};

export default Grid;