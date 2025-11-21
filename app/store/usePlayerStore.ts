import { create } from 'zustand';
import type { Album, Song } from '../types';

interface PlayerState {
    albums: Album[];
    currentAlbum: Album | null;
    currentSongIndex: number;
    isPlaying: boolean;
    isShuffled: boolean;
    volume: number;
    isMuted: boolean;
    loopMode: 'none' | 'album' | 'song';

    // Actions
    setAlbums: (albums: Album[]) => void;
    loadAlbum: (albumId: string) => void;
    playSong: (index: number, albumId?: string) => void;
    selectSong: (index: number, albumId?: string) => void;
    play: () => void;
    pause: () => void;
    next: () => void;
    prev: () => void;
    toggleShuffle: () => void;
    toggleLoop: () => void;
    handleSongEnd: () => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    albums: [],
    currentAlbum: null,
    currentSongIndex: -1,
    isPlaying: false,
    isShuffled: false,
    volume: 1,
    isMuted: false,
    loopMode: 'none',

    setAlbums: (albums) => set({ albums }),

    loadAlbum: async (albumId) => {
        const { albums } = get();
        const album = albums.find((a) => a.id === albumId);

        if (!album) return;

        // Don't switch the current album - just load metadata
        // The album will switch when a song is actually played

        // Helper for debugging
        const logToDom = (msg: string) => {
            if (typeof document === 'undefined') return;
            let el = document.getElementById('debug-logs');
            if (!el) {
                el = document.createElement('div');
                el.id = 'debug-logs';
                el.style.display = 'none';
                document.body.appendChild(el);
            }
            el.textContent += msg + '|';
            console.log(msg);
        };

        // Check for missing durations
        const needsDurationUpdate = album.songs.some(s => !s.duration);
        logToDom(`[loadAlbum] ${albumId} needs update: ${needsDurationUpdate}`);

        if (needsDurationUpdate && typeof Audio !== "undefined") {
            logToDom(`[loadAlbum] Starting duration update for ${albumId}`);
            const updatedSongs = await Promise.all(album.songs.map(async (song) => {
                if (song.duration) return song;

                return new Promise<Song>((resolve) => {
                    const encodedUrl = encodeURI(song.url);
                    const audio = new Audio(encodedUrl);
                    audio.onloadedmetadata = () => {
                        const minutes = Math.floor(audio.duration / 60);
                        const seconds = Math.floor(audio.duration % 60);
                        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                        logToDom(`[loadAlbum] Loaded duration for ${song.title}: ${formattedDuration}`);
                        resolve({ ...song, duration: formattedDuration });
                    };
                    audio.onerror = () => {
                        logToDom(`[loadAlbum] Error loading duration for ${song.title}`);
                        resolve(song);
                    };
                });
            }));

            const updatedAlbum = { ...album, songs: updatedSongs };

            // Update state
            set((state) => {
                logToDom(`[loadAlbum] Updating state with new durations for ${albumId}`);
                const updatedAlbums = state.albums.map(a =>
                    a.id === albumId ? updatedAlbum : a
                );

                // Only update currentAlbum if it's still the same album
                const newCurrentAlbum = state.currentAlbum?.id === albumId
                    ? updatedAlbum
                    : state.currentAlbum;

                return {
                    albums: updatedAlbums,
                    currentAlbum: newCurrentAlbum
                };
            });
        }
    },

    playSong: (index, albumId?: string) => {
        const { currentAlbum, albums } = get();

        // If albumId is provided and it's different from current (or no current album), switch albums
        if (albumId && (!currentAlbum || currentAlbum.id !== albumId)) {
            const newAlbum = albums.find(a => a.id === albumId);
            if (newAlbum) {
                set({ currentAlbum: newAlbum, currentSongIndex: index, isPlaying: true });
                return;
            }
        }

        // Otherwise, play from current album
        if (!currentAlbum) return;
        if (index >= 0 && index < currentAlbum.songs.length) {
            set({ currentSongIndex: index, isPlaying: true });
        }
    },

    selectSong: (index, albumId?: string) => {
        const { currentAlbum, albums } = get();

        // If albumId is provided and it's different from current, switch albums
        if (albumId && currentAlbum?.id !== albumId) {
            const newAlbum = albums.find(a => a.id === albumId);
            if (newAlbum) {
                set({ currentAlbum: newAlbum, currentSongIndex: index, isPlaying: false });
                return;
            }
        }

        // Otherwise, select from current album
        if (!currentAlbum) return;
        if (index >= 0 && index < currentAlbum.songs.length) {
            set({ currentSongIndex: index, isPlaying: false });
        }
    },

    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),

    next: () => {
        const { currentAlbum, currentSongIndex, isShuffled } = get();
        if (!currentAlbum) return;

        let nextIndex;
        if (isShuffled) {
            nextIndex = Math.floor(Math.random() * currentAlbum.songs.length);
        } else {
            nextIndex = (currentSongIndex + 1) % currentAlbum.songs.length;
        }
        set({ currentSongIndex: nextIndex });
    },

    prev: () => {
        const { currentAlbum, currentSongIndex, isShuffled } = get();
        if (!currentAlbum) return;

        let prevIndex;
        if (isShuffled) {
            prevIndex = Math.floor(Math.random() * currentAlbum.songs.length);
        } else {
            prevIndex = (currentSongIndex - 1 + currentAlbum.songs.length) % currentAlbum.songs.length;
        }
        set({ currentSongIndex: prevIndex });
    },

    toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),

    toggleLoop: () => set((state) => {
        const modes: ('none' | 'album' | 'song')[] = ['none', 'album', 'song'];
        const currentIndex = modes.indexOf(state.loopMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        return { loopMode: modes[nextIndex] };
    }),

    handleSongEnd: () => {
        const { loopMode, currentAlbum, currentSongIndex, playSong, next, isShuffled } = get();
        if (!currentAlbum) return;

        if (loopMode === 'song') {
            playSong(currentSongIndex);
        } else if (loopMode === 'album') {
            next();
        } else {
            if (isShuffled) {
                next();
            } else {
                if (currentSongIndex >= currentAlbum.songs.length - 1) {
                    set({ isPlaying: false });
                } else {
                    next();
                }
            }
        }
    },

    setVolume: (volume) => set({ volume, isMuted: volume === 0 }),

    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
}));
