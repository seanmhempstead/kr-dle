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
    const base = "font-bold uppercase text-sm sm:text-base rounded shadow-md transition-all duration-100 active:scale-95 select-none flex items-center justify-center h-12 sm:h-14 ";

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
    <div className="w-full max-w-3xl mx-auto p-2 bg-slate-900 pb-8">
      <div className="flex flex-col gap-2">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {/* Add Shift Key on the last row, left side */}
            {rowIndex === 2 && (
              <button
                onClick={() => setIsShift(!isShift)}
                className={`px-2 sm:px-4 rounded font-bold text-sm ${isShift ? 'bg-blue-500 text-white' : 'bg-slate-600 text-slate-200'}`}
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
                className="px-2 sm:px-4 bg-slate-600 text-white rounded font-bold text-sm"
              >
                ⌫
              </button>
            )}
          </div>
        ))}
        <div className="flex justify-center mt-2">
          <button
            onClick={onEnter}
            className="w-full max-w-[200px] h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-lg active:scale-95 transition-transform"
          >
            INPUT (입력)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Keyboard;