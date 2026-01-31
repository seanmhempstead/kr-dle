import React from 'react';
import { KEYBOARD_ROWS, SHIFT_MAP } from '../constants';
import { KeyState, CharStatus } from '../types';
import { STATUS_STYLES } from '../constants/colours';

interface KeyboardProps {
  onChar: (char: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  keyState: KeyState;
}

const Keyboard: React.FC<KeyboardProps> = ({ onChar, onDelete, onEnter, keyState }) => {
  const [isShift, setIsShift] = React.useState(false);

  const getKeyStyle = (char: string) => {
    const status = keyState[char] || CharStatus.None;
    const base = "font-semibold uppercase text-sm sm:text-base rounded-lg transition-all duration-100 active:scale-95 select-none flex items-center justify-center h-12 sm:h-14 mono ";

    const style = STATUS_STYLES[status];

    if (status === CharStatus.None) {
      return base + `${style.keyBg} ${style.keyText} ${style.keyHover}`;
    }

    return base + `${style.bg} ${style.text} ${style.keyBorder || ''}`;
  };

  const handleCharClick = (char: string) => {
    const inputChar = isShift && SHIFT_MAP[char] ? SHIFT_MAP[char] : char;
    onChar(inputChar);
    // Optional: auto unshift after press? Keeping it manual is often better for UX on web
    // setIsShift(false); 
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-2">
      <div className="flex flex-col gap-2">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {/* Add Shift Key on the last row, left side */}
            {rowIndex === 2 && (
              <button
                onClick={() => setIsShift(!isShift)}
                className={`px-3 sm:px-5 rounded-lg font-bold text-sm transition-all ${isShift ? 'bg-zinc-100 text-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/40'}`}
              >
                ⇧
              </button>
            )}

            {row.map((char) => {
              const displayChar = isShift && SHIFT_MAP[char] ? SHIFT_MAP[char] : char;
              return (
                <button
                  key={char}
                  onClick={() => handleCharClick(char)}
                  className={`${getKeyStyle(displayChar)} flex-1 max-w-[40px] sm:max-w-[50px]`}
                >
                  {displayChar}
                </button>
              )
            })}

            {/* Backspace on last row */}
            {rowIndex === 2 && (
              <button
                onClick={onDelete}
                className="px-3 sm:px-5 bg-zinc-800/60 text-zinc-400 border border-zinc-700/40 rounded-lg font-bold text-sm hover:text-zinc-100 transition-all"
              >
                ⌫
              </button>
            )}
          </div>
        ))}
        <div className="flex justify-center mt-2">
          <button
            onClick={onEnter}
            className="w-full max-w-[240px] h-12 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-lg shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            ENTER
          </button>
        </div>
      </div>
    </div>
  );
};

export default Keyboard;