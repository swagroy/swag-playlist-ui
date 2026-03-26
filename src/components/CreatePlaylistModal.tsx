import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { t } from '../locales';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string, isPrivate?: boolean) => void;
  initialName?: string;
  initialDescription?: string;
  mode?: 'create' | 'edit';
  initialIsPrivate?: boolean;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  initialName = '',
  initialDescription = '',
  mode = 'create',
  initialIsPrivate = false,
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [showPrivateConfirm, setShowPrivateConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
      setIsPrivate(initialIsPrivate);
    }
  }, [isOpen, initialName, initialDescription, initialIsPrivate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 md:p-0">
      <div className="bg-[#191919] border border-white/5 rounded-2xl shadow-2xl p-6 md:p-10 w-full max-w-xl relative max-h-[90vh] md:max-h-none overflow-y-auto">
        <button className="absolute top-4 md:top-5 right-4 md:right-5 text-lg md:text-2xl text-[#B0B0B0] hover:text-white transition-colors duration-150" onClick={onClose}>×</button>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-white pr-8">{mode === 'edit' ? t('editPlaylist') : t('createNewPlaylist')}</h2>
        <label className="block mb-2 text-base md:text-lg font-semibold text-white">{t('playlistName')} *</label>
        <input
          className="w-full border border-white/5 bg-[#232323] rounded-xl px-3 md:px-4 py-3 md:py-4 mb-4 md:mb-6 text-base md:text-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#00D2BE]/60 focus:border-transparent"
          placeholder={t('playlistName')}
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <label className="block mb-2 text-base md:text-lg font-semibold text-white">{t('descriptionOptional')}</label>
        <div className="text-xs md:text-sm text-gray-400 mb-2 leading-relaxed">{t('descriptionHint')}</div>
        <textarea
          className="w-full border border-white/5 bg-[#232323] rounded-xl px-3 md:px-4 py-3 md:py-4 mb-6 md:mb-8 text-base md:text-lg text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#00D2BE]/60 focus:border-transparent resize-none"
          placeholder={t('description')}
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
        {/* 設為私人開關 */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-semibold text-white">設為私人</span>
            <span className="text-xs md:text-sm text-gray-400 mt-1">
              啟用後，只有你自己可以看到這個播放清單。
            </span>
          </div>
          <button
            type="button"
            className={`relative w-12 h-7 rounded-full flex items-center px-1 transition-colors duration-200 ${
              isPrivate ? 'bg-[#00D2BE]' : 'bg-zinc-600'
            }`}
            onClick={() => {
              if (!isPrivate) {
                setShowPrivateConfirm(true);
              } else {
                setIsPrivate(false);
              }
            }}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                isPrivate ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
        <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-4">
          <button className="px-6 md:px-8 py-3 rounded-xl bg-[#232323] text-base md:text-lg font-semibold text-zinc-400 hover:bg-[#2a2a2a] border border-white/5 transition-colors duration-150" onClick={onClose}>{t('cancel')}</button>
          <button
            className="px-6 md:px-8 py-3 rounded-xl bg-[#00D2BE] text-[#191919] text-base md:text-lg font-semibold hover:bg-[#00bfa6] disabled:opacity-50"
            disabled={!name.trim()}
            onClick={() => {
              onCreate(name.trim(), description.trim() || undefined, isPrivate);
              setName('');
              setDescription('');
              setIsPrivate(false);
            }}
          >
            {mode === 'edit' ? t('confirm') : t('createPlaylist')}
          </button>
        </div>

        {/* 設為私人確認彈窗 */}
        <AnimatePresence>
          {showPrivateConfirm && (
            <>
              <motion.div
                className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPrivateConfirm(false)}
              />
              <motion.div
                className="fixed inset-0 z-[61] flex items-center justify-center px-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <div className="bg-white rounded-[32px] max-w-sm w-full p-6 space-y-4 shadow-2xl">
                  <h3 className="text-lg font-bold text-black text-center">將播放清單設為私人？</h3>
                  <p className="text-sm text-zinc-700 text-center leading-relaxed">
                    設為私人後，此播放清單只會在你的帳號中顯示，其他人將無法看到。
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      className="w-full py-3 rounded-2xl bg-black text-white font-semibold text-sm"
                      onClick={() => {
                        setIsPrivate(true);
                        setShowPrivateConfirm(false);
                      }}
                    >
                      確定
                    </button>
                    <button
                      type="button"
                      className="w-full py-3 rounded-2xl text-zinc-500 font-semibold text-sm"
                      onClick={() => setShowPrivateConfirm(false)}
                    >
                      取消
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreatePlaylistModal; 