import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { TenorTypes, TenorArRange, TenorContentFilter, TenorCategoryTypes } from "@services/tenor/api/tenorTypes";

export class TenorApi {

    readonly #axiosInstance : AxiosInstance = axios.create({
        baseURL: "https://tenor.googleapis.com/v2"
    });
    readonly #TENOR_KEY! : string;
    readonly #TENOR_CLIENT_KEY! : string;

    constructor(tenorKey : string, clientKey? : string) {
        this.#TENOR_KEY = tenorKey;
        this.#TENOR_CLIENT_KEY = clientKey || "";
    }

    search = async (q : string, otherOptions : { searchFilter? : TenorTypes, country? : string, locale? : string, contentFilter? : TenorContentFilter, mediaFilter? : string, arRange? : TenorArRange, random? : boolean, limit? : number, pos? : number} = {}) => {
        try {
            let { searchFilter, country, locale, contentFilter, mediaFilter, arRange, random, limit, pos } = otherOptions;
            limit ??= 20;
            if ((limit < 0 || limit > 50)) {
                throw new TypeError("Limit cannot be a negative numbers");
            }
            if (pos && pos < 0) {
                throw new TypeError("Pos cannot be a negative number");
            }
            if (locale && locale.length > 4) {
                throw new TypeError("Locale must have 2 characters");
            }
            if (country && country.length !== 2) {
                throw new TypeError("Country must be a country code according to ISO 3166-1");
            }
            const params = {
                key: this.#TENOR_KEY,
                client_key: this.#TENOR_CLIENT_KEY,
                q: q.replaceAll(" ", "+"),
                searchfilter: searchFilter,
                country,
                locale,
                contentfilter: contentFilter,
                media_filter: mediaFilter,
                ar_range: arRange,
                random,
                limit,
                pos
            };
            const tenorResponse : AxiosResponse = await this.#axiosInstance.get("/search", { params });
            if (tenorResponse.status !== 200) {
                throw new Error("The response wasn't successful");
            }
            const { data : tenorData } = tenorResponse;
            return tenorData;
        } catch (error : any) {
            if (error instanceof(AxiosError) && error.isAxiosError) {
                console.log(`Axios error with code ${error.code}: ${error.message}`);
            } else {
                console.log(`Environment error: ${error.message}`);
            }
        }
    }

    featured = async (otherOptions : { searchFilter? : TenorTypes, country? : string, locale? : string, mediaFilter? : string, arRange? : TenorArRange, contentFilter? : TenorContentFilter, limit? : number, pos? : number} = {}) => {
        try {
            const { searchFilter, country, locale, mediaFilter, arRange, contentFilter, pos } = otherOptions;
            let { limit } = otherOptions;
            limit ??= 20;
            if ((limit < 0 || limit > 50)) {
                throw new TypeError("Limit cannot be a negative numbers");
            }
            if (pos && pos < 0) {
                throw new TypeError("Pos cannot be a negative number");
            }
            if (locale && locale.length > 4) {
                throw new TypeError("Locale must have 2 characters");
            }
            if (country && country.length !== 2) {
                throw new TypeError("Country must be a country code according to ISO 3166-1");
            }
            const params = {
                key: this.#TENOR_KEY,
                client_key: this.#TENOR_CLIENT_KEY,
                searchfilter: searchFilter,
                country,
                locale,
                media_filter: mediaFilter,
                ar_range: arRange,
                contentfilter: contentFilter,
                limit,
                pos
            };
            const tenorResponse : AxiosResponse = await this.#axiosInstance.get("/featured", { params });
            if (tenorResponse.status !== 200) {
                throw new Error("The response wasn't successful");
            }
            const { data : tenorData } = tenorResponse;
            return tenorData;
        } catch (error : any) {
            if (error instanceof(AxiosError) && error.isAxiosError) {
                console.log(`Axios error with code ${error.code}: ${error.message}`);
            } else {
                console.log(`Environment error: ${error.message}`);
            }
        }
    }

    categories = async (otherOptions : { country? : string, locale? : string, type? : TenorCategoryTypes, contentFilter? : TenorContentFilter } = {}) => {
        try {
            const { country, locale, type, contentFilter } = otherOptions;
            if (locale && locale.length > 4) {
                throw new TypeError("Locale must have 2 characters");
            }
            if (country && country.length !== 2) {
                throw new TypeError("Country must be a country code according to ISO 3166-1");
            }
            const params = {
                key: this.#TENOR_KEY,
                client_key: this.#TENOR_CLIENT_KEY,
                country,
                locale,
                type,
                contentfilter: contentFilter
            };
            const tenorResponse : AxiosResponse = await this.#axiosInstance.get("/categories", { params });
            if (tenorResponse.status !== 200) {
                throw new Error("The response wasn't successful");
            }
            const { data : tenorData } = tenorResponse;
            return tenorData;
        } catch (error : any) {
            if (error instanceof(AxiosError) && error.isAxiosError) {
                console.log(`Axios error with code ${error.code}: ${error.message}`);
            } else {
                console.log(`Environment error: ${error.message}`);
            }
        }
    }


}