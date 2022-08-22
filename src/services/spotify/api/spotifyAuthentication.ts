import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import url from "url";

export class SpotifyAuthentication {

    #accessToken! : string;
    #expiresTime! : number;
    readonly #clientId! : string;
    readonly #clientSecret! : string;
    readonly #axiosInstance : AxiosInstance = axios.create({
        baseURL: "https://accounts.spotify.com/api",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    constructor(clientId : string, clientSecret : string) {
        this.#clientId = clientId;
        this.#clientSecret = clientSecret;
    }

    #performAuthentication = async () : Promise<void> => {
        try {
            const authenticationResponse : AxiosResponse = await this.#axiosInstance.post("/token", 
                new url.URLSearchParams({
                    grant_type: "client_credentials"
                }).toString(),
                {
                    headers: {
                        "Authorization": `Basic ${Buffer.from(`${this.#clientId}:${this.#clientSecret}`).toString("base64")}`
                    }
                }
            );

            if (authenticationResponse.status !== 200) {
                throw new Error(`Failed status code: ${authenticationResponse.status}`);
            }

            const { access_token } = authenticationResponse.data;
            const { expires_in } = authenticationResponse.data;
            this.#accessToken = access_token;
            this.#expiresTime = new Date().getTime() + (expires_in * 1000);

        } catch (error : any) {
            if (error instanceof(AxiosError) && error.isAxiosError) {
                console.log(`Axios error with code ${error.code}: ${error.message}`);
            } else {
                console.log(`Environment error: ${error.message}`);
            }
            this.#accessToken = "";
        }
    }

    protected useAccessToken = async () : Promise<string> => {
        const now : number = new Date().getTime();
        if (this.#accessToken === undefined || (now >= this.#expiresTime)) {
            await this.#performAuthentication();
            return await this.useAccessToken();
        }
        return this.#accessToken;
    }

}