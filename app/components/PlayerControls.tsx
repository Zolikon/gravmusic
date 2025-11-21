import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Volume2, VolumeX, Repeat, Repeat1 } from "lucide-react";
import { clsx } from "clsx";

export function PlayerControls() {
    const {
        currentAlbum,
        currentSongIndex,
        isPlaying,
        isShuffled,
        volume,
        isMuted,
        play,
        pause,
        next,
        prev,
        toggleShuffle,
        setVolume,
        toggleMute,
        loopMode,
        toggleLoop,
        handleSongEnd,
    } = usePlayerStore();

    const audioRef = useRef<HTMLAudioElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const shouldPlayRef = useRef(false);
    const previousSongRef = useRef<string | undefined>(undefined);

    const currentSong = currentAlbum?.songs[currentSongIndex];

    useEffect(() => {
        if (audioRef.current && currentSong) {
            if (isPlaying) {
                audioRef.current.play().catch(() => {
                    // Auto-play might be blocked; do not change store state here
                });
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentSong]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    useEffect(() => {
        if (audioRef.current && currentSong) {
            // Only reset the source if the song actually changed
            if (previousSongRef.current !== currentSong.url) {
                audioRef.current.src = currentSong.url;
                setCurrentTime(0);
                shouldPlayRef.current = isPlaying;
                previousSongRef.current = currentSong.url;
                // Audio will play in onCanPlay handler if shouldPlayRef is true
            }
        }
    }, [currentSong, isPlaying]); // Watch both, but only act on song change

    const handleCanPlay = () => {
        if (audioRef.current && shouldPlayRef.current) {
            audioRef.current.play().catch(() => {
                pause();
            });
            shouldPlayRef.current = false;
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        const newTime = percentage * duration;

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleAudioEnded = () => {
        if (loopMode === 'song') {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => {
                    // Auto-play might be blocked
                });
            }
        } else {
            handleSongEnd();
        }
    };

    return (
        <div className="w-full shrink-0 bg-neutral-900 border-t border-neutral-800 px-4 py-2 md:py-0 md:h-24 flex flex-col md:flex-row items-center justify-between z-50 gap-2 md:gap-0">
            <audio
                ref={audioRef}
                onEnded={handleAudioEnded}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onCanPlay={handleCanPlay}
                onError={() => {
                    console.error("Audio error");
                    next(); // Skip to next if error
                }}
            />

            {/* Song Info */}
            <div className="flex items-center w-full md:w-1/3 min-w-0 gap-3 md:gap-4">
                {currentAlbum && currentSong ? (
                    <>
                        <img
                            src={currentAlbum.cover}
                            alt={currentAlbum.title}
                            className="w-10 h-10 md:w-14 md:h-14 rounded object-cover shadow-lg animate-fade-in"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-white font-medium truncate text-sm md:text-base">
                                {currentSong.title}
                            </span>
                            <span className="text-neutral-400 text-xs md:text-sm truncate">
                                {currentAlbum.artist}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="text-neutral-500 text-sm">Select an album to play</div>
                )}
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-1 md:gap-2 w-full md:w-1/3 order-last md:order-none pb-2 md:pb-0">
                <div className="flex items-center justify-center gap-4 md:gap-6 w-full">
                    <button
                        onClick={toggleShuffle}
                        className={clsx(
                            "text-neutral-400 hover:text-white transition-colors cursor-pointer relative",
                            isShuffled && "text-green-500 hover:text-green-400"
                        )}
                        title="Shuffle"
                    >
                        <Shuffle size={18} className="md:w-5 md:h-5" />
                        {isShuffled && (
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
                        )}
                    </button>

                    <button
                        onClick={prev}
                        className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        disabled={!currentSong}
                    >
                        <SkipBack size={20} className="md:w-6 md:h-6" />
                    </button>

                    <button
                        onClick={isPlaying ? pause : play}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                        disabled={!currentSong}
                    >
                        {isPlaying ? <Pause size={16} className="md:w-5 md:h-5" fill="currentColor" /> : <Play size={16} className="md:w-5 md:h-5 ml-0.5" fill="currentColor" />}
                    </button>

                    <button
                        onClick={next}
                        className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        disabled={!currentSong}
                    >
                        <SkipForward size={20} className="md:w-6 md:h-6" />
                    </button>

                    <button
                        onClick={toggleLoop}
                        className={clsx(
                            "text-neutral-400 hover:text-white transition-colors cursor-pointer relative",
                            loopMode !== 'none' && "text-green-500 hover:text-green-400"
                        )}
                        title="Loop"
                    >
                        {loopMode === 'song' ? (
                            <Repeat1 size={18} className="md:w-5 md:h-5" />
                        ) : (
                            <Repeat size={18} className="md:w-5 md:h-5" />
                        )}
                        {loopMode !== 'none' && (
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
                        )}
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 w-full max-w-md">
                    <span className="text-xs text-neutral-400 tabular-nums min-w-[40px]">
                        {formatTime(currentTime)}
                    </span>
                    <div
                        className="flex-1 h-1 bg-neutral-700 rounded-full cursor-pointer group relative"
                        onClick={handleSeek}
                    >
                        <div
                            className="h-full bg-white rounded-full transition-all relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    <span className="text-xs text-neutral-400 tabular-nums min-w-[40px]">
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            {/* Volume */}
            <div className="hidden md:flex items-center justify-end gap-3 w-1/3">
                <button onClick={toggleMute} className="text-neutral-400 hover:text-white cursor-pointer">
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-24 h-1 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-white hover:accent-green-500"
                />
            </div>
        </div>
    );
}
