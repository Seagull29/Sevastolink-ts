import { SpotifyArtist } from "@services/spotify/models/spotifyArtist";
import { SpotifyObject } from "@services/spotify/models/spotifyObject";

export class SpotifyAlbum extends SpotifyObject {

    constructor(data : any) {
        super(data);
    }

    get albumType() : string {
        const { album_type } = this.data;
        return album_type;
    }

    get artists() : SpotifyArtist[] {
        const { artists : genericArtists } = this.data;
        const artists : SpotifyArtist[] = [];
        for (const artist of genericArtists) {
            artists.push(new SpotifyArtist(artist));
        }
        return artists;
    }

    get availableMarkets() : string[] {
        const { available_markets } = this.data;
        return available_markets;
    }

    get images() : any[] {
        const { images } = this.data;
        return images;
    }

    get standardImage() : string {
        const { images } = this.data;
        return images[0].url;
    }

    get releaseDate() : string {
        const { release_date } = this.data;
        return release_date; 
    }

    get releaseDatePrecision() : string {
        const { release_date_precision } = this.data;
        return release_date_precision;
    }

    get totalTracks() : number {
        const { total_tracks } = this.data;
        return total_tracks;
    }

}