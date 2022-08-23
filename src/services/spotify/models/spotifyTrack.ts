import { SpotifyAlbum } from "@services/spotify/models/spotifyAlbum";
import { SpotifyArtist } from "@services/spotify/models/spotifyArtist";
import { SpotifyObject } from "@services/spotify/models/spotifyObject";

export class SpotifyTrack extends SpotifyObject {

    constructor(data : any) {
        super(data);
    }

    get album() : SpotifyAlbum {
        const { album } = this.data;
        return new SpotifyAlbum(album);
    }

    get artists() : SpotifyArtist[] {
        const { artists : genericArtists } = this.data;

        const artists : SpotifyArtist[] = [];

        for (const artist of genericArtists) {
            artists.push(new SpotifyArtist(artist))
        }
        return artists;
    }

    get availableMarkets() : string[] {
        const { available_markets } = this.data;
        return available_markets;
    }

    get discNumber() : number {
        const { disc_number } = this.data;
        return disc_number;
    }

    get durationMs() : number {
        const { duration_ms } = this.data;
        return duration_ms;
    }

    get explicit() : boolean {
        const { explicit } = this.data;
        return explicit;
    }

    get externalIds() : string {
        const { external_ids : { isrc }} = this.data;
        return isrc;
    }

    get isLocal() : boolean {
        const { is_local } = this.data;
        return is_local;
    }

    get popularity() : number {
        const { popularity } = this.data;
        return popularity;
    }

    get previewUrl() : string {
        const { preview_url } = this.data;
        return preview_url;
    }

    get trackNumber() : number {
        const { track_number } = this.data;
        return track_number;
    }

}