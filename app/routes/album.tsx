import { useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router";
import { usePlayerStore } from "../store/usePlayerStore";
import { Play, Pause, Clock, ArrowLeft } from "lucide-react";
import { clsx } from "clsx";
import { Visualizer } from "../components/Visualizer";

export default function Album() {
    const { albumId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const songParam = searchParams.get("song");

    const albums = usePlayerStore((state) => state.albums);
    const currentAlbum = usePlayerStore((state) => state.currentAlbum);
    const currentSongIndex = usePlayerStore((state) => state.currentSongIndex);
    const isPlaying = usePlayerStore((state) => state.isPlaying);
    const loadAlbum = usePlayerStore((state) => state.loadAlbum);
    const playSong = usePlayerStore((state) => state.playSong);
    const selectSong = usePlayerStore((state) => state.selectSong);
    const play = usePlayerStore((state) => state.play);
    const pause = usePlayerStore((state) => state.pause);

    const album = albums.find((a) => a.id === albumId);
    if (typeof document !== 'undefined') {
        const el = document.getElementById('debug-logs');
        if (el) el.textContent += `[AlbumComponent] Rendered. Duration: ${album?.songs[0]?.duration}|`;
    }

    useEffect(() => {
        if (albumId) {
            loadAlbum(albumId);
        }
    }, [albumId, loadAlbum]);

    useEffect(() => {
        if (songParam && album) {
            const index = parseInt(songParam, 10);
            if (!isNaN(index) && index >= 0 && index < album.songs.length) {
                // Only select if it's different to avoid loops or overriding user action
                if (currentSongIndex !== index) {
                    selectSong(index, albumId);
                }
            }
        }
    }, [songParam, album?.id, album?.songs.length, selectSong, currentSongIndex, albumId]);

    const isCurrentAlbum = currentAlbum?.id === album?.id;

    // Sync State -> URL
    // useEffect(() => {
    //     if (isCurrentAlbum && currentSongIndex >= 0) {
    //         // Use songParam from the hook, which is derived from searchParams but stable value-wise for the render
    //         if (songParam !== currentSongIndex.toString()) {
    //             setSearchParams((prev) => {
    //                 const newParams = new URLSearchParams(prev);
    //                 newParams.set("song", currentSongIndex.toString());
    //                 return newParams;
    //             }, { replace: true });
    //         }
    //     }
    // }, [currentSongIndex, isCurrentAlbum, setSearchParams, songParam]);

    if (!album) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white gap-4">
                <h2 className="text-2xl font-bold">Album not found</h2>
                <p className="text-neutral-400">The album you are looking for does not exist.</p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-neutral-200 transition-colors"
                >
                    Go Home
                </Link>
            </div>
        );
    }

    // Calculate total play time
    const calculateTotalPlayTime = () => {
        let totalSeconds = 0;
        album.songs.forEach(song => {
            if (song.duration) {
                const [minutes, seconds] = song.duration.split(':').map(Number);
                totalSeconds += minutes * 60 + seconds;
            }
        });

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        if (hours > 0) {
            return `${hours} hr ${minutes} min`;
        }
        return `${minutes} min`;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Fixed Header */}
            <div className="flex flex-col p-8 bg-gradient-to-b from-neutral-800 to-neutral-950 flex-shrink-0">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors w-fit mb-6"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Albums</span>
                </Link>
                <div className="flex items-end gap-6">
                    <img
                        src={album.cover}
                        alt={album.title}
                        className="w-52 h-52 shadow-2xl rounded-lg"
                    />
                    <div className="flex flex-col gap-2 mb-2">
                        <span className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                            Album
                        </span>
                        <h1 className="text-5xl font-bold text-white mb-2">{album.title}</h1>
                        <div className="flex items-center gap-2 text-neutral-300 text-sm font-medium">
                            <img
                                src={album.cover} // Avatar placeholder
                                className="w-6 h-6 rounded-full"
                                alt=""
                            />
                            <span>{album.artist}</span>
                            <span>•</span>
                            <span>{album.songs.length} songs</span>
                            <span>•</span>
                            <span>{calculateTotalPlayTime()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Songs List */}
            <div className="flex-1 bg-neutral-950 overflow-y-auto">
                <div className="p-8">
                    <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 text-neutral-400 text-sm border-b border-neutral-800 mb-4 uppercase tracking-wider">
                        <span>#</span>
                        <span>Title</span>
                        <Clock size={16} />
                    </div>

                    <div className="flex flex-col">
                        {album.songs.map((song, index) => {
                            const isActive = isCurrentAlbum && currentSongIndex === index;

                            return (
                                <div
                                    key={index}
                                    onClick={() => playSong(index, albumId)}
                                    className={clsx(
                                        "grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-3 rounded-md cursor-pointer group transition-colors",
                                        isActive
                                            ? "bg-neutral-800 text-green-500"
                                            : "text-neutral-300 hover:bg-neutral-900"
                                    )}
                                >
                                    <div className="w-6 flex items-center justify-center relative">
                                        {isActive && isPlaying ? (
                                            <div
                                                className="relative group/visualizer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    pause();
                                                }}
                                            >
                                                <Visualizer isPlaying={true} />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/visualizer:opacity-100 transition-opacity">
                                                    <Pause size={16} className="text-white bg-neutral-900/80 rounded-full p-0.5" fill="currentColor" />
                                                </div>
                                            </div>
                                        ) : isActive ? (
                                            <div
                                                className="relative group/visualizer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    play();
                                                }}
                                            >
                                                <span className="text-green-500 group-hover/visualizer:opacity-0 transition-opacity">{index + 1}</span>
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/visualizer:opacity-100 transition-opacity">
                                                    <Play size={16} className="text-white" fill="currentColor" />
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="group-hover:hidden">{index + 1}</span>
                                        )}
                                        {!isActive && (
                                            <Play size={16} className="hidden group-hover:block text-white" />
                                        )}
                                    </div>

                                    <div className="flex flex-col">
                                        <span className={clsx("font-medium", isActive ? "text-green-500" : "text-white")}>
                                            {song.title}
                                        </span>
                                        <span className="text-neutral-500 text-sm md:hidden">
                                            {album.artist}
                                        </span>
                                    </div>

                                    <span className="text-sm font-variant-numeric tabular-nums">
                                        {song.duration || "--:--"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
