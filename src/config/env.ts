import dotenv from "dotenv";
dotenv.config();

enum Environment {
    CLIENT_TOKEN = "clientToken",
    CLIENT_ID = "clientId",
    SPOTIFY_CLIENT_ID = "spotifyClientId",
    SPOTIFY_CLIENT_SECRET = "spotifyClientSecret",
    GIPHY_KEY = "giphyKey",
    TENOR_KEY = "tenorKey",
    TENOR_CLIENT_KEY = "tenorClientKey"
}

const envMap : Map<Environment, string> = new Map();
envMap.set(Environment.CLIENT_TOKEN, process.env.CLIENT_TOKEN || "");
envMap.set(Environment.CLIENT_ID, process.env.CLIENT_ID || "");
envMap.set(Environment.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_ID || "");
envMap.set(Environment.SPOTIFY_CLIENT_SECRET, process.env.SPOTIFY_CLIENT_SECRET || "");
envMap.set(Environment.GIPHY_KEY, process.env.GIPHY_KEY || "");
envMap.set(Environment.TENOR_KEY, process.env.TENOR_KEY || "");
envMap.set(Environment.TENOR_CLIENT_KEY, process.env.TENOR_CLIENT_KEY || "");

export { Environment, envMap }