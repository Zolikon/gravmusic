import { Link } from "react-router";
import { usePlayerStore } from "../store/usePlayerStore";
import { PlayCircle, Pause } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const albums = usePlayerStore((state) => state.albums);
  const currentAlbum = usePlayerStore((state) => state.currentAlbum);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playSong = usePlayerStore((state) => state.playSong);
  const pause = usePlayerStore((state) => state.pause);

  const [hoveredAlbumId, setHoveredAlbumId] = useState<string | null>(null);

  const handlePlayAlbum = (e: React.MouseEvent, albumId: string) => {
    e.preventDefault();
    e.stopPropagation();
    playSong(0, albumId);
  };

  const handlePause = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    pause();
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <img src="/logo.png" alt="GravMusic Logo" className="size-32 m-auto rounded-lg shadow-lg" />

      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {albums.map((album) => {
          const isCurrentAlbum = currentAlbum?.id === album.id;
          const showPlayingIndicator = isCurrentAlbum && isPlaying;
          const isHovered = hoveredAlbumId === album.id;

          return (
            <Link
              key={album.id}
              to={`/${album.id}`}
              className="group relative bg-neutral-900 rounded-lg p-4 hover:bg-neutral-800 transition-colors"
            >
              <div className="relative aspect-square mb-4 overflow-hidden rounded-md">
                <img
                  src={album.cover}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Play button or playing indicator in bottom right */}
                <div
                  className="absolute bottom-2 right-2"
                  onMouseEnter={() => setHoveredAlbumId(album.id)}
                  onMouseLeave={() => setHoveredAlbumId(null)}
                >
                  {showPlayingIndicator ? (
                    <button
                      onClick={handlePause}
                      className="w-10 h-10 bg-green-500 hover:bg-green-400 rounded-full shadow-lg transition-all hover:scale-110 cursor-pointer flex items-center justify-center"
                      aria-label="Pause"
                    >
                      {isHovered ? (
                        <Pause size={20} className="text-white" fill="white" />
                      ) : (
                        <>
                          <div className="w-0.5 bg-white rounded-full animate-playing-bar" style={{ height: '12px', animationDelay: '0ms' }}></div>
                          <div className="w-0.5 bg-white rounded-full animate-playing-bar mx-0.5" style={{ height: '12px', animationDelay: '150ms' }}></div>
                          <div className="w-0.5 bg-white rounded-full animate-playing-bar" style={{ height: '12px', animationDelay: '300ms' }}></div>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handlePlayAlbum(e, album.id)}
                      className="w-10 h-10 bg-green-500 hover:bg-green-400 rounded-full shadow-lg transition-all hover:scale-110 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100"
                      aria-label={`Play ${album.title}`}
                    >
                      <PlayCircle size={24} className="text-white" />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="font-semibold truncate" title={album.title}>
                {album.title}
              </h3>
              <p className="text-neutral-400 text-sm truncate">{album.artist}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
