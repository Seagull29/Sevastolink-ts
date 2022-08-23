
export abstract class SpotifyObject {

    protected readonly data! : any;

    constructor(data : any) {
        this.data = data;
    }

    get externalUrl() : string {
        const { external_urls : { spotify }} = this.data;
        return spotify;
    }

    get href() : string {
        const { href } = this.data;
        return href;
    }

    get id() : string {
        const { id } = this.data;
        return id;
    }

    get name() : string {
        const { name } = this.data;
        return name;
    }

    get type() : string {
        const { type } = this.data;
        return type;
    }

    get uri() : string {
        const { uri } = this.data;
        return uri;
    }

}