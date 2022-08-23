import { SpotifyUser } from "@services/spotify/models/spotifyUser";
import { SpotifyObject } from "@services/spotify/models/spotifyObject";

export class SpotifyPlaylist extends SpotifyObject {

    constructor(data : any) {
        super(data);
    }

    get collaborative() : boolean {
        const { collaborative } = this.data;
        return collaborative;
    }

    get description() : string {
        const { description } = this.data;
        return description;
    }

    get images() : any[] {
        const { images } = this.data;
        return images;
    }

    get standardImage() : string {
        const { images } = this.data;
        return images[0].url;
    }

    get owner() : SpotifyUser {
        const { owner } = this.data;
        return new SpotifyUser(owner);
    }

    get primaryColor() : any {
        const { primary_color } = this.data;
        return primary_color;
    }

    get public() : any {
        const { public : isPublic } = this.data;
        return isPublic;
    }

    get snapshotId() : string {
        const { snapshot_id } = this.data;
        return snapshot_id;
    }

    get tracks() : number {
        const { tracks : { total } } = this.data;
        return total;
    }

}