import { CharStatus } from '../types';

export const STATUS_STYLES = {
    [CharStatus.Correct]: {
        bg: 'bg-green-600',
        text: 'text-white',
        border: 'border-green-600',
        keyBorder: 'border-green-700'
    },
    [CharStatus.Present]: {
        bg: 'bg-yellow-500',
        text: 'text-white',
        border: 'border-yellow-600',
        keyBorder: 'border-yellow-600'
    },
    [CharStatus.MisplacedSyllable]: {
        bg: 'bg-orange-500',
        text: 'text-white',
        border: 'border-orange-600',
        keyBorder: 'border-orange-600'
    },
    [CharStatus.Absent]: {
        bg: 'bg-slate-700',
        text: 'text-slate-400',
        border: 'border-slate-700',
        keyBorder: 'border-slate-800'
    },
    [CharStatus.None]: {
        bg: 'bg-slate-800', // Default cell bg
        text: 'text-white',
        border: 'border-slate-700', // Default cell border
        keyBg: 'bg-slate-200', // Default key bg
        keyText: 'text-slate-900',
        keyHover: 'hover:bg-slate-300'
    }
};
