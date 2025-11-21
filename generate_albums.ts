import fs from 'fs';
import path from 'path';

const publicDir = 'c:/dev/music/public';
const albums = [
    {
        dir: 'A Dzsungel könyve magyar',
        id: 'dzsungel-konyve',
        title: 'A Dzsungel Könyve',
        artist: 'Dés László - Geszti Péter',
        cover: 'https://placehold.co/300x300/228b22/ffffff?text=Dzsungel'
    },
    {
        dir: 'High School Musical 1 Soundtrack',
        id: 'hsm-1',
        title: 'High School Musical',
        artist: 'High School Musical Cast',
        cover: 'https://placehold.co/300x300/e60000/ffffff?text=HSM'
    },
    {
        dir: 'Romeo and Juliette (London)',
        id: 'romeo-juliette-london',
        title: 'Romeo & Juliette (London)',
        artist: 'Gérard Presgurvic',
        cover: 'https://placehold.co/300x300/4b0082/ffffff?text=Romeo'
    }
];

const result = albums.map(album => {
    const dirPath = path.join(publicDir, album.dir);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.mp3'));

    return {
        id: album.id,
        title: album.title,
        artist: album.artist,
        cover: album.cover,
        songs: files.map(file => ({
            title: file.replace('.mp3', ''),
            url: `/${album.dir}/${file}`
        }))
    };
});

fs.writeFileSync(path.join(publicDir, 'albums.json'), JSON.stringify(result, null, 2));
console.log('albums.json updated');
