import { SpotifyObject } from "@services/spotify/models/spotifyObject";

export class SpotifyArtist extends SpotifyObject {

    constructor(data : any) {
        super(data);
    }

    get followers() : number {
        const { followers : { total }} = this.data;
        return total;
    }

    get genres() : string[] {
        const { genres } = this.data;
        return genres;
    }

    get images() : any[] {
        const { images } = this.data;
        return images;
    }

    get standardImage() : string {
        const { images } = this.data;
        return images[0].url;
    }
    
    get popularity() : number {
        const { popularity } = this.data;
        return popularity;
    }

}