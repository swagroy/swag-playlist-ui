import React from 'react';
import Modal from './Modal';
import { t } from '../locales';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  title = t('delete'),
  description = t('deleteConfirm'),
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-center text-white">{title}</h2>
      <div className="mb-6 md:mb-8 text-center text-base md:text-lg text-[#E0E0E0] leading-relaxed">{description}</div>
      <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4">
        <button
          className="px-6 md:px-8 py-3 rounded-full bg-gray-700 text-white text-base md:text-lg font-semibold hover:bg-gray-600 transition"
          onClick={onCancel}
        >
          {t('cancel')}
        </button>
        <button
          className="px-6 md:px-8 py-3 rounded-full bg-[#00D2BE] text-[#191919] text-base md:text-lg font-bold hover:bg-[#00bfa6] transition"
          onClick={onConfirm}
        >
          {t('confirm')}
        </button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal; 