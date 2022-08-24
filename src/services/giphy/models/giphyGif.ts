import { GiphyUser } from "@services/giphy/models/giphyUser";

export class GiphyGif {

    readonly #data! : any;

    constructor(data : any) {
        this.#data = data;
    }

    get type() : string {
        const { type } = this.#data;
        return type;
    }

    get id() : string {
        const { id } = this.#data;
        return id;
    }

    get url() : string {
        const { url } = this.#data;
        return url;
    }

    get slug() : string {
        const { slug } = this.#data;
        return slug;
    }

    get bitlyGifUrl() : string {
        const { bitly_gif_url } = this.#data;
        return bitly_gif_url;
    }

    get bitlyUrl() : string {
        const { bitly_url } = this.#data;
        return bitly_url;
    }

    get embedUrl() : string {
        const { embed_url } = this.#data;
        return embed_url;
    }

    get username() : string {
        const { username } = this.#data;
        return username;
    }

    get source() : string {
        const { source } = this.#data;
        return source;
    }

    get title() : string {
        const { title } = this.#data;
        return title;
    }

    get rating() : string {
        const { rating } = this.#data;
        return rating;
    }

    get contentUrl() : string {
        const { content_url } = this.#data;
        return content_url;
    }

    get sourceTld() : string {
        const { source_tld } = this.#data;
        return source_tld;
    }

    get sourcePostUrl() : string {
        const { source_post_url } = this.#data;
        return source_post_url;
    }

    get isSticker() : number {
        const { is_sticker } = this.#data;
        return is_sticker;
    }

    get importDatetime() : string {
        const { import_datetime } = this.#data;
        return import_datetime;
    }

    get trendingDatetime() : string {
        const { trending_datetime } = this.#data;
        return trending_datetime;
    }

    get images() : any[] {
        const { images } = this.#data;
        return images;
    }

    get originalImage() : string {
        const { images : { original }} = this.#data;
        return original.url;
    }

    get user() : GiphyUser {
        const { user } = this.#data;
        return new GiphyUser(user);
    }

    get analyticsResponsePayload() : string {
        const { analytics_response_payload } = this.#data;
        return analytics_response_payload;
    }

    get analytics() : any[] {
        const { analytics } = this.#data;
        return analytics;
    }

}