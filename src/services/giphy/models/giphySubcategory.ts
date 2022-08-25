

export class GiphySubcategory {

    readonly #data! : any;

    constructor(data : any) {
        this.#data = data;
    }

    get name() : string {
        const { name } = this.#data;
        return name;
    }

    get nameEncoded() : string {
        const { name_encoded } = this.#data;
        return name_encoded;
    }

}