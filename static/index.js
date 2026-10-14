(function () {
  'use strict';

  const ICON_PATHS = {
    home: '<path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    library: '<path d="M4 4h4v16H4zM10 4h4v16h-4zM17 4l4 1v15l-4-1z"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
    radio: '<circle cx="12" cy="12" r="2"/><path d="M4.9 19.1a10 10 0 0 1 0-14.2M19.1 4.9a10 10 0 0 1 0 14.2M7.8 16.2a5.5 5.5 0 0 1 0-8.4M16.2 7.8a5.5 5.5 0 0 1 0 8.4"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-4 4-11 15-11 0 11-7 15-11 15Z"/><path d="M4 20 15 9"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1Z"/>',
    play: '<path d="M6 4.5v15l13-7.5Z"/>',
    pause: '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>',
    skipBack: '<path d="M19 5v14L8 12ZM5 5v14"/>',
    skipForward: '<path d="M5 5v14l11-7ZM19 5v14"/>',
    shuffle: '<path d="M2 5h4l10 14h6M2 19h4l4-5.5M18 5h4v4M22 5l-6 7M22 19l-6-7"/>',
    repeat: '<path d="M17 2l4 4-4 4M3 12v-2a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 12v2a4 4 0 0 1-4 4H3"/>',
    volume2: '<path d="M5 9v6h4l5 5V4L9 9Z"/><path d="M16 8a5 5 0 0 1 0 8M18.5 5.5a9 9 0 0 1 0 13"/>',
    volume1: '<path d="M5 9v6h4l5 5V4L9 9Z"/><path d="M16 8a5 5 0 0 1 0 8"/>',
    volumeX: '<path d="M5 9v6h4l5 5V4L9 9Z"/><path d="M17 9l5 6M22 9l-5 6"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 19v3"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M2 14h4M10 8h4M18 12h4"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    rotateCcw: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    volumeIcon: '<path d="M5 9v6h4l5 5V4L9 9Z"/>',
    trendingUp: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
    sparkles: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
    headphones: '<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="3" y="14" width="5" height="7" rx="1.5"/><rect x="16" y="14" width="5" height="7" rx="1.5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
    palette: '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1.2"/><circle cx="13" cy="8.5" r="1.2"/><circle cx="16" cy="11.5" r="1.2"/><circle cx="10.5" cy="15" r="1.2"/><path d="M12 3a9 9 0 0 0 0 18c1.2 0 2-.8 2-2 0-.6-.3-1-.6-1.4-.3-.4-.6-.8-.6-1.4 0-.9.7-1.6 1.6-1.6H16a4 4 0 0 0 4-4 9 9 0 0 0-8-8.6Z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
  };
  function icon(name, cls) {
    return `<svg class="${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name] || ''}</svg>`;
  }

  const I18N = {
    ru: {
      appName: 'Leaf', tagline: 'Музыка для души',
      navHome: 'Главная', navSearch: 'Поиск', navLibrary: 'Моя медиатека', navLiked: 'Любимые треки', navRadio: 'Радио',
      createPlaylist: 'Создать плейлист',
      searchPlaceholder: 'Поиск...', searchPlaceholderFull: 'Треки, исполнители, альбомы...',
      light: 'Светлая', dark: 'Тёмная',
      goodEvening: 'Добрый вечер',
      timeTo: 'Время', unwind: 'расслабиться',
      curatedSounds: 'Подборка звуков для любого момента',
      trendingNow: 'В тренде', mostPlayed: 'Популярное на этой неделе',
      curatedPlaylists: 'Подборки плейлистов', handPicked: 'Отобрано под ваше настроение',
      topArtists: 'Топ исполнителей', creators: 'Авторы, которых стоит знать',
      tracks: 'треков', monthly: 'слушателей/мес',
      search: 'Поиск', browseGenres: 'Жанры',
      yourLibrary: 'Моя медиатека',
      playlistWord: 'Плейлист', likedSongs: 'Любимые треки', noLiked: 'Пока нет любимых треков. Нажмите на сердечко у трека.',
      radio: 'Радио', endlessStreams: 'Бесконечные потоки, настроенные под ваш вкус', radioSuffix: 'Радио',
      nothingPlaying: 'Ничего не играет', equalizerTitle: 'Эквалайзер',
      settings: 'Настройки', personalize: 'Настройте Leaf под себя',
      appearance: 'Внешний вид', styleLabel: 'Стиль', darkMode: 'Тёмный режим', lightMode: 'Светлый режим',
      colorTheme: 'Цветовая тема',
      themeGreen: 'Зелёная', themeBlue: 'Синяя', themeWhite: 'Белая', themeRed: 'Красная', themePurple: 'Фиолетовая',
      language: 'Язык',
      langRu: 'Русский', langPl: 'Polski', langEn: 'English',
      devices: 'Устройства', outputDevice: 'Устройство вывода', connected: 'Подключено',
      externalDeviceConnected: 'Внешнее аудиоустройство', systemDefaultDevice: 'Системное устройство по умолчанию',
      about: 'Leaf Music', version: 'Версия 1.0.0 — сделано с любовью',
      equalizer: 'Эквалайзер', shapeSound: 'Настройте звучание',
      presets: 'Пресеты', bassBoost: 'Усиление баса', reverb: 'Реверберация',
      searching: 'Идёт поиск...', noResults: 'Ничего не найдено. Попробуйте другой запрос.', resultsFor: 'Результаты по запросу',
      loadingTracks: 'Загружаем треки...', loadingPlaylists: 'Загружаем плейлисты...',
      showMore: 'Показать больше', loadingMore: 'Загрузка...',
      greetingMorning: 'Доброе утро', greetingDay: 'Добрый день', greetingEvening: 'Добрый вечер', greetingNight: 'Доброй ночи',
      createPlaylistTitle: 'Новый плейлист', playlistNamePlaceholder: 'Название плейлиста', create: 'Создать', cancel: 'Отмена',
      addToPlaylist: 'Добавить в плейлист', newPlaylist: 'Новый плейлист', noPlaylistsYet: 'У вас пока нет плейлистов',
      emptyPlaylist: 'В этом плейлисте пока нет треков', tracksByArtist: 'Треки',
      outputDeviceUnknown: 'Не удалось определить устройство',
      genres: { Ambient: 'Эмбиент', Electronic: 'Электроника', Indie: 'Инди', Folk: 'Фолк', Classical: 'Классика', 'Lo-Fi': 'Lo-Fi', Jazz: 'Джаз', Soul: 'Соул' },
    },
    pl: {
      appName: 'Leaf', tagline: 'Muzyka dla duszy',
      navHome: 'Strona główna', navSearch: 'Szukaj', navLibrary: 'Twoja biblioteka', navLiked: 'Ulubione utwory', navRadio: 'Radio',
      createPlaylist: 'Utwórz playlistę',
      searchPlaceholder: 'Szukaj...', searchPlaceholderFull: 'Utwory, artyści, albumy...',
      light: 'Jasny', dark: 'Ciemny',
      goodEvening: 'Dobry wieczór',
      timeTo: 'Czas', unwind: 'na relaks',
      curatedSounds: 'Dobrane dźwięki na każdą chwilę',
      trendingNow: 'Na czasie', mostPlayed: 'Najczęściej odtwarzane w tym tygodniu',
      curatedPlaylists: 'Wyselekcjonowane playlisty', handPicked: 'Dobrane pod twój nastrój',
      topArtists: 'Najlepsi artyści', creators: 'Twórcy, których warto poznać',
      tracks: 'utworów', monthly: 'słuchaczy/mies.',
      search: 'Szukaj', browseGenres: 'Przeglądaj gatunki',
      yourLibrary: 'Twoja biblioteka',
      playlistWord: 'Playlista', likedSongs: 'Ulubione utwory', noLiked: 'Brak ulubionych utworów. Kliknij serce przy utworze.',
      radio: 'Radio', endlessStreams: 'Niekończące się strumienie dopasowane do twojego gustu', radioSuffix: 'Radio',
      nothingPlaying: 'Nic nie jest odtwarzane', equalizerTitle: 'Korektor',
      settings: 'Ustawienia', personalize: 'Dostosuj Leaf do siebie',
      appearance: 'Wygląd', styleLabel: 'Styl', darkMode: 'Tryb ciemny', lightMode: 'Tryb jasny',
      colorTheme: 'Motyw kolorystyczny',
      themeGreen: 'Zielony', themeBlue: 'Niebieski', themeWhite: 'Biały', themeRed: 'Czerwony', themePurple: 'Fioletowy',
      language: 'Język',
      langRu: 'Rosyjski', langPl: 'Polski', langEn: 'Angielski',
      devices: 'Urządzenia', outputDevice: 'Urządzenie wyjściowe', connected: 'Połączono',
      externalDeviceConnected: 'Zewnętrzne urządzenie audio', systemDefaultDevice: 'Domyślne urządzenie systemowe',
      about: 'Leaf Music', version: 'Wersja 1.0.0 — stworzone z troską',
      equalizer: 'Korektor', shapeSound: 'Ukształtuj swój dźwięk',
      presets: 'Ustawienia wstępne', bassBoost: 'Wzmocnienie basu', reverb: 'Pogłos',
      searching: 'Wyszukiwanie...', noResults: 'Brak wyników. Spróbuj innego zapytania.', resultsFor: 'Wyniki dla',
      loadingTracks: 'Ładowanie utworów...', loadingPlaylists: 'Ładowanie playlist...',
      showMore: 'Pokaż więcej', loadingMore: 'Ładowanie...',
      greetingMorning: 'Dzień dobry', greetingDay: 'Dzień dobry', greetingEvening: 'Dobry wieczór', greetingNight: 'Dobranoc',
      createPlaylistTitle: 'Nowa playlista', playlistNamePlaceholder: 'Nazwa playlisty', create: 'Utwórz', cancel: 'Anuluj',
      addToPlaylist: 'Dodaj do playlisty', newPlaylist: 'Nowa playlista', noPlaylistsYet: 'Nie masz jeszcze playlist',
      emptyPlaylist: 'Ta playlista jest jeszcze pusta', tracksByArtist: 'Utwory',
      outputDeviceUnknown: 'Nie udało się wykryć urządzenia',
      genres: { Ambient: 'Ambient', Electronic: 'Elektronika', Indie: 'Indie', Folk: 'Folk', Classical: 'Klasyczna', 'Lo-Fi': 'Lo-Fi', Jazz: 'Jazz', Soul: 'Soul' },
    },
    en: {
      appName: 'Leaf', tagline: 'Music for the soul',
      navHome: 'Home', navSearch: 'Search', navLibrary: 'Your Library', navLiked: 'Liked Songs', navRadio: 'Radio',
      createPlaylist: 'Create Playlist',
      searchPlaceholder: 'Search...', searchPlaceholderFull: 'Songs, artists, albums...',
      light: 'Light', dark: 'Dark',
      goodEvening: 'Good evening',
      timeTo: 'Time to', unwind: 'unwind',
      curatedSounds: 'Curated sounds for every moment',
      trendingNow: 'Trending Now', mostPlayed: 'Most played this week',
      curatedPlaylists: 'Curated Playlists', handPicked: 'Hand-picked for your mood',
      topArtists: 'Top Artists', creators: 'Creators you should know',
      tracks: 'tracks', monthly: 'monthly',
      search: 'Search', browseGenres: 'Browse Genres',
      yourLibrary: 'Your Library',
      playlistWord: 'Playlist', likedSongs: 'Liked Songs', noLiked: 'No liked songs yet. Tap the heart on any track.',
      radio: 'Radio', endlessStreams: 'Endless streams, tuned to your taste', radioSuffix: 'Radio',
      nothingPlaying: 'Nothing playing', equalizerTitle: 'Equalizer',
      settings: 'Settings', personalize: 'Personalize your Leaf',
      appearance: 'Appearance', styleLabel: 'Style', darkMode: 'Dark mode', lightMode: 'Light mode',
      colorTheme: 'Color Theme',
      themeGreen: 'Green', themeBlue: 'Blue', themeWhite: 'White', themeRed: 'Red', themePurple: 'Purple',
      language: 'Language',
      langRu: 'Russian', langPl: 'Polish', langEn: 'English',
      devices: 'Devices', outputDevice: 'Output Device', connected: 'Connected',
      externalDeviceConnected: 'External audio device', systemDefaultDevice: 'System default device',
      about: 'Leaf Music', version: 'Version 1.0.0 — Crafted with care',
      equalizer: 'Equalizer', shapeSound: 'Shape your sound',
      presets: 'Presets', bassBoost: 'Bass Boost', reverb: 'Reverb',
      searching: 'Searching...', noResults: 'No results found. Try a different query.', resultsFor: 'Results for',
      loadingTracks: 'Loading tracks...', loadingPlaylists: 'Loading playlists...',
      showMore: 'Show more', loadingMore: 'Loading...',
      greetingMorning: 'Good morning', greetingDay: 'Good afternoon', greetingEvening: 'Good evening', greetingNight: 'Good night',
      createPlaylistTitle: 'New Playlist', playlistNamePlaceholder: 'Playlist name', create: 'Create', cancel: 'Cancel',
      addToPlaylist: 'Add to playlist', newPlaylist: 'New playlist', noPlaylistsYet: "You don't have any playlists yet",
      emptyPlaylist: 'This playlist has no tracks yet', tracksByArtist: 'Tracks',
      outputDeviceUnknown: 'Could not detect a device',
      genres: { Ambient: 'Ambient', Electronic: 'Electronic', Indie: 'Indie', Folk: 'Folk', Classical: 'Classical', 'Lo-Fi': 'Lo-Fi', Jazz: 'Jazz', Soul: 'Soul' },
    },
  };
  function t(key) { return (I18N[state.language] && I18N[state.language][key]) || I18N.en[key] || key; }

  function svgDataUri(svg) { return 'data:image/svg+xml,' + encodeURIComponent(svg); }
  const DEFAULT_TRACK_COVER = svgDataUri(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#52525b"/><stop offset="1" stop-color="#18181b"/></linearGradient></defs>' +
    '<rect width="200" height="200" fill="url(#g)"/>' +
    '<path d="M120 55v70a22 22 0 1 1-10-18V70l-40 10v58a22 22 0 1 1-10-18V60l60-15z" fill="rgba(255,255,255,0.55)"/>' +
    '</svg>'
  );
  const DEFAULT_AVATAR = svgDataUri(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
    '<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#71717a"/><stop offset="1" stop-color="#27272a"/></linearGradient></defs>' +
    '<rect width="200" height="200" fill="url(#a)"/>' +
    '<circle cx="100" cy="80" r="34" fill="rgba(255,255,255,0.5)"/>' +
    '<path d="M40 176c8-42 40-62 60-62s52 20 60 62" fill="rgba(255,255,255,0.5)"/>' +
    '</svg>'
  );
  function coverOf(tr) { return (tr && tr.cover) || DEFAULT_TRACK_COVER; }

  function isPlayableTrack(tr) { return !!(tr && tr.streamSrc); }

  let tracks = [];
  let searchResults = [];
  let allKnownTracks = {};
  function registerTracks(list) {
    (list || []).forEach((tr) => { if (tr && tr.id) allKnownTracks[tr.id] = tr; });
  }

  let curatedPlaylists = [];
  let curatedPlaylistsById = {};
  let curatedPlaylistsLoading = true;

  function gradientFor(name) {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    const h1 = hash % 360;
    const h2 = (h1 + 40) % 360;
    return `linear-gradient(to top, hsla(${h1},20%,20%,0.85), hsla(${h2},15%,10%,0.85))`;
  }

  function formatTime(seconds) {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const NAV_ITEMS = [
    { id: 'home', icon: 'home', key: 'navHome' },
    { id: 'search', icon: 'search', key: 'navSearch' },
    { id: 'library', icon: 'library', key: 'navLibrary' },
    { id: 'liked', icon: 'heart', key: 'navLiked' },
  ];

  const COLOR_THEMES = ['green', 'blue', 'white', 'red', 'purple'];

  const EQ_BANDS = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
  const EQ_BAND_LABELS = ['60', '170', '310', '600', '1K', '3K', '6K', '12K', '14K', '16K'];
  const EQ_PRESETS = {
    Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    Bass: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
    Treble: [0, 0, 0, 0, 0, 2, 4, 5, 6, 6],
    Vocal: [-2, 0, 2, 4, 4, 2, 0, -1, -2, -2],
    Rock: [4, 3, 0, -2, -1, 2, 4, 5, 5, 4],
    Jazz: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3],
    Classical: [3, 2, 1, 0, 0, 0, -1, -2, -2, -2],
    Electronic: [5, 4, 1, 0, -2, 2, 3, 4, 4, 5],
  };

  function loadSettings() {
    try {
      const raw = localStorage.getItem('leaf-settings');
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return {};
  }
  function saveSettings() {
    try {
      localStorage.setItem('leaf-settings', JSON.stringify({
        style: state.style,
        colorTheme: state.colorTheme,
        language: state.language,
      }));
    } catch (e) { /* ignore */ }
  }
  const saved = loadSettings();

  function loadLikes() {
    try {
      const raw = localStorage.getItem('leaf-likes');
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return {};
  }
  function saveLikes() {
    try { localStorage.setItem('leaf-likes', JSON.stringify(likedTracksData)); } catch (e) { /* ignore */ }
  }
  let likedTracksData = loadLikes();

  const state = {
    style: saved.style === 'light' ? 'light' : 'dark',
    colorTheme: COLOR_THEMES.includes(saved.colorTheme) ? saved.colorTheme : 'green',
    language: I18N[saved.language] ? saved.language : 'ru',
    view: 'home',
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    volume: 70,
    shuffle: false,
    repeat: false,
    likedTracks: new Set(Object.keys(likedTracksData)),
    eqOpen: false,
    settingsOpen: false,
    searchQuery: '',
    searchLoading: false,
    searchLoadingMore: false,
    searchLimit: 50,
    searchHasMore: false,
    queue: [],
    queueIndex: -1,
    greetingKey: 'day',
    audioDevice: null,
    currentArtistName: null,
    currentPlaylistId: null,
    addToPlaylistTrackId: null,
    createPlaylistOpen: false,
    _rendering: false,
  };

  const eqState = {
    bands: [...EQ_PRESETS.Flat],
    activePreset: 'Flat',
    enabled: true,
    bassBoost: 0,
    reverb: 20,
  };

  function applyRootClasses() {
    const html = document.documentElement;
    html.classList.toggle('dark', state.style === 'dark');
    COLOR_THEMES.forEach((c) => html.classList.remove('theme-' + c));
    html.classList.add('theme-' + state.colorTheme);
    html.lang = state.language;
  }

  const audioEl = document.getElementById('audio-el');
  let audioCtx = null;
  let eqFilterNodes = [];
  let bassFilterNode = null;
  let convolverNode = null;
  let dryGainNode = null;
  let wetGainNode = null;

  function buildImpulseResponse(ctx, duration, decay) {
    const rate = ctx.sampleRate;
    const length = Math.max(1, Math.floor(rate * duration));
    const impulse = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  function ensureAudioGraph() {
    if (audioCtx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();
    const source = audioCtx.createMediaElementSource(audioEl);

    eqFilterNodes = EQ_BANDS.map((freq, i) => {
      const f = audioCtx.createBiquadFilter();
      f.type = 'peaking';
      f.frequency.value = freq;
      f.Q.value = 1;
      f.gain.value = eqState.enabled ? eqState.bands[i] : 0;
      return f;
    });

    bassFilterNode = audioCtx.createBiquadFilter();
    bassFilterNode.type = 'lowshelf';
    bassFilterNode.frequency.value = 120;
    bassFilterNode.gain.value = eqState.enabled ? eqState.bassBoost : 0;

    convolverNode = audioCtx.createConvolver();
    convolverNode.buffer = buildImpulseResponse(audioCtx, 2, 2.5);

    dryGainNode = audioCtx.createGain();
    wetGainNode = audioCtx.createGain();

    let node = source;
    eqFilterNodes.forEach((f) => { node.connect(f); node = f; });
    node.connect(bassFilterNode);
    bassFilterNode.connect(dryGainNode);
    bassFilterNode.connect(convolverNode);
    convolverNode.connect(wetGainNode);
    dryGainNode.connect(audioCtx.destination);
    wetGainNode.connect(audioCtx.destination);

    updateReverbMix();
  }

  function updateReverbMix() {
    if (!dryGainNode || !wetGainNode) return;
    const wet = eqState.enabled ? eqState.reverb / 100 : 0;
    wetGainNode.gain.value = wet * 0.6;
    dryGainNode.gain.value = 1 - wet * 0.4;
  }

  function applyEqToGraph() {
    if (!audioCtx) return;
    eqFilterNodes.forEach((f, i) => { f.gain.value = eqState.enabled ? eqState.bands[i] : 0; });
    if (bassFilterNode) bassFilterNode.gain.value = eqState.enabled ? eqState.bassBoost : 0;
    updateReverbMix();
  }

  function loadAndPlay(track) {
    if (!track) return;
    ensureAudioGraph();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    state.currentTrack = track;
    state.progress = 0;
    audioEl.src = `/stream?url=${encodeURIComponent(track.streamSrc)}`;
    audioEl.volume = state.volume / 100;
    audioEl.play().catch(() => { /* blocked until a user gesture; button click already is one */ });
    renderAll();
  }

  function updatePlayerBarOnly() {
    const wrap = document.querySelector('.player-wrap');
    if (!wrap) return;
    const track = state.currentTrack;
    const liked = track ? state.likedTracks.has(track.id) : false;
    const pct = track && track.duration ? (state.progress / track.duration) * 100 : 0;
    const volIcon = state.volume === 0 ? 'volumeX' : state.volume < 50 ? 'volume1' : 'volume2';
    
    const nowPlayingImg = wrap.querySelector('.now-playing img');
    const nowPlayingTitle = wrap.querySelector('.now-playing .meta .title');
    const nowPlayingArtist = wrap.querySelector('.now-playing .meta .artist');
    const playBtn = wrap.querySelector('.play-btn');
    const seekFill = wrap.querySelector('.track-fill');
    const seekThumb = wrap.querySelector('.thumb');
    const seekStart = wrap.querySelector('.seek-time.start');
    const seekEnd = wrap.querySelector('.seek-time.end');
    const likeBtn = wrap.querySelector('#player-like');
    const shuffleBtn = wrap.querySelector('#btn-shuffle');
    const repeatBtn = wrap.querySelector('#btn-repeat');
    const volumeIconEl = wrap.querySelector('.volume-group svg');
    const volumeFill = wrap.querySelector('.volume-fill');
    const volumeThumb = wrap.querySelector('.volume-thumb');

    if (nowPlayingImg) nowPlayingImg.src = track ? coverOf(track) : '';
    if (nowPlayingTitle) nowPlayingTitle.textContent = track ? track.title : t('nothingPlaying');
    if (nowPlayingArtist) nowPlayingArtist.textContent = track ? track.artist : '—';
    if (playBtn) playBtn.innerHTML = icon(state.isPlaying ? 'pause' : 'play').replace('<svg ', '<svg fill="currentColor" ');
    if (seekFill) seekFill.style.width = pct + '%';
    if (seekThumb) seekThumb.style.left = `calc(${pct}% - 6px)`;
    if (seekStart) seekStart.textContent = formatTime(state.progress);
    if (seekEnd) seekEnd.textContent = formatTime(track ? track.duration : 0);
    if (likeBtn) {
      likeBtn.innerHTML = icon('heart').replace('<svg ', liked ? `<svg style="color:var(--accent);fill:var(--accent);" ` : `<svg style="color:var(--text-muted);" `);
    }
    if (shuffleBtn) shuffleBtn.classList.toggle('toggle-on', state.shuffle);
    if (repeatBtn) repeatBtn.classList.toggle('toggle-on', state.repeat);
    if (volumeIconEl) volumeIconEl.outerHTML = icon(volIcon);
    if (volumeFill) volumeFill.style.width = state.volume + '%';
    if (volumeThumb) volumeThumb.style.left = `calc(${state.volume}% - 5px)`;
  }

  audioEl.addEventListener('play', () => { state.isPlaying = true; updatePlayerBarOnly(); });
  audioEl.addEventListener('pause', () => { state.isPlaying = false; updatePlayerBarOnly(); });
  audioEl.addEventListener('timeupdate', () => {
    state.progress = audioEl.currentTime;
    updatePlayerBarOnly();
  });
  audioEl.addEventListener('loadedmetadata', () => {
    if (state.currentTrack && audioEl.duration && isFinite(audioEl.duration)) {
      state.currentTrack.duration = audioEl.duration;
    }
    updatePlayerBarOnly();
  });
  audioEl.addEventListener('ended', () => {
    if (state.repeat) { audioEl.currentTime = 0; audioEl.play(); return; }
    handleNext();
  });

  function queueForView() {
    if (state.view === 'search') return searchResults;
    if (state.view === 'liked') return Object.values(likedTracksData);
    if (state.view === 'artist') return artistTracks;
    if (state.view === 'playlist') {
      const pl = userPlaylists.find((p) => p.id === state.currentPlaylistId);
      return pl ? pl.trackIds.map((id) => allKnownTracks[id]).filter(Boolean) : [];
    }
    return tracks;
  }
  function playTrackById(id, queue) {
    const list = queue || queueForView();
    const idx = list.findIndex((tr) => tr.id === id);
    if (idx === -1) return;
    state.queue = list;
    state.queueIndex = idx;
    loadAndPlay(list[idx]);
  }
  function handleNext() {
    if (!state.queue || state.queue.length === 0) return;
    let idx;
    if (state.shuffle) idx = Math.floor(Math.random() * state.queue.length);
    else idx = (state.queueIndex + 1) % state.queue.length;
    state.queueIndex = idx;
    loadAndPlay(state.queue[idx]);
  }
  function handlePrev() {
    if (!state.queue || state.queue.length === 0) return;
    if (audioEl.currentTime > 3) { audioEl.currentTime = 0; return; }
    const idx = (state.queueIndex - 1 + state.queue.length) % state.queue.length;
    state.queueIndex = idx;
    loadAndPlay(state.queue[idx]);
  }
  function toggleLike(trackId) {
    if (state.likedTracks.has(trackId)) {
      state.likedTracks.delete(trackId);
      delete likedTracksData[trackId];
    } else {
      const tr = allKnownTracks[trackId]
        || (state.currentTrack && state.currentTrack.id === trackId ? state.currentTrack : null);
      if (!tr) return;
      state.likedTracks.add(trackId);
      likedTracksData[trackId] = tr;
    }
    saveLikes();
    renderAll();
  }

  const SEARCH_PAGE_SIZE = 50;
  const SEARCH_PAGE_STEP = 20;

  async function performSearch(query, options) {
    options = options || {};
    query = (query || '').trim();
    state.searchQuery = query;
    if (!query) { searchResults = []; state.searchLimit = SEARCH_PAGE_SIZE; state.searchHasMore = false; renderAll(); return; }
    if (!options.loadMore) state.searchLimit = SEARCH_PAGE_SIZE;
    if (options.loadMore) state.searchLoadingMore = true;
    else state.searchLoading = true;
    state.view = 'search';
    renderAll();
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=${state.searchLimit}`);
      const data = await res.json();
      searchResults = (data.tracks || []).filter(isPlayableTrack);
      registerTracks(searchResults);
      state.searchHasMore = searchResults.length >= state.searchLimit;
    } catch (e) {
      searchResults = [];
      state.searchHasMore = false;
    }
    state.searchLoading = false;
    state.searchLoadingMore = false;
    renderAll();
  }

  function loadMoreSearchResults() {
    if (!state.searchQuery || state.searchLoadingMore) return;
    state.searchLimit += SEARCH_PAGE_STEP;
    performSearch(state.searchQuery, { loadMore: true });
  }

  async function loadHomeTracks() {
    try {
      const res = await fetch('/api/home');
      const data = await res.json();
      if (data.tracks && data.tracks.length) {
        tracks = data.tracks.filter(isPlayableTrack);
        registerTracks(tracks);
      }
    } catch (e) { /* backend not reachable yet — leave tracks empty */ }
    renderAll();
  }

  async function loadCuratedPlaylists() {
    curatedPlaylistsLoading = true;
    try {
      const res = await fetch('/api/playlists');
      const data = await res.json();
      curatedPlaylists = data.playlists || [];
      curatedPlaylistsById = {};
      curatedPlaylists.forEach((pl) => {
        pl.tracks = (pl.tracks || []).filter(isPlayableTrack);
        curatedPlaylistsById[pl.id] = pl;
        registerTracks(pl.tracks);
      });
    } catch (e) { curatedPlaylists = []; }
    curatedPlaylistsLoading = false;
    renderAll();
  }

  const HEADPHONE_HINT = /headphone|headset|airpods|buds|earbud|bluetooth|беспровод|наушник|гарнитур/i;

  function getAudioOutputDevice() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        return navigator.mediaDevices.enumerateDevices()
          .then(devices => {
            const outputs = devices.filter(d => d.kind === 'audiooutput' && d.label);
            if (outputs.length > 0) {
              const headphone = outputs.find(d => HEADPHONE_HINT.test(d.label));
              return headphone ? headphone.label : outputs[0].label;
            }
            
            const allOutputs = devices.filter(d => d.kind === 'audiooutput');
            if (allOutputs.length > 1) {
              return t('externalDeviceConnected');
            }
            return null;
          })
          .catch(() => null);
      }
      return Promise.resolve(null);
    } catch (e) {
      return Promise.resolve(null);
    }
  }

  async function loadTelemetry() {
    try {
      const res = await fetch('/api/telemetry/status');
      const data = await res.json();
      state.greetingKey = data.greeting || 'day';
      
      if (data.audioDevice && data.audioDevice !== 'Default Audio Device') {
        state.audioDevice = data.audioDevice;
      } else {
        const device = await getAudioOutputDevice();
        state.audioDevice = device || t('outputDeviceUnknown');
      }
    } catch (e) {
      state.greetingKey = 'day';
      state.audioDevice = t('outputDeviceUnknown');
    }
    renderAll();
  }

  let artistTracks = [];
  let artistTracksLoading = false;
  function openArtistPage(name) {
    if (!name) return;
    state.view = 'artist';
    state.currentArtistName = name;
    renderAll();
    loadArtistTracks(name);
  }
  async function loadArtistTracks(name) {
    artistTracksLoading = true;
    artistTracks = [];
    renderAll();
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(name)}&limit=30`);
      const data = await res.json();
      const playable = (data.tracks || []).filter(isPlayableTrack);
      artistTracks = playable.filter((tr) => tr.artist === name);
      if (!artistTracks.length) artistTracks = playable;
      registerTracks(artistTracks);
    } catch (e) { artistTracks = []; }
    artistTracksLoading = false;
    renderAll();
  }

  function loadUserPlaylists() {
    try {
      const raw = localStorage.getItem('leaf-user-playlists');
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return [];
  }
  function saveUserPlaylists() {
    try { localStorage.setItem('leaf-user-playlists', JSON.stringify(userPlaylists)); } catch (e) { /* ignore */ }
  }
  let userPlaylists = loadUserPlaylists();

  function playlistCover(pl) {
    if (pl.trackIds && pl.trackIds.length) {
      const lastId = pl.trackIds[pl.trackIds.length - 1];
      const tr = allKnownTracks[lastId];
      if (tr) return coverOf(tr);
    }
    return null;
  }
  function createUserPlaylist(name) {
    name = (name || '').trim();
    if (!name) return;
    const pl = { id: 'up-' + Date.now() + '-' + Math.floor(Math.random() * 1000), name, trackIds: [] };
    userPlaylists.push(pl);
    saveUserPlaylists();
    renderAll();
    return pl;
  }
  function addTrackToPlaylist(playlistId, trackId) {
    const pl = userPlaylists.find((p) => p.id === playlistId);
    if (!pl || !allKnownTracks[trackId]) return;
    pl.trackIds = pl.trackIds.filter((id) => id !== trackId);
    pl.trackIds.push(trackId);
    saveUserPlaylists();
    renderAll();
  }
  function openUserPlaylist(id) {
    state.view = 'playlist';
    state.currentPlaylistId = id;
    renderAll();
  }
  function openAddToPlaylist(trackId) {
    state.addToPlaylistTrackId = trackId;
    renderAll();
  }
  function closeAddToPlaylist() {
    state.addToPlaylistTrackId = null;
    renderAll();
  }
  function openCreatePlaylistModal() {
    state.createPlaylistOpen = true;
    renderAll();
  }
  function closeCreatePlaylistModal() {
    state.createPlaylistOpen = false;
    renderAll();
  }

  const root = document.getElementById('root');
  let _lastView = null;
  let _lastModalKey = '';

  function renderAll() {
    if (state._rendering) return;
    state._rendering = true;
    applyRootClasses();

    const modalKey = [
      state.eqOpen ? 'eq' : '',
      state.settingsOpen ? 'settings' : '',
      state.createPlaylistOpen ? 'cp' : '',
      state.addToPlaylistTrackId ? 'atp' : '',
    ].filter(Boolean).join(':');

    const fullRebuild = !root.querySelector('.app') || _lastView === null;
    _lastView = state.view;

    if (fullRebuild) {
      root.innerHTML = `
        <div class="bg-noise"></div>
        <div class="app">
          ${renderSidebar()}
          <main class="main">
            ${renderTopbar()}
            <div class="content-scroll"><div id="view-root">${renderView()}</div></div>
          </main>
          ${renderPlayerBar()}
          ${renderMobileNav()}
        </div>
      `;
      wireEvents();
    } else {
      const scroller = root.querySelector('.content-scroll');
      const scrollPos = scroller ? scroller.scrollTop : 0;

      const viewRoot = root.querySelector('#view-root');
      if (viewRoot) viewRoot.innerHTML = renderView();

      updatePlayerBar();
      updateSidebarActive();
      updateTopbarSearch();

      if (scroller) scroller.scrollTop = scrollPos;
      wireViewEvents();
    }

    updateModals(modalKey);
    _lastModalKey = modalKey;

    if (state.eqOpen) drawEqCurve();
    state._rendering = false;
  }

  function updatePlayerBar() {
    const wrap = root.querySelector('.player-wrap');
    if (!wrap) return;
    wrap.outerHTML = renderPlayerBar();
    wirePlayerEvents();
  }

  function updateSidebarActive() {
    root.querySelectorAll('.nav-item').forEach((btn) => {
      const id = btn.getAttribute('data-nav');
      const isActive = state.view === id;
      btn.classList.toggle('active', isActive);
      const bar = btn.querySelector('.nav-bar');
      if (isActive && !bar) {
        btn.insertAdjacentHTML('afterbegin', '<span class="nav-bar"></span>');
      } else if (!isActive && bar) {
        bar.remove();
      }
    });
    root.querySelectorAll('.mobile-nav-item').forEach((btn) => {
      btn.classList.toggle('active', state.view === btn.getAttribute('data-nav'));
    });
  }

  function updateTopbarSearch() {
    const mobileInput = root.querySelector('[data-mobile-search]');
    if (mobileInput && document.activeElement !== mobileInput) {
      mobileInput.value = state.searchQuery || '';
    }
  }

  function updateModals(prevKey) {
    const curKey = [
      state.eqOpen ? 'eq' : '',
      state.settingsOpen ? 'settings' : '',
      state.createPlaylistOpen ? 'cp' : '',
      state.addToPlaylistTrackId ? 'atp' : '',
    ].filter(Boolean).join(':');

    if (prevKey === curKey) return;

    root.querySelectorAll('.backdrop, .eq-panel, .side-panel, .mini-modal').forEach((el) => el.remove());

    if (state.eqOpen) {
      root.querySelector('.app').insertAdjacentHTML('beforeend', renderEqualizer());
      wireEqEvents();
      drawEqCurve();
    }
    if (state.settingsOpen) {
      root.querySelector('.app').insertAdjacentHTML('beforeend', renderSettings());
      wireSettingsEvents();
    }
    if (state.createPlaylistOpen) {
      root.querySelector('.app').insertAdjacentHTML('beforeend', renderCreatePlaylistModal());
      wireCreatePlaylistEvents();
    }
    if (state.addToPlaylistTrackId) {
      root.querySelector('.app').insertAdjacentHTML('beforeend', renderAddToPlaylistModal());
      wireAddToPlaylistEvents();
    }
  }

  function renderSidebar() {
    return `
      <aside class="sidebar">
        <div class="glass sidebar-logo">
          <div class="logo-badge">${icon('leaf')}</div>
          <div>
            <h1 class="sidebar-title font-display text-primary-c">${t('appName')}</h1>
            <p class="sidebar-subtitle text-muted-c">${t('tagline')}</p>
          </div>
        </div>
        <nav class="glass sidebar-nav">
          ${NAV_ITEMS.map((item) => `
            <button class="nav-item ${state.view === item.id ? 'active' : ''}" data-nav="${item.id}">
              ${state.view === item.id ? '<span class="nav-bar"></span>' : ''}
              ${icon(item.icon)}
              <span>${t(item.key)}</span>
            </button>
          `).join('')}
        </nav>
        <div class="glass sidebar-playlists">
          <button class="create-playlist-btn" id="create-playlist-btn">
            <div class="dashed-box">${icon('plus')}</div>
            ${t('createPlaylist')}
          </button>
          <div class="playlist-list" id="playlist-list"></div>
        </div>
      </aside>
    `;
  }

  function renderTopbar() {
    return `
      <header class="topbar">
        <div class="glass topbar-inner">
          <div class="mobile-logo">
            <div class="logo-badge">${icon('leaf')}</div>
            <span class="font-display text-primary-c">${t('appName')}</span>
          </div>
          <div class="glass-subtle mobile-search">
            ${icon('search')}
            <input type="text" placeholder="${t('searchPlaceholder')}" data-mobile-search value="${state.searchQuery ? state.searchQuery.replace(/"/g, '&quot;') : ''}" />
          </div>
          <div class="desktop-nav">
            <button class="icon-btn glass-subtle" data-nav="home">${icon('home')}</button>
            <button class="icon-btn glass-subtle" data-nav="library">${icon('library')}</button>
          </div>
          <div class="right-actions">
            <div class="glass-subtle style-pill">
              <button class="${state.style === 'light' ? 'active' : ''}" data-style="light" title="${t('light')}">
                ${icon('sun')}<span class="label">${t('light')}</span>
              </button>
              <button class="${state.style === 'dark' ? 'active' : ''}" data-style="dark" title="${t('dark')}">
                ${icon('moon')}<span class="label">${t('dark')}</span>
              </button>
            </div>
            <button class="icon-btn glass-subtle" id="open-settings" title="${t('settings')}">${icon('settings')}</button>
            <div class="avatar-badge">L</div>
          </div>
        </div>
      </header>
    `;
  }

  function sectionHeader(iconName, title, subtitle) {
    return `
      <div class="section-header">
        <div class="glass-subtle section-icon">${icon(iconName)}</div>
        <div>
          <h2 class="font-display text-primary-c">${title}</h2>
          ${subtitle ? `<p>${subtitle}</p>` : ''}
        </div>
      </div>
    `;
  }

  function trackRowHtml(track, index) {
    const isCurrent = state.currentTrack && state.currentTrack.id === track.id;
    const liked = state.likedTracks.has(track.id);
    return `
      <div class="track-row ${isCurrent ? 'current' : ''}" data-play-track="${track.id}">
        <div class="track-index">
          ${isCurrent && state.isPlaying
            ? `<div class="eq-bars">${[0, 1, 2, 3].map((i) => `<span style="animation: eq-bar 0.8s ease-in-out ${i * 0.15}s infinite;"></span>`).join('')}</div>`
            : index + 1}
        </div>
        <img class="track-cover" src="${coverOf(track)}" alt="${track.title}" />
        <div class="track-meta">
          <p class="title ${isCurrent ? 'current' : ''}">${track.title}</p>
          <button class="artist-link" data-artist="${(track.artist || '').replace(/"/g, '&quot;')}">${track.artist}</button>
        </div>
        <span class="track-album">${track.genre || ''}</span>
        <button class="track-add-btn" data-add-to-playlist="${track.id}" title="${t('addToPlaylist')}">
          ${icon('plus')}
        </button>
        <button class="track-like-btn" data-like-track="${track.id}">
          ${icon('heart').replace('<svg ', liked ? `<svg style="color:var(--accent);fill:var(--accent);" ` : `<svg style="color:var(--text-muted);" `)}
        </button>
        <span class="track-duration">${formatTime(track.duration)}</span>
      </div>
    `;
  }

  function renderView() {
    if (state.view === 'home') return renderHome();
    if (state.view === 'search') return renderSearch();
    if (state.view === 'library') return renderLibrary();
    if (state.view === 'liked') return renderLiked();
    if (state.view === 'artist') return renderArtistPage();
    if (state.view === 'playlist') return renderUserPlaylist();
    return renderHome();
  }

  function renderArtistPage() {
    const name = state.currentArtistName || '';
    return `
      <div class="view-pad">
        <div class="animate-fade-in-up liked-hero">
          <div class="artist-photo glass" style="width:6rem;height:6rem;flex-shrink:0;">
            <img src="${DEFAULT_AVATAR}" alt="${name}" />
          </div>
          <div>
            <p class="eyebrow">${t('tracksByArtist')}</p>
            <h1 class="font-display text-primary-c">${name}</h1>
            <p class="count">${artistTracks.length} ${t('tracks')}</p>
          </div>
        </div>
        <div class="glass tracklist animate-fade-in-up" style="animation-delay:.1s">
          ${artistTracksLoading
            ? `<p class="empty-state">${t('loadingTracks')}</p>`
            : artistTracks.length === 0
              ? `<p class="empty-state">${t('noResults')}</p>`
              : artistTracks.map((track, i) => trackRowHtml(track, i)).join('')}
        </div>
      </div>
    `;
  }

  function renderUserPlaylist() {
    const pl = userPlaylists.find((p) => p.id === state.currentPlaylistId);
    if (!pl) return `<div class="view-pad"><p class="empty-state">${t('noPlaylistsYet')}</p></div>`;
    const cover = playlistCover(pl) || DEFAULT_TRACK_COVER;
    const plTracks = pl.trackIds.map((id) => allKnownTracks[id]).filter(isPlayableTrack);
    return `
      <div class="view-pad">
        <div class="animate-fade-in-up liked-hero">
          <div class="artist-photo glass" style="width:6rem;height:6rem;border-radius:0.75rem;flex-shrink:0;">
            <img src="${cover}" alt="${pl.name}" />
          </div>
          <div>
            <p class="eyebrow">${t('playlistWord')}</p>
            <h1 class="font-display text-primary-c">${pl.name}</h1>
            <p class="count">${plTracks.length} ${t('tracks')}</p>
          </div>
        </div>
        <div class="glass tracklist animate-fade-in-up" style="animation-delay:.1s">
          ${plTracks.length === 0
            ? `<p class="empty-state">${t('emptyPlaylist')}</p>`
            : plTracks.map((track, i) => trackRowHtml(track, i)).join('')}
        </div>
      </div>
    `;
  }

  function greetingText() {
    const key = state.greetingKey || 'day';
    return t('greeting' + key.charAt(0).toUpperCase() + key.slice(1));
  }

  function renderHome() {
    return `
      <div class="view-pad">
        <div class="hero animate-fade-in-up">
          <p class="eyebrow">${greetingText()}</p>
          <h1 class="font-display text-primary-c">${t('timeTo')} <span class="shimmer-text">${t('unwind')}</span></h1>
          <p class="sub text-secondary-c">${t('curatedSounds')}</p>
        </div>

        <div class="quick-grid animate-fade-in-up" style="animation-delay:.1s">
          ${curatedPlaylists.slice(0, 6).map((pl) => `
            <button class="glass quick-card" data-quick-play="${pl.id}">
              <div class="quick-cover">
                <img src="${pl.cover}" alt="${pl.name}" />
                <div class="grad" style="background:${gradientFor(pl.name)}; opacity:.5;"></div>
              </div>
              <span class="name truncate text-primary-c">${pl.name}</span>
              <div class="quick-play">${icon('play')}</div>
            </button>
          `).join('')}
        </div>

        <div class="animate-fade-in-up" style="animation-delay:.2s">
          ${sectionHeader('clock', t('curatedPlaylists'), t('handPicked'))}
          <div class="card-grid">
            ${curatedPlaylistsLoading && curatedPlaylists.length === 0
              ? `<p class="empty-state">${t('loadingPlaylists')}</p>`
              : curatedPlaylists.map((pl) => `
              <button class="playlist-card glass" data-quick-play="${pl.id}">
                <div class="cover-wrap">
                  <img src="${pl.cover}" alt="${pl.name}" />
                  <div class="grad" style="background:${gradientFor(pl.name)};"></div>
                  <div class="info">
                    <p class="name font-display">${pl.name}</p>
                    <p class="count">${pl.trackCount} ${t('tracks')}</p>
                  </div>
                  <div class="play-fab">${icon('play')}</div>
                </div>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderSearch() {
    let resultsHtml = '';
    if (state.searchLoading) {
      resultsHtml = `<p class="empty-state">${t('searching')}</p>`;
    } else if (searchResults.length) {
      resultsHtml = `
        <h2 class="font-display text-primary-c" style="font-size:1.25rem;font-weight:700;margin:1.5rem 0 1rem;">${t('resultsFor')} «${state.searchQuery}»</h2>
        <div class="glass tracklist">${searchResults.map((track, i) => trackRowHtml(track, i)).join('')}</div>
        ${state.searchHasMore ? `
          <button class="show-more-btn glass-subtle" id="search-show-more" ${state.searchLoadingMore ? 'disabled' : ''}>
            ${state.searchLoadingMore ? t('loadingMore') : t('showMore')}
          </button>
        ` : ''}
      `;
    } else if (state.searchQuery) {
      resultsHtml = `<p class="empty-state">${t('noResults')}</p>`;
    }
    return `
      <div class="view-pad">
        <div class="animate-fade-in-up">
          <h1 class="font-display text-primary-c" style="font-size:1.9rem;font-weight:700;margin:0 0 1rem;">${t('search')}</h1>
          <div class="glass search-box">
            ${icon('search')}
            <input type="text" id="search-input" placeholder="${t('searchPlaceholderFull')}" value="${state.searchQuery ? state.searchQuery.replace(/"/g, '&quot;') : ''}" />
          </div>
        </div>
        <div class="animate-fade-in-up" style="animation-delay:.15s">${resultsHtml}</div>
      </div>
    `;
  }

  function renderLibrary() {
    return `
      <div class="view-pad">
        <div class="animate-fade-in-up">
          <h1 class="font-display text-primary-c" style="font-size:1.9rem;font-weight:700;margin:0 0 1rem;">${t('yourLibrary')}</h1>
          <div class="glass tracklist">
            ${tracks.length === 0
              ? `<p class="empty-state">${t('loadingTracks')}</p>`
              : tracks.map((track, i) => trackRowHtml(track, i)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderLiked() {
    const liked = Object.values(likedTracksData).filter(isPlayableTrack);
    return `
      <div class="view-pad">
        <div class="animate-fade-in-up liked-hero">
          <div class="icon-box">${icon('heart', '')}</div>
          <div>
            <p class="eyebrow">${t('playlistWord')}</p>
            <h1 class="font-display text-primary-c">${t('likedSongs')}</h1>
            <p class="count">${liked.length} ${t('tracks')}</p>
          </div>
        </div>
        <div class="glass tracklist animate-fade-in-up" style="animation-delay:.1s">
          ${liked.length === 0
            ? `<p class="empty-state">${t('noLiked')}</p>`
            : liked.map((track, i) => trackRowHtml(track, i)).join('')}
        </div>
      </div>
    `;
  }
  function renderPlayerBar() {
    const track = state.currentTrack;
    const liked = track ? state.likedTracks.has(track.id) : false;
    const pct = track && track.duration ? (state.progress / track.duration) * 100 : 0;
    const volIcon = state.volume === 0 ? 'volumeX' : state.volume < 50 ? 'volume1' : 'volume2';
    return `
      <div class="player-wrap">
        <div class="player-inner">
          <div class="cloud-puff animate-float-slow" style="position:absolute; top:-2rem; left:10%; width:8rem; height:5rem; opacity:.6;"></div>
          <div class="cloud-puff animate-float-medium" style="position:absolute; top:-1.5rem; left:40%; width:10rem; height:4rem; opacity:.4;"></div>
          <div class="cloud-puff animate-float-fast" style="position:absolute; top:-2.5rem; right:15%; width:9rem; height:5.5rem; opacity:.5;"></div>

          <div class="cloud-player player-bar animate-fade-in-up">
            <div class="player-row">
              <div class="now-playing">
                <img src="${track ? coverOf(track) : ''}" alt="${track ? track.title : ''}" />
                <div class="meta">
                  <p class="title text-primary-c truncate">${track ? track.title : t('nothingPlaying')}</p>
                  ${track
                    ? `<button class="artist truncate artist-link" data-artist="${(track.artist || '').replace(/"/g, '&quot;')}">${track.artist}</button>`
                    : `<p class="artist truncate">—</p>`}
                </div>
                <button class="like-btn" id="player-like">
                  ${icon('heart').replace('<svg ', liked ? `<svg style="color:var(--accent);fill:var(--accent);" ` : `<svg style="color:var(--text-muted);" `)}
                </button>
              </div>

              <div class="player-center">
                <div class="transport">
                  <button class="shuffle-btn ${state.shuffle ? 'toggle-on' : ''}" id="btn-shuffle">${icon('shuffle')}</button>
                  <button id="btn-prev">${icon('skipBack').replace('<svg ', '<svg fill="currentColor" ')}</button>
                  <button class="play-btn" id="btn-playpause">${icon(state.isPlaying ? 'pause' : 'play').replace('<svg ', '<svg fill="currentColor" ')}</button>
                  <button id="btn-next">${icon('skipForward').replace('<svg ', '<svg fill="currentColor" ')}</button>
                  <button class="repeat-btn ${state.repeat ? 'toggle-on' : ''}" id="btn-repeat">${icon('repeat')}</button>
                </div>
                <div class="seek-row">
                  <span class="seek-time start">${formatTime(state.progress)}</span>
                  <div class="seek-track" id="seek-track">
                    <div class="track-bg"><div class="track-fill" style="width:${pct}%"></div></div>
                    <div class="thumb" style="left:calc(${pct}% - 6px)"></div>
                  </div>
                  <span class="seek-time end">${formatTime(track ? track.duration : 0)}</span>
                </div>
              </div>

              <div class="player-right">
                <button id="open-eq" title="${t('equalizerTitle')}">${icon('sliders')}</button>
                <div class="volume-group">
                  ${icon(volIcon)}
                  <div class="volume-track" id="volume-track">
                    <div class="volume-bg"><div class="volume-fill" style="width:${state.volume}%"></div></div>
                    <div class="volume-thumb" style="left:calc(${state.volume}% - 5px)"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderMobileNav() {
    return `
      <nav class="mobile-nav">
        <div class="glass mobile-nav-inner">
          ${NAV_ITEMS.map((item) => `
            <button class="mobile-nav-item ${state.view === item.id ? 'active' : ''}" data-nav="${item.id}">
              ${icon(item.icon)}
              <span>${t(item.key)}</span>
            </button>
          `).join('')}
        </div>
      </nav>
    `;
  }

  function toggleHtml(id, on) {
    return `<button class="toggle ${on ? 'on' : ''}" id="${id}"><span class="knob"></span></button>`;
  }

  function renderSettings() {
    const colorThemeLabelKey = { green: 'themeGreen', blue: 'themeBlue', white: 'themeWhite', red: 'themeRed', purple: 'themePurple' };
    return `
      <div class="backdrop" id="settings-backdrop"></div>
      <div class="side-panel animate-slide-in-right">
        <div class="glass-strong side-panel-inner">
          <div class="panel-header">
            <div class="left">
              <div class="glass-subtle icon-box">${icon('sparkles')}</div>
              <div>
                <h2 class="font-display text-primary-c">${t('settings')}</h2>
                <p>${t('personalize')}</p>
              </div>
            </div>
            <button class="glass-subtle close-btn" id="close-settings">${icon('x')}</button>
          </div>

          <div class="settings-group">
            <p class="group-label">${t('appearance')}</p>
            <div class="glass-subtle settings-card">
              <div class="setting-row">
                <div class="row-icon">${icon(state.style === 'dark' ? 'moon' : 'sun')}</div>
                <div class="row-text">
                  <p class="label">${t('styleLabel')}</p>
                  <p class="desc">${state.style === 'dark' ? t('darkMode') : t('lightMode')}</p>
                </div>
                <div class="glass-subtle style-toggle-mini">
                  <button class="${state.style === 'light' ? 'active' : ''}" data-style="light">${icon('sun')} ${t('light')}</button>
                  <button class="${state.style === 'dark' ? 'active' : ''}" data-style="dark">${icon('moon')} ${t('dark')}</button>
                </div>
              </div>
              <div class="divider"></div>
              <div class="hr-block">
                <p class="label" style="font-size:.875rem;font-weight:500;margin:0 0 .25rem;color:var(--text-primary);">${t('colorTheme')}</p>
                <div class="color-swatches">
                  ${COLOR_THEMES.map((c) => `
                    <button class="swatch swatch-${c} ${state.colorTheme === c ? 'selected' : ''}" data-color-theme="${c}" title="${t(colorThemeLabelKey[c])}"></button>
                  `).join('')}
                </div>
              </div>
              <div class="divider"></div>
              <div class="hr-block">
                <div class="setting-row" style="padding:0 0 .5rem;">
                  <div class="row-icon">${icon('globe')}</div>
                  <div class="row-text"><p class="label">${t('language')}</p></div>
                </div>
                <div class="lang-options" style="padding-top:0;">
                  ${[['ru', 'langRu'], ['pl', 'langPl'], ['en', 'langEn']].map(([code, key]) => `
                    <button class="lang-option ${state.language === code ? 'active' : ''}" data-lang="${code}">
                      <span>${t(key)}</span>
                      <span class="check">${icon('check')}</span>
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

          <div class="settings-group">
            <p class="group-label">${t('devices')}</p>
            <div class="glass-subtle settings-card">
              <div class="setting-row">
                <div class="row-icon">${icon('headphones')}</div>
                <div class="row-text">
                  <p class="label">${t('outputDevice')}</p>
                  <p class="desc">${state.audioDevice || t('outputDeviceUnknown')}</p>
                </div>
                ${state.audioDevice ? `<span class="text-muted-c" style="font-size:.75rem;">${t('connected')}</span>` : ''}
              </div>
            </div>
          </div>

          <div class="glass-subtle about-card">
            ${icon('info')}
            <div>
              <p class="name text-primary-c">${t('about')}</p>
              <p class="ver">${t('version')}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderEqualizer() {
    return `
      <div class="backdrop" id="eq-backdrop"></div>
      <div class="eq-panel animate-slide-in-right">
        <div class="glass-strong eq-panel-inner">
          <div class="panel-header">
            <div class="left">
              <div class="glass-subtle icon-box" style="font-size:1.1rem;">🎵</div>
              <div>
                <h2 class="font-display text-primary-c">${t('equalizer')}</h2>
                <p>${t('shapeSound')}</p>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:.5rem;">
              <button class="glass-subtle reset-btn" id="eq-reset">${icon('rotateCcw')}</button>
              <button class="glass-subtle close-btn" id="close-eq">${icon('x')}</button>
            </div>
          </div>

          <div class="glass-subtle eq-enable-row">
            <span class="text-primary-c">${t('equalizer')}</span>
            ${toggleHtml('eq-enable-toggle', eqState.enabled)}
          </div>

          <div class="glass-subtle eq-canvas-wrap">
            <canvas id="eq-canvas"></canvas>
          </div>

          <div class="eq-bands ${eqState.enabled ? '' : 'disabled'}">
            ${EQ_BANDS.map((_, i) => `
              <div class="eq-band-col">
                <input type="range" class="vertical" min="-12" max="12" step="1" value="${eqState.bands[i]}" data-eq-band="${i}" />
                <span>${EQ_BAND_LABELS[i]}</span>
              </div>
            `).join('')}
          </div>

          <div class="eq-presets">
            <p class="lbl">${t('presets')}</p>
            <div class="preset-pills">
              ${Object.keys(EQ_PRESETS).map((preset) => `
                <button class="preset-pill glass-subtle ${eqState.activePreset === preset ? 'active' : ''}" data-eq-preset="${preset}">${preset}</button>
              `).join('')}
            </div>
          </div>

          <div class="eq-effects ${eqState.enabled ? '' : 'disabled'}">
            <div class="glass-subtle eq-effect-card">
              <div class="head"><span class="label text-primary-c">${t('bassBoost')}</span><span class="val">+${eqState.bassBoost} dB</span></div>
              <input type="range" min="0" max="12" value="${eqState.bassBoost}" id="eq-bass-boost" />
            </div>
            <div class="glass-subtle eq-effect-card">
              <div class="head"><span class="label text-primary-c">${t('reverb')}</span><span class="val">${eqState.reverb}%</span></div>
              <input type="range" min="0" max="100" value="${eqState.reverb}" id="eq-reverb" />
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function drawEqCurve() {
    const canvas = document.getElementById('eq-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width, h = rect.height;
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(148,163,184,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(148,163,184,0.2)';
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const bands = eqState.bands;

    function curvePath() {
      ctx.beginPath();
      bands.forEach((gain, i) => {
        const x = (w / (bands.length - 1)) * i;
        const y = h / 2 - (gain / 12) * (h / 2);
        if (i === 0) ctx.moveTo(x, y);
        else {
          const prevX = (w / (bands.length - 1)) * (i - 1);
          const prevGain = bands[i - 1];
          const prevY = h / 2 - (prevGain / 12) * (h / 2);
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
    }

    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    bands.forEach((gain, i) => {
      const x = (w / (bands.length - 1)) * i;
      const y = h / 2 - (gain / 12) * (h / 2);
      if (i === 0) ctx.lineTo(x, y);
      else {
        const prevX = (w / (bands.length - 1)) * (i - 1);
        const prevGain = bands[i - 1];
        const prevY = h / 2 - (prevGain / 12) * (h / 2);
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    });
    ctx.lineTo(w, h / 2);
    ctx.closePath();
    let a1 = accent + '40', a0 = accent + '00';
    if (accent.startsWith('rgb')) { a1 = accent; a0 = accent; }
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, hexAlpha(accent, 0.25));
    gradient.addColorStop(1, hexAlpha(accent, 0));
    ctx.fillStyle = gradient;
    ctx.fill();

    curvePath();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    bands.forEach((gain, i) => {
      const x = (w / (bands.length - 1)) * i;
      const y = h / 2 - (gain / 12) * (h / 2);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }
  function hexAlpha(color, alpha) {
    if (/^#([0-9a-f]{6})$/i.test(color)) {
      const num = parseInt(color.slice(1), 16);
      const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
      return `rgba(${r},${g},${b},${alpha})`;
    }
    return color;
  }

  function wireEvents() {
    wireNavEvents();
    wireStyleEvents();
    wireSearchEvents();
    wirePlayerEvents();
    wireViewEvents();
    renderPlaylistList();
  }

  function wireNavEvents() {
    root.querySelectorAll('[data-nav]').forEach((el) => {
      el.addEventListener('click', () => { state.view = el.getAttribute('data-nav'); renderAll(); });
    });
    const mobileSearch = root.querySelector('[data-mobile-search]');
    if (mobileSearch) {
      mobileSearch.addEventListener('focus', () => { state.view = 'search'; renderAll(); });
      mobileSearch.addEventListener('keydown', (e) => { if (e.key === 'Enter') performSearch(mobileSearch.value); });
    }
  }

  function wireStyleEvents() {
    root.querySelectorAll('[data-style]').forEach((el) => {
      el.addEventListener('click', () => { state.style = el.getAttribute('data-style'); saveSettings(); renderAll(); });
    });
  }

  function wireSearchEvents() {
    const searchInput = root.querySelector('#search-input');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') performSearch(searchInput.value); });
      searchInput.focus();
      searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
    }
    root.querySelectorAll('[data-genre-search]').forEach((el) => {
      el.addEventListener('click', () => performSearch(el.getAttribute('data-genre-search')));
    });
    const searchShowMore = root.querySelector('#search-show-more');
    if (searchShowMore) searchShowMore.addEventListener('click', loadMoreSearchResults);
  }

  function wirePlayerEvents() {
    const btnPlayPause = root.querySelector('#btn-playpause');
    if (btnPlayPause) btnPlayPause.addEventListener('click', () => {
      if (!state.currentTrack) return;
      ensureAudioGraph();
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      if (audioEl.paused) audioEl.play().catch(() => {});
      else audioEl.pause();
    });
    const btnNext = root.querySelector('#btn-next');
    if (btnNext) btnNext.addEventListener('click', handleNext);
    const btnPrev = root.querySelector('#btn-prev');
    if (btnPrev) btnPrev.addEventListener('click', handlePrev);
    const btnShuffle = root.querySelector('#btn-shuffle');
    if (btnShuffle) btnShuffle.addEventListener('click', () => { state.shuffle = !state.shuffle; renderAll(); });
    const btnRepeat = root.querySelector('#btn-repeat');
    if (btnRepeat) btnRepeat.addEventListener('click', () => { state.repeat = !state.repeat; renderAll(); });
    const playerLike = root.querySelector('#player-like');
    if (playerLike) playerLike.addEventListener('click', () => { if (state.currentTrack) toggleLike(state.currentTrack.id); });

    const seekTrack = root.querySelector('#seek-track');
    if (seekTrack) seekTrack.addEventListener('click', (e) => {
      if (!state.currentTrack) return;
      const dur = audioEl.duration && isFinite(audioEl.duration) ? audioEl.duration : state.currentTrack.duration;
      if (!dur) return;
      const rect = seekTrack.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audioEl.currentTime = Math.max(0, Math.min(dur, pct * dur));
    });
    const volumeTrack = root.querySelector('#volume-track');
    if (volumeTrack) {
      const setVolumeFromEvent = (e) => {
        const rect = volumeTrack.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        state.volume = Math.round(pct * 100);
        audioEl.volume = state.volume / 100;
        updatePlayerBarOnly();
      };
      volumeTrack.addEventListener('mousedown', (e) => {
        setVolumeFromEvent(e);
        const onMove = (ev) => setVolumeFromEvent(ev);
        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
      volumeTrack.addEventListener('touchstart', (e) => { if (e.touches[0]) setVolumeFromEvent(e.touches[0]); }, { passive: true });
      volumeTrack.addEventListener('touchmove', (e) => { if (e.touches[0]) setVolumeFromEvent(e.touches[0]); }, { passive: true });
    }

    const openEq = root.querySelector('#open-eq');
    if (openEq) openEq.addEventListener('click', () => { state.eqOpen = true; renderAll(); });
    const openSettings = root.querySelector('#open-settings');
    if (openSettings) openSettings.addEventListener('click', () => { state.settingsOpen = true; renderAll(); });
  }

  function wireViewEvents() {
    root.querySelectorAll('[data-play-track]').forEach((el) => {
      el.addEventListener('click', () => playTrackById(el.getAttribute('data-play-track')));
    });
    root.querySelectorAll('[data-like-track]').forEach((el) => {
      el.addEventListener('click', (e) => { e.stopPropagation(); toggleLike(el.getAttribute('data-like-track')); });
    });
    root.querySelectorAll('[data-quick-play]').forEach((el) => {
      el.addEventListener('click', () => {
        const pl = curatedPlaylistsById[el.getAttribute('data-quick-play')];
        if (pl && pl.tracks && pl.tracks.length) { registerTracks(pl.tracks); playTrackById(pl.tracks[0].id, pl.tracks); }
        else if (tracks.length) { playTrackById(tracks[0].id, tracks); }
      });
    });
    root.querySelectorAll('[data-artist]').forEach((el) => {
      el.addEventListener('click', (e) => { e.stopPropagation(); openArtistPage(el.getAttribute('data-artist')); });
    });
    root.querySelectorAll('[data-add-to-playlist]').forEach((el) => {
      el.addEventListener('click', (e) => { e.stopPropagation(); openAddToPlaylist(el.getAttribute('data-add-to-playlist')); });
    });
    const createPlaylistBtn = root.querySelector('#create-playlist-btn');
    if (createPlaylistBtn) createPlaylistBtn.addEventListener('click', openCreatePlaylistModal);
  }

  function wireEqEvents() {
    root.querySelectorAll('[data-eq-band]').forEach((el) => {
      el.addEventListener('input', (e) => {
        const i = Number(el.getAttribute('data-eq-band'));
        eqState.bands[i] = Number(e.target.value);
        eqState.activePreset = 'Custom';
        applyEqToGraph();
        drawEqCurve();
      });
    });
    root.querySelectorAll('[data-eq-preset]').forEach((el) => {
      el.addEventListener('click', () => {
        const preset = el.getAttribute('data-eq-preset');
        eqState.bands = [...EQ_PRESETS[preset]];
        eqState.activePreset = preset;
        applyEqToGraph();
        renderAll();
      });
    });
    const eqReset = root.querySelector('#eq-reset');
    if (eqReset) eqReset.addEventListener('click', () => {
      eqState.bands = [...EQ_PRESETS.Flat]; eqState.activePreset = 'Flat'; eqState.bassBoost = 0; eqState.reverb = 20;
      applyEqToGraph(); renderAll();
    });
    const eqEnableToggle = root.querySelector('#eq-enable-toggle');
    if (eqEnableToggle) eqEnableToggle.addEventListener('click', () => { eqState.enabled = !eqState.enabled; applyEqToGraph(); renderAll(); });
    const eqBassBoost = root.querySelector('#eq-bass-boost');
    if (eqBassBoost) eqBassBoost.addEventListener('input', (e) => {
      eqState.bassBoost = Number(e.target.value); applyEqToGraph();
      const valEl = eqBassBoost.closest('.eq-effect-card') ? eqBassBoost.closest('.eq-effect-card').querySelector('.val') : null;
      if (valEl) valEl.textContent = `+${eqState.bassBoost} dB`;
    });
    const eqReverb = root.querySelector('#eq-reverb');
    if (eqReverb) eqReverb.addEventListener('input', (e) => {
      eqState.reverb = Number(e.target.value); applyEqToGraph();
      const valEl = eqReverb.closest('.eq-effect-card').querySelector('.val');
      if (valEl) valEl.textContent = `${eqState.reverb}%`;
    });
    const closeEq = root.querySelector('#close-eq');
    if (closeEq) closeEq.addEventListener('click', () => { state.eqOpen = false; renderAll(); });
    const eqBackdrop = root.querySelector('#eq-backdrop');
    if (eqBackdrop) eqBackdrop.addEventListener('click', () => { state.eqOpen = false; renderAll(); });
  }

  function wireSettingsEvents() {
    root.querySelectorAll('[data-color-theme]').forEach((el) => {
      el.addEventListener('click', () => { state.colorTheme = el.getAttribute('data-color-theme'); saveSettings(); renderAll(); });
    });
    root.querySelectorAll('[data-lang]').forEach((el) => {
      el.addEventListener('click', () => { state.language = el.getAttribute('data-lang'); saveSettings(); renderAll(); });
    });
    const closeSettings = root.querySelector('#close-settings');
    if (closeSettings) closeSettings.addEventListener('click', () => { state.settingsOpen = false; renderAll(); });
    const settingsBackdrop = root.querySelector('#settings-backdrop');
    if (settingsBackdrop) settingsBackdrop.addEventListener('click', () => { state.settingsOpen = false; renderAll(); });
  }

  function wireCreatePlaylistEvents() {
    const cpBackdrop = root.querySelector('#create-playlist-backdrop');
    if (cpBackdrop) cpBackdrop.addEventListener('click', closeCreatePlaylistModal);
    const cpClose = root.querySelector('#create-playlist-close');
    if (cpClose) cpClose.addEventListener('click', closeCreatePlaylistModal);
    const cpForm = root.querySelector('#create-playlist-form');
    if (cpForm) cpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = root.querySelector('#create-playlist-input');
      const pl = createUserPlaylist(input ? input.value : '');
      state.createPlaylistOpen = false;
      if (pl && state._pendingTrackForNewPlaylist) { addTrackToPlaylist(pl.id, state._pendingTrackForNewPlaylist); state._pendingTrackForNewPlaylist = null; }
      if (pl) openUserPlaylist(pl.id);
    });
  }

  function wireAddToPlaylistEvents() {
    const atpBackdrop = root.querySelector('#add-to-playlist-backdrop');
    if (atpBackdrop) atpBackdrop.addEventListener('click', closeAddToPlaylist);
    const atpClose = root.querySelector('#add-to-playlist-close');
    if (atpClose) atpClose.addEventListener('click', closeAddToPlaylist);
    root.querySelectorAll('[data-atp-target]').forEach((el) => {
      el.addEventListener('click', () => { addTrackToPlaylist(el.getAttribute('data-atp-target'), state.addToPlaylistTrackId); state.addToPlaylistTrackId = null; renderAll(); });
    });
    const atpNewBtn = root.querySelector('#add-to-playlist-new');
    if (atpNewBtn) atpNewBtn.addEventListener('click', () => {
      const pendingTrackId = state.addToPlaylistTrackId; state.addToPlaylistTrackId = null; state.createPlaylistOpen = true;
      state._pendingTrackForNewPlaylist = pendingTrackId; renderAll();
    });
  }

  function renderPlaylistList() {
    const listEl = document.getElementById('playlist-list');
    if (!listEl) return;
    if (!userPlaylists.length) {
      listEl.innerHTML = `<p class="empty-state" style="padding:.75rem 0;font-size:.8rem;">${t('noPlaylistsYet')}</p>`;
      return;
    }
    listEl.innerHTML = userPlaylists.map((pl) => {
      const cover = playlistCover(pl);
      return `
        <button class="playlist-item" data-open-playlist="${pl.id}">
          ${cover ? `<img class="playlist-thumb" src="${cover}" alt="${pl.name}" />` : `<div class="playlist-thumb"></div>`}
          <span class="truncate">${pl.name}</span>
        </button>
      `;
    }).join('');
    listEl.querySelectorAll('[data-open-playlist]').forEach((el) => {
      el.addEventListener('click', () => openUserPlaylist(el.getAttribute('data-open-playlist')));
    });
  }

  /* ─── CREATE PLAYLIST MODAL ────────────────────────────── */
  function renderCreatePlaylistModal() {
    return `
      <div class="backdrop" id="create-playlist-backdrop"></div>
      <div class="mini-modal animate-slide-in-right">
        <div class="glass-strong mini-modal-inner">
          <div class="panel-header">
            <h2 class="font-display text-primary-c" style="font-size:1.1rem;">${t('createPlaylistTitle')}</h2>
            <button class="glass-subtle close-btn" id="create-playlist-close">${icon('x')}</button>
          </div>
          <form id="create-playlist-form">
            <input type="text" id="create-playlist-input" class="mini-modal-input" placeholder="${t('playlistNamePlaceholder')}" autofocus />
            <button type="submit" class="mini-modal-submit">${t('create')}</button>
          </form>
        </div>
      </div>
    `;
  }

  /* ─── ADD TO PLAYLIST MODAL ────────────────────────────── */
  function renderAddToPlaylistModal() {
    return `
      <div class="backdrop" id="add-to-playlist-backdrop"></div>
      <div class="mini-modal animate-slide-in-right">
        <div class="glass-strong mini-modal-inner">
          <div class="panel-header">
            <h2 class="font-display text-primary-c" style="font-size:1.1rem;">${t('addToPlaylist')}</h2>
            <button class="glass-subtle close-btn" id="add-to-playlist-close">${icon('x')}</button>
          </div>
          <div class="atp-list">
            ${userPlaylists.length === 0 ? `<p class="empty-state" style="padding:1rem 0;">${t('noPlaylistsYet')}</p>` : userPlaylists.map((pl) => {
              const cover = playlistCover(pl);
              return `
                <button class="playlist-item" data-atp-target="${pl.id}">
                  ${cover ? `<img class="playlist-thumb" src="${cover}" alt="${pl.name}" />` : `<div class="playlist-thumb"></div>`}
                  <span class="truncate">${pl.name}</span>
                </button>
              `;
            }).join('')}
          </div>
          <button class="mini-modal-submit" id="add-to-playlist-new" style="margin-top:.75rem;">${icon('plus')} ${t('newPlaylist')}</button>
        </div>
      </div>
    `;
  }

  /* ─── INIT ─────────────────────────────────────────────── */
  renderAll();
  loadHomeTracks();
  loadCuratedPlaylists();
  loadTelemetry();
})();