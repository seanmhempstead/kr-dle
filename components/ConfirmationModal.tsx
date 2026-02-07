import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel"
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <div className="glass-panel relative w-full max-w-sm rounded-3xl p-8 text-center overflow-hidden">
                {/* Accent line at top */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-500/20 to-transparent"></div>

                <h3 className="text-xl font-semibold text-zinc-100 mb-2 tracking-tight uppercase tracking-[0.1em]">{title}</h3>
                <p className="text-zinc-500 mb-8 text-sm leading-relaxed">{message}</p>

                <div className="flex flex-col gap-3 justify-center">
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="w-full px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-lg transition-all uppercase tracking-widest text-xs"
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-zinc-800/60 hover:bg-zinc-700/80 text-zinc-400 hover:text-zinc-100 font-bold rounded-lg transition-all uppercase tracking-widest text-xs border border-zinc-700/40"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
