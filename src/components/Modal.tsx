import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  fullscreen?: boolean;
  hideClose?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, fullscreen = false, hideClose = false, className }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={
          fullscreen
            ? `relative w-full h-full flex items-center justify-center ${className || ''}`
            : `${className || 'bg-[#222428] rounded-xl shadow-lg p-6 md:p-10 w-full max-w-xl relative mx-4 md:mx-0'}`
        }
        style={fullscreen ? { borderRadius: 0, padding: 0, maxWidth: '100vw', height: '100vh' } : {}}
      >
        {!hideClose && (
          <button
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-white text-lg hover:bg-black/80 hover:text-[#00D2BE] transition z-10 shadow-none"
            onClick={onClose}
            aria-label="關閉"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal; 