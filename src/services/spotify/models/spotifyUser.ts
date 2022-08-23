import { SpotifyObject } from "@services/spotify/models/spotifyObject";

export class SpotifyUser extends SpotifyObject {

    constructor(data : any) {
        super(data);
    }

    get displayName() : string {
        const { display_name } = this.data;
        return display_name;
    }

}