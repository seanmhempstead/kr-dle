import { CharStatus } from '../types';

export const STATUS_STYLES = {
    [CharStatus.Correct]: {
        bg: 'bg-emerald-600',
        text: 'text-white',
        border: 'border-emerald-600',
        keyBorder: 'border-emerald-700'
    },
    [CharStatus.Present]: {
        bg: 'bg-yellow-500',
        text: 'text-zinc-950',
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
        bg: 'bg-zinc-800',
        text: 'text-zinc-500',
        border: 'border-zinc-800',
        keyBorder: 'border-zinc-900'
    },
    [CharStatus.None]: {
        bg: 'bg-zinc-700/50', // Default cell bg
        text: 'text-zinc-100',
        border: 'border-zinc-700/30', // Default cell border
        keyBg: 'bg-zinc-600/80', // Default key bg
        keyText: 'text-zinc-100',
        keyHover: 'hover:bg-zinc-500 hover:text-white'
    }
};
