import React from 'react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-200">

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

                <h2 className="text-2xl font-bold text-white mb-4">How to Play</h2>

                <div className="space-y-4 text-sm sm:text-base">
                    <p>Guess the <span className="font-bold text-white">2-syllable word</span>.</p>
                    <p>The tiles will change color to show how close your guess was to the word.</p>

                    <div className="space-y-3 mt-4">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-green-500 rounded flex-shrink-0 mt-0.5"></div>
                            <div>
                                <span className="font-bold text-green-400">Green</span>: The Jamo is correct and in the correct position.
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-yellow-500 rounded flex-shrink-0 mt-0.5"></div>
                            <div>
                                <span className="font-bold text-yellow-400">Yellow</span>: The Jamo is in the correct syllable, but in the wrong position.
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-orange-500 rounded flex-shrink-0 mt-0.5"></div>
                            <div>
                                <span className="font-bold text-orange-400">Orange</span>: The Jamo is in the word, but in the wrong syllable.
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-slate-600 rounded flex-shrink-0 mt-0.5"></div>
                            <div>
                                <span className="font-bold text-slate-400">Gray</span>: The Jamo is not in the word.
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HelpModal;
