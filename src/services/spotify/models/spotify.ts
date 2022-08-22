
export class Spotify {

    readonly #data! : any;

    constructor(data : any) {

        this.#data = data;
    }

    get externalUrl() : string {
        const { external_urls : { spotify }} = this.#data;
        return spotify;
    }

    get followers() : number {
        const { followers : { total }} = this.#data;
        return total;
    }

    get genres() : string[] {
        const { genres } = this.#data;
        return genres;
    }

    get id() : string {
        const { id } = this.#data;
        return id;
    }

    get images() : any[] {
        const { images } = this.#data;
        return images;
    }

    get standardImage() : string {
        const { images } = this.#data;
        return images[0].url;
    }

    get name() : string {
        const { name } = this.#data;
        return name;
    }

    get popularity() : number {
        const { popularity } = this.#data;
        return popularity;
    }

    get type() : string {
        const { type } = this.#data;
        return type;
    }


}