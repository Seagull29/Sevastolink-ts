import dotenv from "dotenv";
dotenv.config();

export default {
    clientToken: process.env.CLIENT_TOKEN,
    clientId: process.env.CLIENT_ID,
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    giphyKey: process.env.GIPHY_KEY,
    tenorKey: process.env.TENOR_KEY,
    tenorClientKey: process.env.TENOR_CLIENT_KEY
}