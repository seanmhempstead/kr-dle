import React from 'react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <div className="glass-panel relative w-full max-w-md rounded-3xl p-6 text-zinc-400 overflow-hidden">
                {/* Accent line at top */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-500/20 to-transparent"></div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                    aria-label="Close Help"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-semibold text-zinc-100 mb-6 tracking-tight flex items-center gap-2">
                    <div className="w-4 h-4 bg-zinc-100 rounded-[2px] flex items-center justify-center">
                        <div className="w-2 h-2 bg-zinc-950 rounded-[1px]"></div>
                    </div>
                    HOW_TO_PLAY
                </h2>

                <div className="space-y-4 text-sm sm:text-base leading-relaxed">
                    <p>Guess the <span className="font-bold text-zinc-100">2-syllable word</span> in <span className="font-bold text-zinc-100">5</span> or fewer tries.</p>
                    <p>The tiles will change color to show how close your guess was to the target word.</p>

                    <div className="space-y-3 mt-4">
                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 bg-emerald-600 rounded-lg flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]"></div>
                            <div>
                                <span className="font-bold text-emerald-500 uppercase text-xs tracking-wider">Correct</span>
                                <p className="text-zinc-500 text-xs mt-0.5">The Jamo is correct and in the correct position.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 bg-yellow-500 rounded-lg flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(234,179,8,0.2)]"></div>
                            <div>
                                <span className="font-bold text-yellow-500 uppercase text-xs tracking-wider">Present</span>
                                <p className="text-zinc-500 text-xs mt-0.5">The Jamo is in the correct syllable, but in the wrong position.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 bg-orange-500 rounded-lg flex-shrink-0 mt-0.5 shadow-[0_0_10px_rgba(249,115,22,0.2)]"></div>
                            <div>
                                <span className="font-bold text-orange-500 uppercase text-xs tracking-wider">In Word</span>
                                <p className="text-zinc-500 text-xs mt-0.5">The Jamo is in the word, but in a different syllable.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 bg-zinc-800 border border-zinc-900 rounded-lg flex-shrink-0 mt-0.5"></div>
                            <div>
                                <span className="font-bold text-zinc-500 uppercase text-xs tracking-wider">Absent</span>
                                <p className="text-zinc-500 text-xs mt-0.5">The Jamo is not present in the word.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800/50 mt-6 flex items-center gap-3 text-zinc-500">
                        <div className="p-1.5 bg-zinc-800/50 rounded-full border border-zinc-700/30 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                        </div>
                        <p className="text-sm italic">
                            Click the reset button at the top to start a new game with a different word.
                        </p>
                    </div>

                    <div className="pt-2 flex items-center gap-3 text-zinc-500">
                        <div className="p-1.5 bg-zinc-800/50 rounded-full border border-zinc-700/30 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m4 0h1m-7 4h6m-9-9h12a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z" />
                            </svg>
                        </div>
                        <p className="text-sm italic">
                            Playing on PC? You can use your physical keyboard or the onscreen keyboard.
                        </p>
                    </div>
                </div>

            </div>
        </div >
    );
};

export default HelpModal;
