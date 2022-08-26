
export class TenorCategory {

    readonly #data! : any;

    constructor(data : any) {
        this.#data = data;
    }

    get searchTerm() : string {
        const { searchterm } = this.#data;
        return searchterm;
    }

    get path() : string {
        const { path } = this.#data;
        return path;
    }

    get image() : string {
        const { image } = this.#data;
        return image;
    }

    get name() : string {
        const { name } = this.#data;
        return name;
    }

}