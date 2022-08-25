import { GiphyGif } from "@services/giphy/models/giphyGif";
import { GiphySubcategory } from "@services/giphy/models/giphySubcategory";

export class GiphyCategory {

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

    get subcategories() : GiphySubcategory[] {
        const { subcategories : generic } = this.#data;
        const subcategories : GiphySubcategory[] = [];
        for (const subcategory of generic) {
            subcategories.push(new GiphySubcategory(subcategory));
        }
        return subcategories;
    }

    get gif() : GiphyGif {
        const { gif } = this.#data;
        return new GiphyGif(gif);
    }

}