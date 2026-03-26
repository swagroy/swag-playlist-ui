import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { Menu } from 'lucide-react';
import type { Video } from '../mockData';
import Modal from './Modal';

export interface ReorderPlaylistModalProps {
  isOpen: boolean;
  playlistName: string;
  videos: Video[];
  onClose: () => void;
  onSave: (nextVideos: Video[]) => void;
}

interface RowProps {
  id: string;
  video: Video;
  isDraggingAny: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}

// 必須定義在模組最上層，避免每次 render 重新掛載導致拖拉只能在相鄰項目交換
const ReorderRow: React.FC<RowProps> = ({ id, video, isDraggingAny, onDragStart, onDragEnd }) => {
  const controls = useDragControls();
  const [hovered, setHovered] = useState(false);
  const [selfDragging, setSelfDragging] = useState(false);

  return (
    <Reorder.Item
      as="div"
      value={id}
      layout
      layoutScroll
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      dragListener={false}
      dragControls={controls}
      dragElastic={0.06}
      whileDrag={{
        scale: 1.04,
        zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 30px 60px -12px rgba(0,0,0,0.8)',
        borderRadius: 16,
        cursor: 'grabbing',
      }}
      animate={{
        opacity: isDraggingAny && !selfDragging ? 0.4 : 1,
      }}
      style={{
        position: 'relative',
        touchAction: 'none',
        transformOrigin: 'center center',
        width: '100%',
        borderRadius: 16,
      }}
      className="select-none w-full mb-3 rounded-xl border border-white/5 bg-[#232323] p-3"
      onDragStart={() => { setSelfDragging(true); onDragStart(); }}
      onDragEnd={() => { setSelfDragging(false); onDragEnd(); }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ transition: 'background 0.15s' }}
        className="flex items-center px-2 py-1"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            objectFit: 'cover',
            flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        />

        <div style={{ minWidth: 0, flex: 1, marginLeft: 16 }}>
          <div
            className="truncate"
            style={{
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
            }}
          >
            {video.title}
          </div>
          <div style={{ color: '#52525b', fontSize: '12px', marginTop: 4 }}>
            {video.createdAt}
          </div>
        </div>

        <motion.button
          type="button"
          aria-label="拖拽排序"
          onPointerDown={(e) => { e.preventDefault(); controls.start(e); }}
          style={{
            touchAction: 'none',
            padding: 0,
            border: 'none',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: 36,
            height: 36,
            cursor: 'grab',
            marginLeft: 8,
          }}
          whileTap={{ scale: 0.85 }}
        >
          <Menu
            size={20}
            strokeWidth={2}
            style={{
              display: 'block',
              color: hovered ? '#ffffff' : '#3f3f46',
              transition: 'color 0.15s',
            }}
          />
        </motion.button>
      </div>
    </Reorder.Item>
  );
};

const ReorderPlaylistModal: React.FC<ReorderPlaylistModalProps> = ({
  isOpen,
  playlistName,
  videos,
  onClose,
  onSave,
}) => {
  const [draftIds, setDraftIds] = useState<string[]>(videos.map((v) => v.id));
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setDraftIds(videos.map((v) => v.id));
  }, [isOpen, videos]);

  useEffect(() => {
    if (!isOpen || !isDragging) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen, isDragging]);

  const videoById = useMemo(() => {
    const m = new Map<string, Video>();
    videos.forEach((v) => m.set(v.id, v));
    return m;
  }, [videos]);

  const hasChanged = useMemo(() => {
    const base = videos.map((v) => v.id);
    return draftIds.length !== base.length || draftIds.some((id, i) => id !== base[i]);
  }, [draftIds, videos]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const nextVideos = draftIds.map((id) => videoById.get(id)).filter(Boolean) as Video[];
      onSave(nextVideos);
      toast.success('排序已更新');
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} fullscreen hideClose className="bg-[#191919]">
      <div className="w-full h-full flex flex-col" style={{ background: '#0a0a0a' }}>

        {/* Header */}
        <div
          className="sticky top-0 z-10 grid grid-cols-3 items-center px-5 py-4"
          style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            style={{
              justifySelf: 'start',
              background: 'none',
              border: 'none',
              padding: '4px 0',
              color: '#71717a',
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <span
            style={{
              justifySelf: 'center',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            排序
          </span>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !hasChanged}
            style={{
              justifySelf: 'end',
              background: 'none',
              border: 'none',
              padding: '4px 0',
              color: '#00D2BE',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              opacity: (!hasChanged || isSaving) ? 0.3 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {isSaving ? '儲存中…' : '儲存'}
          </button>
        </div>

        {/* 提示 */}
        <div style={{ color: '#52525b', fontSize: '12px', padding: '10px 20px 6px' }}>
          正在編輯「{playlistName}」的順序
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-16">
          <Reorder.Group
            as="div"
            axis="y"
            values={draftIds}
            onReorder={setDraftIds}
            style={{ padding: '4px 16px 0' }}
          >
            {draftIds.map((id) => {
              const video = videoById.get(id);
              if (!video) return null;
              return (
                <ReorderRow
                  key={id}
                  id={id}
                  video={video}
                  isDraggingAny={isDragging}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                />
              );
            })}
          </Reorder.Group>
        </div>

      </div>
    </Modal>
  );
};

export default ReorderPlaylistModal;
