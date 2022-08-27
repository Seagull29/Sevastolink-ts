import axios, { AxiosInstance, AxiosResponse } from "axios";
import { SpotifyAuthentication } from "@services/spotify/api/spotifyAuthentication";
import { SpotifyTypes } from "@services/spotify/api/spotifyTypes";

export class SpotifyApi extends SpotifyAuthentication {

    #axiosInstance : AxiosInstance = axios.create({
        baseURL: "https://api.spotify.com/v1",
        headers: {
            "Content-Type": "application/json"
        }
    });

    constructor(clientId : string, clientSecret : string) {
        super(clientId, clientSecret);
    }

    search = async (q : string, type : SpotifyTypes, limit : number = 20, offset : number = 0) => {
        try {
            if ((limit < 0) || (offset < 0)) {
                throw new TypeError("Limit and Offset cannot be a negative number");
            }
            const params = { q, type, limit, offset };
            const headers = { "Authorization": `Bearer ${await this.useAccessToken()}` };
            const spotifyResponse : AxiosResponse = await this.#axiosInstance.get("/search", { params, headers });
            if (spotifyResponse.status !== 200) {
                throw new Error("The response wasn't successful");
            }

            const { data : spotifyData } = spotifyResponse;
            return spotifyData;

        } catch (error : any) {
            console.log(error);
        }
    }
}
