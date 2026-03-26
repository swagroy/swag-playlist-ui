import React, { useState, useRef, useEffect, useMemo } from 'react';
import { playlistsMock, videosMock, Playlist, Video } from '../mockData';
import DeleteConfirmModal from './DeleteConfirmModal';
import CreatePlaylistModal from './CreatePlaylistModal';
import ReorderPlaylistModal from './ReorderPlaylistModal';
import { FaPlay, FaPen, FaTrash, FaLock, FaThumbsUp, FaShare, FaRegTrashAlt, FaEnvelope, FaCommentDots, FaClipboard, FaStickyNote, FaBell, FaEye, FaPause, FaStepForward, FaStepBackward, FaExpand, FaCompress, FaBackward, FaForward, FaChevronLeft } from 'react-icons/fa';
import ReactDOM from 'react-dom';
import Modal from './Modal';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, Globe, ListMinus, ListOrdered, Lock, MoreHorizontal, Pencil, Plus, Share2, Shuffle, Trash2 } from 'lucide-react';
import { PlayIcon, PauseIcon, BackwardIcon, ForwardIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import Replay10IconMui from '@mui/icons-material/Replay10';
import Forward10IconMui from '@mui/icons-material/Forward10';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

// 自訂上一部/下一部 SVG Icon
const PrevIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="4" y="6" width="3" height="20" rx="1" fill="currentColor"/>
    <polygon points="24,6 10,16 24,26" fill="currentColor"/>
  </svg>
);
const NextIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="25" y="6" width="3" height="20" rx="1" fill="currentColor"/>
    <polygon points="8,6 22,16 8,26" fill="currentColor"/>
  </svg>
);

// 型別 for item list
interface PlaylistItem {
  id: string;
  title: string;
  creator?: string;
  type: 'Video' | 'Story' | 'Photo' | 'Highlight';
  thumbnail: string;
  unlockedAt: string;
  duration?: string;
  views?: string;
  nickname?: string;
}

interface PlaylistInfo {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  cover: string;
  items: PlaylistItem[];
}

interface PlaylistContentPageProps {
  onBack?: () => void;
  playlist: Playlist;
  onEdit?: (playlist: Playlist) => void;
  onDelete?: (playlistId: string) => void;
}

const PlaylistContentPage: React.FC<PlaylistContentPageProps> = ({ onBack, playlist, onEdit, onDelete }) => {
  const [tab, setTab] = useState('All');
  const [sort, setSort] = useState('newest');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [moreMenuPos, setMoreMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [videoMenuOpenId, setVideoMenuOpenId] = useState<string | null>(null);
  const [videoMenuPos, setVideoMenuPos] = useState<{top: number, left: number} | null>(null);
  const [shareMenuOpenId, setShareMenuOpenId] = useState<string | null>(null);
  const [shareMenuPos, setShareMenuPos] = useState<{top: number, left: number} | null>(null);
  const videoBtnRefs = useRef<{[id: string]: HTMLButtonElement | null}>({});
  const videoBtnRefsDesktop = useRef<{[id: string]: HTMLButtonElement | null}>({});
  const shareBtnRefs = useRef<{[id: string]: HTMLButtonElement | null}>({});
  const moreBtnRef = useRef<HTMLButtonElement | null>(null);
  const items: PlaylistItem[] = playlist.videos.map((v) => ({
    id: v.id,
    title: v.title,
    creator: v.creator,
    nickname: v.nickname,
    type: (v.type as 'Video' | 'Story' | 'Photo' | 'Highlight') || 'Video',
    thumbnail: v.thumbnail,
    unlockedAt: v.createdAt,
    duration: v.duration,
    views: v.views,
  }));

  const mockPlaylist: PlaylistInfo = {
    id: playlist.id,
    title: playlist.name,
    description: playlist.description,
    createdAt: playlist.createdAt,
    cover: playlist.videos[0]?.thumbnail || '',
    items,
  };

  const typeTabs = [
    { label: '全部', value: 'All' },
    { label: '影片', value: 'Video' },
    { label: '短影音', value: 'Story' },
    { label: '照片', value: 'Photo' },
    { label: '限時動態', value: 'Highlight' },
  ];

  const sortOptions = [
    { label: '最新加入', value: 'newest' },
    { label: '最早加入', value: 'oldest' },
  ];

  // 篩選
  const filtered = tab === 'All' ? items : items.filter(i => i.type === tab);
  // 排序
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'newest') return b.unlockedAt.localeCompare(a.unlockedAt);
    if (sort === 'oldest') return a.unlockedAt.localeCompare(b.unlockedAt);
    return 0;
  });

  const shuffledSorted = useMemo(() => {
    const arr = [...sorted];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [sorted]);

  // 移除項目
  const handleRemove = (id: string) => {
    console.log('handleRemove 被調用，id:', id);
    if (!onEdit) {
      console.log('onEdit 函數不存在');
      return;
    }
    const newPlaylist = {
      ...playlist,
      videos: playlist.videos.filter(v => v.id !== id),
    };
    console.log('新的 playlist:', newPlaylist);
    onEdit(newPlaylist);
  };

  const [removeTarget, setRemoveTarget] = useState<{id: string, title: string} | null>(null);

  const [player, setPlayer] = useState<{open: boolean, index: number, list: PlaylistItem[], playing: boolean, progress: number}>({open: false, index: 0, list: [], playing: true, progress: 0});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true); // 預設顯示控制元件
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // 控制元件顯示邏輯
  const showControlsWithTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handlePlayerClick = () => {
    if (isMobile) {
      // 手機版：點擊切換控制元件顯示
      if (showControls) {
        setShowControls(false);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      } else {
        showControlsWithTimeout();
      }
    } else {
      // 桌機版：點擊重新顯示控制元件
      showControlsWithTimeout();
    }
  };

  const handlePlayerMouseEnter = () => {
    if (!isMobile) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  };

  const handlePlayerMouseLeave = () => {
    if (!isMobile) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // 初始化時顯示控制元件 3 秒
  useEffect(() => {
    if (player.open) {
      showControlsWithTimeout();
    }
  }, [player.open]);

  useEffect(() => {
    if (!shareMenuOpenId) return;
    const handleClick = (e: MouseEvent) => {
      const menu = document.querySelector('.z-50.bg-[#23272A]');
      const btn = shareBtnRefs.current[shareMenuOpenId];
      if (menu && menu.contains(e.target as Node)) return;
      if (btn && btn.contains(e.target as Node)) return;
      setShareMenuOpenId(null);
      setShareMenuPos(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [shareMenuOpenId]);

  useEffect(() => {
    if (!videoMenuOpenId) {
      setShareMenuOpenId(null);
      setShareMenuPos(null);
      return;
    }
    const handleClick = (e: MouseEvent) => {
      // 檢查是否點擊在任何選單元素上
      const target = e.target as Element;
      if (target.closest('[id^="video-menu"]')) return;
      if (target.closest('[id^="share-menu"]')) return;
      if (target.closest('.z-50')) return; // 檢查任何 z-50 的元素
      
      // 檢查是否點擊在按鈕上
      const btn = videoBtnRefs.current[videoMenuOpenId];
      const btnDesktop = videoBtnRefsDesktop.current[videoMenuOpenId];
      if (btn && btn.contains(target)) return;
      if (btnDesktop && btnDesktop.contains(target)) return;
      
      setVideoMenuOpenId(null);
      setVideoMenuPos(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [videoMenuOpenId]);

  // 桌機版「更多」浮動選單定位
  useEffect(() => {
    if (!moreMenuOpen) return;
    if (isMobile) return; // 手機版改用 Bottom Sheet，不需要定位 popover
    const btn = moreBtnRef.current;
    const rect = btn?.getBoundingClientRect();
    if (rect) {
      const menuWidth = 220;
      const menuHeight = 224; // 4 個選項的估算高度
      const screenWidth = window.innerWidth;
      let left = rect.right + window.scrollX - menuWidth;
      if (left < 8) left = 8;
      if (left + menuWidth > screenWidth - 8) left = screenWidth - menuWidth - 8;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow >= menuHeight + 8
        ? rect.bottom + window.scrollY + 8
        : rect.top + window.scrollY - menuHeight - 8;
      setMoreMenuPos({ top, left });
    } else {
      setMoreMenuPos({ top: 0, left: 0 });
    }

    const onDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      const menuEl = document.getElementById('playlist-more-menu');
      if (btn && target && btn.contains(target)) return;
      if (menuEl && target && menuEl.contains(target)) return;
      setMoreMenuOpen(false);
      setMoreMenuPos(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [moreMenuOpen, isMobile]);

  // 手機版所有 Bottom Sheet（播放清單更多 / 影片選單）開啟時鎖定 body 捲動
  useEffect(() => {
    if (!isMobile) return;
    const shouldLock = moreMenuOpen || !!videoMenuOpenId;
    if (!shouldLock) {
      document.body.style.overflow = 'auto';
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow || 'auto';
    };
  }, [moreMenuOpen, videoMenuOpenId, isMobile]);

  // 捲動時自動關閉所有桌機版 Popover
  useEffect(() => {
    const desktopMoreOpen = !isMobile && moreMenuOpen;
    const desktopVideoOpen = !isMobile && !!videoMenuOpenId;
    if (!desktopMoreOpen && !desktopVideoOpen) return;
    const handleScroll = () => {
      if (moreMenuOpen) { setMoreMenuOpen(false); setMoreMenuPos(null); }
      if (videoMenuOpenId) { setVideoMenuOpenId(null); setVideoMenuPos(null); }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [moreMenuOpen, videoMenuOpenId, isMobile]);

  // 自動播放進度與自動切換
  useEffect(() => {
    if (!player.open || !player.playing) return;
    if (player.list.length === 0) return;
    const duration = 5; // 每則 5 秒
    if (player.progress >= 1) {
      setPlayer(p => {
        const nextIdx = (p.index + 1) % p.list.length;
        return { ...p, index: nextIdx, progress: 0 };
      });
      return;
    }
    const timer = setTimeout(() => {
      setPlayer(p => ({ ...p, progress: Math.min(1, p.progress + 1 / duration) }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [player.open, player.playing, player.progress, player.list, player.index]);

  // 全螢幕切換
  useEffect(() => {
    const el = playerRef.current;
    if (isFullscreen) {
      if (el && el.requestFullscreen) el.requestFullscreen();
      const exit = () => setIsFullscreen(false);
      document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) exit();
      });
      return () => document.removeEventListener('fullscreenchange', exit);
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // 工具函數：格式化時間
  function formatTime(sec: number) {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // 將 '12:34' 轉為秒數
  function parseDuration(str?: string) {
    if (!str) return 0;
    if (str.includes('hr')) return 0; // 跳過特殊格式
    const parts = str.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  }

  const totalPlaylistMinutes = useMemo(() => {
    const totalSeconds = playlist.videos.reduce((sum, v) => sum + parseDuration(v.duration), 0);
    return Math.round(totalSeconds / 60);
  }, [playlist.videos]);

  return (
    <div className="w-screen min-h-screen bg-[#191919]">
      {/* 手機版 Sticky Header（只保留返回按鈕） */}
      <div className="md:hidden sticky top-0 z-40 bg-[#191919]/95 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="flex items-center">
          <button
            className="flex items-center gap-2 bg-gray-800 text-gray-200 text-sm font-medium rounded px-3 py-1.5 hover:bg-gray-700 transition shadow-none"
            onClick={() => onBack ? onBack() : window.history.back()}
          >
            <FaChevronLeft className="text-base" /> 回到播放清單
          </button>
        </div>
      </div>
      {/* 內容區域（桌機/手機共用） */}
      <div className="flex flex-col md:flex-row md:items-stretch w-full px-4 md:px-8 py-6 md:py-10 gap-4 md:gap-8">
        {/* 左側播放清單資訊卡片（Desktop 作為側邊欄） */}
        <div className="flex flex-col justify-between items-start w-full md:w-auto md:max-w-sm bg-[#232323] border border-white/5 rounded-2xl shadow-xl p-8 flex-shrink-0 md:flex-shrink-0 md:flex-basis-1/3 min-h-[550px] md:min-h-[600px] md:sticky md:top-8 md:self-start">
          {/* 桌機版返回按鈕 */}
          <button
            className="self-start mb-4 flex items-center gap-2 bg-gray-800 text-gray-200 text-sm font-medium rounded px-4 py-1.5 hover:bg-gray-700 transition shadow-none hidden md:flex"
            onClick={() => onBack ? onBack() : window.history.back()}
          >
            <FaChevronLeft className="text-base" /> 回到播放清單
          </button>
          <div className="w-full">
            <img src={mockPlaylist.cover} alt="cover" className="w-full md:w-60 h-48 md:h-40 object-cover rounded-2xl" />
            <div className="text-2xl md:text-3xl font-extrabold mt-8 mb-3 w-full text-left bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
              <span className="truncate">{mockPlaylist.title}</span>
            </div>
            <div className="text-zinc-500 text-sm md:text-sm mb-2 w-full text-left">
              {mockPlaylist.description}
            </div>
            <div className="text-[11px] text-zinc-500 mt-4 w-full text-left">
              {items.length} 部內容
              {totalPlaylistMinutes > 0 && ` ・ 總長約 ${totalPlaylistMinutes} 分鐘`}
              {' ・ 更新於 '}{playlist.createdAt}
            </div>
          </div>

          {/* 手機版：一大四小，單行佈局（回到之前確認過 OK 的版本） */}
          <div className="flex items-center w-full gap-4 mb-3 md:hidden">
            <motion.button
              className="bg-[#00D2BE] text-[#191919] font-bold text-sm h-11 px-4 rounded-full hover:bg-[#00bfa6] active:scale-95 transition flex items-center gap-2 justify-center w-[60%] whitespace-nowrap"
              onClick={() => setPlayer({ open: true, index: 0, list: sorted, playing: true, progress: 0 })}
              aria-label="全部播放"
              whileTap={{ scale: 0.96 }}
            >
              <FaPlay className="text-lg" />
              全部播放
            </motion.button>

            <div className="flex items-center gap-2 flex-shrink-0">
              <motion.button
                className="w-11 h-11 min-w-[44px] min-h-[44px] p-0 border border-white/10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 active:scale-95 transition-transform transition-colors duration-150 flex-shrink-0"
                aria-label="隨機播放"
                title="隨機"
                onClick={() => {
                  if (!shuffledSorted.length) return;
                  setPlayer({ open: true, index: 0, list: shuffledSorted, playing: true, progress: 0 });
                }}
                whileTap={{ scale: 0.96 }}
              >
                <Shuffle size={20} stroke="#ffffff" strokeWidth={2.5} />
              </motion.button>
              <motion.button
                className="w-11 h-11 min-w-[44px] min-h-[44px] p-0 border border-white/10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 active:scale-95 transition-transform transition-colors duration-150 flex-shrink-0"
                aria-label="排序"
                title="排序"
                onClick={() => setIsReorderOpen(true)}
                whileTap={{ scale: 0.96 }}
              >
                <ArrowUpDown size={20} stroke="#ffffff" strokeWidth={2.5} />
              </motion.button>
              <motion.button
                className="w-11 h-11 min-w-[44px] min-h-[44px] p-0 border border-white/10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 active:scale-95 transition-transform transition-colors duration-150 flex-shrink-0"
                aria-label="新增"
                title="新增"
                onClick={() => toast('尚未提供新增內容功能')}
                whileTap={{ scale: 0.96 }}
              >
                <Plus size={20} stroke="#ffffff" strokeWidth={2.5} />
              </motion.button>
              <motion.button
                ref={moreBtnRef}
                className="w-11 h-11 min-w-[44px] min-h-[44px] p-0 border border-white/10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 active:scale-95 transition-transform transition-colors duration-150 flex-shrink-0"
                aria-label="更多"
                title="更多"
                onClick={(e) => {
                  e.stopPropagation();
                  setMoreMenuOpen((v) => (isMobile ? true : !v));
                }}
                whileTap={{ scale: 0.96 }}
              >
                <MoreHorizontal size={20} stroke="#ffffff" strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>

          {/* 桌機版側邊欄：兩行佈局（第一行大按鈕，第二行四顆圓形按鈕） */}
          <div className="hidden md:flex w-full flex-col gap-0 mt-6 pt-8 border-t border-white/5">
            <motion.button
              className="w-full h-12 bg-[#00D2BE] text-[#191919] font-bold px-5 rounded-full hover:bg-[#00bfa6] active:scale-95 transition flex items-center gap-2 justify-center whitespace-nowrap"
              onClick={() => setPlayer({ open: true, index: 0, list: sorted, playing: true, progress: 0 })}
              aria-label="全部播放"
              whileTap={{ scale: 0.96 }}
            >
              <FaPlay className="text-lg" />
              全部播放
            </motion.button>
            <div className="grid grid-cols-4 gap-2 w-full mt-4">
              <motion.button
                className="w-full h-10 min-w-[40px] min-h-[40px] p-0 border border-white/10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 active:scale-95 transition-transform transition-colors duration-150"
                aria-label="隨機播放"
                title="隨機"
                onClick={() => {
                  if (!shuffledSorted.length) return;
                  setPlayer({ open: true, index: 0, list: shuffledSorted, playing: true, progress: 0 });
                }}
                whileTap={{ scale: 0.96 }}
              >
                <Shuffle size={20} stroke="#ffffff" strokeWidth={2.5} />
              </motion.button>
              <motion.button
                className="w-full h-10 min-w-[40px] min-h-[40px] p-0 border border-white/10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 active:scale-95 transition-transform transition-colors duration-150"
                aria-label="排序"
                title="排序"
                onClick={() => setIsReorderOpen(true)}
                whileTap={{ scale: 0.96 }}
              >
                <ArrowUpDown size={20} stroke="#ffffff" strokeWidth={2.5} />
              </motion.button>
              <motion.button
                className="w-full h-10 min-w-[40px] min-h-[40px] p-0 border border-white/10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 active:scale-95 transition-transform transition-colors duration-150"
                aria-label="新增"
                title="新增"
                onClick={() => toast('尚未提供新增內容功能')}
                whileTap={{ scale: 0.96 }}
              >
                <Plus size={20} stroke="#ffffff" strokeWidth={2.5} />
              </motion.button>
              <motion.button
                ref={moreBtnRef}
                className="w-full h-10 min-w-[40px] min-h-[40px] p-0 border border-white/10 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 active:scale-95 transition-transform transition-colors duration-150"
                aria-label="更多"
                title="更多"
                onClick={(e) => {
                  e.stopPropagation();
                  setMoreMenuOpen((v) => (isMobile ? true : !v));
                }}
                whileTap={{ scale: 0.96 }}
              >
                <MoreHorizontal size={20} stroke="#ffffff" strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>

          {!isMobile && moreMenuOpen && moreMenuPos && ReactDOM.createPortal(
            <div
              id="playlist-more-menu"
              className="z-[9999] bg-[#191919]/95 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl min-w-[220px] fixed overflow-hidden p-2"
              style={{ top: moreMenuPos.top, left: moreMenuPos.left }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 1. 分享清單 */}
              <button
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-800/70 active:bg-zinc-800 transition-colors duration-150 text-zinc-100 flex items-center gap-3 text-[15px] font-medium"
                onClick={async () => {
                  setMoreMenuOpen(false);
                  setMoreMenuPos(null);
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    toast.success('已複製');
                  } catch {
                    toast.error('複製失敗');
                  }
                }}
              >
                <Share2 className="w-[18px] h-[18px] text-white/90" />
                分享清單
              </button>
              <div className="my-1 h-px bg-white/10" />

              {/* 2. 公開播放清單（開關）*/}
              <div
                className="w-full px-4 py-3 rounded-xl flex items-center justify-between text-zinc-100 text-[15px] font-medium hover:bg-zinc-800/70 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3">
                  {playlist.isPrivate
                    ? <Lock className="w-[18px] h-[18px] text-white/90 flex-shrink-0" />
                    : <Globe className="w-[18px] h-[18px] text-white/90 flex-shrink-0" />
                  }
                  <span>公開播放清單</span>
                </div>
                <button
                  type="button"
                  className={`relative w-11 h-6 rounded-full flex items-center px-1 transition-colors duration-200 flex-shrink-0 ${
                    playlist.isPrivate ? 'bg-zinc-600' : 'bg-[#00D2BE]'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = !playlist.isPrivate;
                    onEdit && onEdit({ ...playlist, isPrivate: next });
                    toast.success('已更新隱私設定', { duration: 2000 });
                  }}
                >
                  <motion.div
                    className="w-4 h-4 rounded-full bg-white shadow"
                    animate={{ x: playlist.isPrivate ? 0 : 18 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
              <div className="my-1 h-px bg-white/10" />

              {/* 3. 編輯名稱與內容 */}
              <button
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-800/70 active:bg-zinc-800 transition-colors duration-150 text-zinc-100 flex items-center gap-3 text-[15px] font-medium"
                onClick={() => {
                  setMoreMenuOpen(false);
                  setMoreMenuPos(null);
                  setShowEditModal(true);
                }}
              >
                <Pencil className="w-[18px] h-[18px] text-white/90" />
                編輯名稱與內容
              </button>
              <div className="my-1 h-px bg-white/10" />

              {/* 4. 刪除清單 */}
              <button
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-800/70 active:bg-zinc-800 transition-colors duration-150 text-red-400 flex items-center gap-3 text-[15px] font-medium"
                onClick={() => {
                  setMoreMenuOpen(false);
                  setMoreMenuPos(null);
                  setShowDeleteModal(true);
                }}
              >
                <Trash2 className="w-[18px] h-[18px] text-red-400" />
                刪除清單
              </button>
            </div>,
            document.body
          )}

          <AnimatePresence>
            {isMobile && moreMenuOpen && (
              <>
                {ReactDOM.createPortal(
                  <motion.div
                    className="fixed inset-0 z-[9998] bg-black/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.12 } }}
                    exit={{ opacity: 0 }}
                    onClick={() => setMoreMenuOpen(false)}
                  />,
                  document.body
                )}
                {ReactDOM.createPortal(
                  <motion.div
                    className="fixed left-0 right-0 bottom-0 z-[9999] bg-[#191919]/95 backdrop-blur-xl border-t border-white/5 rounded-t-[28px] shadow-2xl"
                    initial={{ y: 400 }}
                    animate={{ y: 0 }}
                    exit={{ y: 400 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.02 }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.12}
                    onDragEnd={(_, info) => {
                      if (info.offset.y > 100 || info.velocity.y > 700) setMoreMenuOpen(false);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Handle */}
                    <div className="w-full flex justify-center pt-3 pb-2">
                      <div className="w-10 h-1 rounded-full bg-white/25" />
                    </div>
                    <div className="p-2 pb-8">
                      {/* 分享清單 */}
                      <button
                        className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-zinc-100 text-[15px] font-medium hover:bg-zinc-800/70 active:bg-zinc-800 transition-colors"
                        onClick={async () => {
                          setMoreMenuOpen(false);
                          try {
                            await navigator.clipboard.writeText(window.location.href);
                            toast.success('已複製');
                          } catch {
                            toast.error('複製失敗');
                          }
                        }}
                      >
                        <Share2 className="w-[18px] h-[18px] text-white/90 flex-shrink-0" />
                        分享清單
                      </button>
                      <div className="my-1 h-px bg-white/10" />

                      {/* 公開 / 私人 開關 */}
                      <div
                        className="w-full px-4 py-3 rounded-xl flex items-center justify-between text-zinc-100 text-[15px] font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-3">
                          {playlist.isPrivate
                            ? <Lock className="w-[18px] h-[18px] text-white/90 flex-shrink-0" />
                            : <Globe className="w-[18px] h-[18px] text-white/90 flex-shrink-0" />
                          }
                          <span>公開播放清單</span>
                        </div>
                        <button
                          type="button"
                          className={`relative w-11 h-6 rounded-full flex items-center px-1 transition-colors duration-200 flex-shrink-0 ${
                            playlist.isPrivate ? 'bg-zinc-600' : 'bg-[#00D2BE]'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = !playlist.isPrivate;
                            onEdit && onEdit({ ...playlist, isPrivate: next });
                            toast.success('已更新隱私設定', { duration: 2000 });
                          }}
                        >
                          <motion.div
                            className="w-4 h-4 rounded-full bg-white shadow"
                            animate={{ x: playlist.isPrivate ? 0 : 18 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                      <div className="my-1 h-px bg-white/10" />

                      {/* 編輯名稱與內容 */}
                      <button
                        className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-zinc-100 text-[15px] font-medium hover:bg-zinc-800/70 active:bg-zinc-800 transition-colors"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          setShowEditModal(true);
                        }}
                      >
                        <Pencil className="w-[18px] h-[18px] text-white/90 flex-shrink-0" />
                        編輯名稱與內容
                      </button>
                      <div className="my-1 h-px bg-white/10" />

                      {/* 刪除清單 */}
                      <button
                        className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-red-400 text-[15px] font-medium hover:bg-zinc-800/70 active:bg-zinc-800 transition-colors"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 className="w-[18px] h-[18px] text-red-400 flex-shrink-0" />
                        刪除清單
                      </button>
                    </div>
                  </motion.div>,
                  document.body
                )}
              </>
            )}
          </AnimatePresence>
        </div>
        {/* 右側內容列表區塊（原本內容不變） */}
        <div className="flex-1 flex flex-col w-full">
          {/* 手機版分類 tab */}
          <div className="md:hidden mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5">
              {typeTabs.map(tabItem => (
                <button
                  key={tabItem.value}
                  className={`flex-shrink-0 px-3 py-2 font-bold text-sm transition bg-transparent text-white hover:text-[#00D2BE] focus:outline-none relative ${tab === tabItem.value ? 'after:absolute after:left-0 after:right-0 after:-bottom-2 after:h-1 after:bg-[#00D2BE] after:rounded-full' : ''}`}
                  onClick={() => setTab(tabItem.value)}
                >
                  {tabItem.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 桌機版分類 tab 和排序選單 */}
          <div className="hidden md:flex flex-row items-center gap-4 mb-4 border-b border-white/5">
            {typeTabs.map(tabItem => (
              <button
                key={tabItem.value}
                className={`relative px-4 py-2 font-bold text-sm transition bg-transparent text-white hover:text-[#00D2BE] focus:outline-none ${tab === tabItem.value ? 'after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-1 after:bg-[#00D2BE] after:rounded-full' : ''}`}
                style={{ minWidth: 64 }}
                onClick={() => setTab(tabItem.value)}
              >
                {tabItem.label}
              </button>
            ))}
          </div>
          
          {/* 內容列表卡片 */}
          <div className="flex flex-col gap-0 w-full px-0 md:px-4">
            {sorted.map((item, idx) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row gap-4 md:gap-6 bg-transparent rounded-2xl p-4 md:p-5 items-start md:items-center border-b border-white/5 last:border-b-0 relative w-full select-none"
              >
                {/* 縮圖：獨立點擊區 */}
                <div
                  className="group/thumb relative w-full md:w-auto overflow-hidden rounded-xl flex-shrink-0 cursor-pointer active:scale-[0.97] transition-transform duration-150"
                  onClick={() => setPlayer({ open: true, index: idx, list: sorted, playing: true, progress: 0 })}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full md:w-40 h-48 md:h-24 object-cover rounded-xl transition-transform duration-300 group-hover/thumb:scale-[1.04]"
                  />
                  {(item.type === 'Video' || item.type === 'Photo') && item.duration && (
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-80 text-white text-xs font-bold px-2 py-1 rounded-lg">
                      {item.duration}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 w-full relative">
                  {/* 標題：獨立點擊區 */}
                  <div
                    className="font-bold text-zinc-100 hover:text-[#00D2BE] active:opacity-70 truncate text-base md:text-lg mb-2 flex items-center gap-2 transition-colors duration-150 cursor-pointer w-fit max-w-full"
                    onClick={() => setPlayer({ open: true, index: idx, list: sorted, playing: true, progress: 0 })}
                  >
                    {item.type === 'Highlight'
                      ? item.title.replace(/^限時動態：/, '')
                      : item.type === 'Story'
                        ? item.title.replace(/[（(]短影音[）)]/, '')
                        : item.title}
                  </div>
                  <div className="flex flex-col gap-1 text-sm font-semibold">
                    <div className="flex gap-1 items-center">
                      <span className="font-bold text-white">{item.nickname || '未知暱稱'}</span>
                      <span className="font-semibold text-gray-400">{item.creator || '@unknown'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-4 items-center text-gray-400">
                      {tab === 'All' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-600 text-white">
                          {item.type === 'Video' ? '影片' : item.type === 'Story' ? '短影音' : item.type === 'Photo' ? '照片' : item.type === 'Highlight' ? '限時動態' : ''}
                        </span>
                      )}
                      {(tab === 'All' && (item.type === 'Highlight' || item.type === 'Photo' || item.type === 'Story')) ||
                       (tab === 'Highlight' && item.type === 'Highlight') ||
                       (tab === 'Photo' && item.type === 'Photo') ||
                       (tab === 'Story' && item.type === 'Story') ? (
                        <span className="flex items-center gap-1"><FaEye className="inline-block" />{item.views || '0'}</span>
                      ) : (
                        <span className="flex items-center gap-1"><FaLock className="inline-block" />744</span>
                      )}
                      <span className="flex items-center gap-1"><FaThumbsUp className="inline-block" />100%</span>
                    </div>
                  </div>
                  {/* menu 按鈕（手機 + 桌機統一） */}
                  <button
                    ref={el => videoBtnRefs.current[item.id] = el}
                    className={`absolute top-1 right-1 transition-opacity duration-100 ${
                      videoMenuOpenId === item.id ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    } p-1 border-0 flex items-center justify-center text-zinc-500 hover:text-zinc-200`}
                    onClick={e => {
                      e.stopPropagation();
                      if (item.id === videoMenuOpenId) {
                        setVideoMenuOpenId(null);
                        setVideoMenuPos(null);
                      } else {
                        setVideoMenuOpenId(item.id);
                        if (!isMobile) {
                          const btn = videoBtnRefs.current[item.id];
                          const rect = btn?.getBoundingClientRect();
                          if (rect) {
                            const menuWidth = 220;
                            const menuHeight = 112; // 2 個選項的估算高度
                            let left = rect.right + window.scrollX - menuWidth;
                            if (left < 8) left = 8;
                            if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8;
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const top = spaceBelow >= menuHeight + 6
                              ? rect.bottom + window.scrollY + 6
                              : rect.top + window.scrollY - menuHeight - 6;
                            setVideoMenuPos({ top, left });
                          }
                        } else {
                          setVideoMenuPos(null);
                        }
                      }
                    }}
                  >
                    <MoreHorizontal size={20} className="text-inherit" strokeWidth={2} />
                  </button>
                  <AnimatePresence>
                    {videoMenuOpenId === item.id && (
                      <>
                        {/* 桌機版：Popover */}
                        {!isMobile && videoMenuPos && ReactDOM.createPortal(
                          <>
                            <div
                              className="fixed inset-0 z-[9997]"
                              onClick={() => { setVideoMenuOpenId(null); setVideoMenuPos(null); }}
                            />
                            <motion.div
                              className="fixed z-[9999] bg-[#191919]/95 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl min-w-[220px] overflow-hidden p-2"
                              style={{ top: videoMenuPos.top, left: videoMenuPos.left }}
                              initial={{ opacity: 0, scale: 0.95, y: -6 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -6 }}
                              transition={{ duration: 0.12 }}
                              onClick={e => e.stopPropagation()}
                            >
                              <button
                                className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-zinc-100 text-[15px] font-medium hover:bg-zinc-800/70 active:bg-zinc-800 transition-colors"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setVideoMenuOpenId(null);
                                  setVideoMenuPos(null);
                                  try {
                                    await navigator.clipboard.writeText(window.location.href);
                                    toast.success('已複製');
                                  } catch {
                                    toast.error('複製失敗');
                                  }
                                }}
                              >
                                <Share2 className="w-[18px] h-[18px] text-zinc-100/80 flex-shrink-0" />
                                分享
                              </button>
                              <div className="my-1 h-px bg-white/10" />
                              <button
                                className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-red-400 text-[15px] font-medium hover:bg-zinc-800/70 active:bg-zinc-800 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRemoveTarget({ id: item.id, title: item.title });
                                  setVideoMenuOpenId(null);
                                  setVideoMenuPos(null);
                                }}
                              >
                                <ListMinus className="w-[18px] h-[18px] text-red-400 flex-shrink-0" />
                                從「{mockPlaylist.title}」移除
                              </button>
                            </motion.div>
                          </>,
                          document.body
                        )}

                        {/* 手機版：Bottom Sheet */}
                        {isMobile && (
                          <>
                            {ReactDOM.createPortal(
                              <motion.div
                                className="fixed inset-0 z-[9998] bg-black/60"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { duration: 0.12 } }}
                                exit={{ opacity: 0 }}
                                onClick={() => {
                                  setVideoMenuOpenId(null);
                                  setVideoMenuPos(null);
                                  setShareMenuOpenId(null);
                                  setShareMenuPos(null);
                                }}
                              />,
                              document.body
                            )}
                            {ReactDOM.createPortal(
                              <motion.div
                                className="fixed left-0 right-0 bottom-0 z-[9999] bg-[#191919]/95 backdrop-blur-xl border-t border-white/5 rounded-t-[28px] shadow-2xl"
                                initial={{ y: 200 }}
                                animate={{ y: 0 }}
                                exit={{ y: 200 }}
                                transition={{ type: 'spring', stiffness: 320, damping: 30, delay: 0.02 }}
                                drag="y"
                                dragConstraints={{ top: 0, bottom: 0 }}
                                dragElastic={0.12}
                                onDragEnd={(_, info) => {
                                  if (info.offset.y > 80 || info.velocity.y > 600) {
                                    setVideoMenuOpenId(null);
                                    setVideoMenuPos(null);
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="w-full flex justify-center pt-3 pb-2">
                                  <div className="w-10 h-1 rounded-full bg-white/25" />
                                </div>
                                <div className="p-2 pb-8">
                                  <button
                                    className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-zinc-100 text-[15px] font-medium hover:bg-zinc-800/70 active:bg-zinc-800 transition-colors"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      setVideoMenuOpenId(null);
                                      setVideoMenuPos(null);
                                      try {
                                        await navigator.clipboard.writeText(window.location.href);
                                        toast.success('已複製');
                                      } catch {
                                        toast.error('複製失敗');
                                      }
                                    }}
                                  >
                                    <Share2 className="w-[18px] h-[18px] text-white/90 flex-shrink-0" />
                                    分享
                                  </button>
                                  <div className="my-1 h-px bg-white/10" />
                                  <button
                                    className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-red-400 text-[15px] font-medium hover:bg-zinc-800/70 active:bg-zinc-800 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRemoveTarget({ id: item.id, title: item.title });
                                      setVideoMenuOpenId(null);
                                      setVideoMenuPos(null);
                                    }}
                                  >
                                    <ListMinus className="w-[18px] h-[18px] text-red-400 flex-shrink-0" />
                                    從「{mockPlaylist.title}」移除
                                  </button>
                                </div>
                              </motion.div>,
                              document.body
                            )}
                          </>
                        )}
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
            {sorted.length === 0 && (
              <div className="text-center text-zinc-500 text-sm py-16 tracking-wide">此分類下尚無內容</div>
            )}
          </div>
        </div>
      </div>
      <CreatePlaylistModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        mode="edit"
        initialName={playlist.name}
        initialDescription={playlist.description || ''}
        initialIsPrivate={playlist.isPrivate}
        onCreate={(name, description, isPrivate) => {
          onEdit && onEdit({ ...playlist, name, description, isPrivate });
        }}
      />
      <ReorderPlaylistModal
        isOpen={isReorderOpen}
        playlistName={playlist.name}
        videos={playlist.videos}
        onClose={() => setIsReorderOpen(false)}
        onSave={(nextVideos: Video[]) => {
          onEdit && onEdit({ ...playlist, videos: nextVideos });
        }}
      />
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          onDelete && onDelete(playlist.id);
          setShowDeleteModal(false);
          onBack && onBack();
        }}
        title="刪除播放清單"
        description={`確定要刪除「${playlist.name}」嗎？此操作無法復原。`}
      />
      <DeleteConfirmModal
        isOpen={!!removeTarget}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (removeTarget) handleRemove(removeTarget.id);
          setRemoveTarget(null);
        }}
        title="移除內容"
        description={removeTarget ? `確定要將「${removeTarget.title}」從「${playlist.name}」移除嗎？` : ''}
      />
      {/* 大圖 Modal 播放器 */}
      {player.open && player.list.length > 0 && (
        <Modal
          isOpen={player.open}
          onClose={() => setPlayer(p => ({...p, open: false, progress: 0}))}
          fullscreen={isFullscreen}
          hideClose={isFullscreen}
          className="bg-black w-full h-full rounded-none p-0"
        >
          <div
            ref={playerRef}
            className="relative w-full flex items-center justify-center bg-black"
            onClick={handlePlayerClick}
            onMouseEnter={handlePlayerMouseEnter}
            onMouseLeave={handlePlayerMouseLeave}
          >
            <div className="relative w-[90vw] h-[90vh] flex items-center justify-center bg-black">
              <img
                src={player.list[player.index].thumbnail}
                alt="thumb"
                className={`object-contain ${
                  player.list[player.index].type === 'Story' || player.list[player.index].type === 'Highlight'
                    ? 'h-full w-auto' // 直式內容：高度填滿，寬度自適應
                    : 'w-full h-auto' // 橫式內容：寬度填滿，高度自適應
                }`}
                style={{ borderRadius: 0 }}
              />
              {/* 控制列區域 */}
              {showControls && (
                <div className="absolute left-0 right-0 bottom-0 w-full z-20 flex flex-col pb-0" style={{background: 'transparent'}}>
                  {/* 進度條 */}
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={player.progress}
                    onChange={e => setPlayer(p => ({...p, progress: parseFloat(e.target.value)}))}
                    className="w-full h-1.5 accent-white"
                    style={{ pointerEvents: 'auto', height: '4px', marginBottom: 0 }}
                  />
                  {/* 控制按鈕 row */}
                  <div className="flex items-center gap-4 px-6 mt-1" style={{height: '52px', minHeight: '52px', background: 'transparent'}}>
                    {/* 上一部 */}
                    <button className="flex items-center justify-center w-10 h-10 p-2 focus:outline-none transition-all duration-150 hover:scale-110" onClick={() => setPlayer(p => ({...p, index: (p.index-1+p.list.length)%p.list.length, progress: 0}))} title="上一部">
                      <PrevIcon className="w-7 h-7 text-white" />
                    </button>
                    {/* 倒退10秒 */}
                    <button className="flex items-center justify-center w-10 h-10 p-2 focus:outline-none transition-all duration-150 hover:scale-110" onClick={() => setPlayer(p => ({...p, progress: Math.max(0, p.progress-0.2)}))} title="倒退10秒">
                      <Replay10IconMui className="w-7 h-7 text-white" />
                    </button>
                    {/* 播放/暫停 */}
                    <button className="flex items-center justify-center w-10 h-10 p-2 focus:outline-none transition-all duration-150 hover:scale-110" onClick={() => setPlayer(p => ({...p, playing: !p.playing}))} title={player.playing ? '暫停' : '播放'}>
                      {player.playing ? <PauseIcon className="w-8 h-8 text-white" /> : <PlayIcon className="w-8 h-8 text-white" />}
                    </button>
                    {/* 快進10秒 */}
                    <button className="flex items-center justify-center w-10 h-10 p-2 focus:outline-none transition-all duration-150 hover:scale-110" onClick={() => setPlayer(p => ({...p, progress: Math.min(1, p.progress+0.2)}))} title="快進10秒">
                      <Forward10IconMui className="w-7 h-7 text-white" />
                    </button>
                    {/* 下一部 */}
                    <button className="flex items-center justify-center w-10 h-10 p-2 focus:outline-none transition-all duration-150 hover:scale-110" onClick={() => setPlayer(p => ({...p, index: (p.index+1)%p.list.length, progress: 0}))} title="下一部">
                      <NextIcon className="w-7 h-7 text-white" />
                    </button>
                    {/* 播放時間/總長度（僅影片顯示） */}
                    {player.list[player.index]?.type === 'Video' && (
                      <span className="text-white text-sm font-mono select-none ml-2">
                        {formatTime(player.progress * parseDuration(player.list[player.index]?.duration))} / {formatTime(parseDuration(player.list[player.index]?.duration))}
                      </span>
                    )}
                    {/* 右側聲音/全螢幕 */}
                    <div className="flex items-center gap-2 ml-auto">
                      {/* 聲音開關 */}
                      <button className="flex items-center justify-center w-10 h-10 p-2 focus:outline-none transition-all duration-150 hover:scale-110" onClick={() => setMuted(m => !m)} title={muted ? '取消靜音' : '靜音'}>
                        {muted ? <VolumeOffIcon className="w-7 h-7 text-white" /> : <VolumeUpIcon className="w-7 h-7 text-white" />}
                      </button>
                      {/* 全螢幕按鈕 */}
                      <button
                        className="flex items-center justify-center w-10 h-10 p-2 focus:outline-none transition-all duration-150 hover:scale-110"
                        onClick={() => setIsFullscreen(f => !f)}
                        title={isFullscreen ? '離開全螢幕' : '全螢幕'}
                      >
                        {isFullscreen ? <FullscreenExitIcon className="w-7 h-7 text-white" /> : <FullscreenIcon className="w-7 h-7 text-white" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* 標題與創作者資訊浮於左上角 */}
              {showControls && (
                <>
                  {/* subtle top gradient for readability */}
                  <div className="absolute top-0 left-0 w-full h-24 pointer-events-none z-10" style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)'}} />
                  <div className="absolute top-6 left-8 flex flex-col gap-1 z-20">
                    <div className="text-white text-lg font-bold truncate max-w-[40vw] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{player.list[player.index].title}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{player.list[player.index].nickname || '未知暱稱'}</span>
                      <span className="text-gray-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{player.list[player.index].creator || '@unknown'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PlaylistContentPage; 