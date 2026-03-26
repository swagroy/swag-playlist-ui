const zhTW = {
  createPlaylist: '＋建立播放清單',
  createNewPlaylist: '建立新的播放清單',
  playlistName: '播放清單名稱',
  description: '描述（選填）',
  descriptionOptional: '描述（選填）',
  descriptionHint: '建議輸入讓你記得這個清單的用途，例如「自慰特輯」、「實戰精選」等。',
  cancel: '取消',
  confirm: '確定',
  delete: '刪除',
  deleteConfirm: '確定要刪除「{name}」嗎？',
  noPlaylists: '你還沒有任何播放清單，現在就來收藏你喜歡的影片吧',
  startCreatePlaylist: '＋ 開始建立播放清單',
  myPlaylists: '我的播放清單',
  allVideos: '所有影片',
  createdAt: '建立於 {date}',
  editPlaylist: '編輯播放清單',
  unlockCount: '解鎖數',
  likePercent: '喜歡百分比',
};

const enUS = {
  createPlaylist: '+Create Playlist',
  createNewPlaylist: 'Create New Playlist',
  playlistName: 'Playlist Name',
  description: 'Description (Optional)',
  descriptionOptional: 'Description (Optional)',
  descriptionHint: 'Add a note to help you remember the purpose of this playlist, e.g. "Solo Special", "Best Practices", etc.',
  cancel: 'Cancel',
  confirm: 'Confirm',
  delete: 'Delete',
  deleteConfirm: 'Are you sure you want to delete "{name}"?',
  noPlaylists: 'You have no playlists yet. Start collecting your favorite videos now!',
  startCreatePlaylist: '+ Start Creating Playlist',
  myPlaylists: 'My Playlists',
  allVideos: 'All Videos',
  createdAt: 'Created {date}',
  editPlaylist: 'Edit Playlist',
  unlockCount: 'Unlocks',
  likePercent: 'Likes',
};

export const locales = { zhTW, enUS };

type LocaleKey = keyof typeof zhTW;
type LocaleVars = Record<string, string>;

let currentLang: keyof typeof locales = 'zhTW';
export function setLang(lang: keyof typeof locales) {
  if (locales[lang]) currentLang = lang;
}
export function t(key: LocaleKey, vars?: LocaleVars) {
  let str = locales[currentLang][key] || key;
  if (vars) {
    Object.keys(vars).forEach(k => {
      str = str.replace(`{${k}}`, vars[k]);
    });
  }
  return str;
} 