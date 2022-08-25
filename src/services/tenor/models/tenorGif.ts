

export class TenorGif {

    readonly #data! : any;

    constructor(data : any) {
        this.#data = data;
    }

    get id() : string {
        const { id } = this.#data;
        return id;
    }

    get title() : string {
        const { title } = this.#data;
        return title;
    }

    get mediaFormats() : any[] {
        const { media_formats } = this.#data;
        return media_formats;
    }

    get gifUrl() : string {
        const { media_formats : { gif : { url } }} = this.#data;
        return url
    }

    get created() : number {
        const { created } = this.#data;
        return created;
    }

    get contentDescription() : string {
        const { content_description } = this.#data;
        return content_description;
    }
    get itemUrl() : string {
        const { itemurl } = this.#data;
        return itemurl;
    }

    get url() : string {
        const { url } = this.#data;
        return url;
    }

    get tags() : string[] {
        const { tags } = this.#data;
        return tags;
    }

    get flags() : string[] {
        const { flags } = this.#data;
        return flags;
    }

    get hasAudio() : boolean {
        const { hasaudio } = this.#data;
        return hasaudio;
    }

}