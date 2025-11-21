export interface Song {
    title: string;
    duration?: string;
    url: string;
}

export interface Album {
    id: string;
    title: string;
    artist: string;
    cover: string;
    songs: Song[];
}
