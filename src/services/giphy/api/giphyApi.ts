import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { GiphyTypes } from "@services/giphy/api/giphyTypes";

export class GiphyApi {

    readonly #axiosInstance : AxiosInstance = axios.create({
        baseURL: "https://api.giphy.com/v1",
    });
    readonly #giphyKey! : string;

    constructor(giphyKey : string) {
        this.#giphyKey = giphyKey;
    }

    search = async (q : string, type : GiphyTypes, otherOptions : { limit? : number, offset? : number, lang? : string, rating? : string} = {}) => {
        try {
            let { limit, offset, lang, rating } = otherOptions;
            limit ??= 25;
            offset ??= 0;
            if ((limit < 0) || (offset < 0)) {
                throw new TypeError("Limit and Offset cannot be a negative number");
            }
            const params = { api_key: this.#giphyKey, q: q.replaceAll(" ", "+"), limit, offset, lang, rating };
            const giphyResponse : AxiosResponse = await this.#axiosInstance.get(`/${type}/search`, { params });

            if (giphyResponse.status !== 200) {
                throw new Error("The response wasn't successful");
            }
            
            const { data : giphyData } = giphyResponse;
            return giphyData;
        } catch (error : any) {
            if (error instanceof(AxiosError) && error.isAxiosError) {
                console.log(`Axios error with code ${error.code}: ${error.message}`);
            } else {
                console.log(`Environment error: ${error.message}`);
            }
        }
    }

}
