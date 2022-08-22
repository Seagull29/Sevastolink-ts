import { SpotifyApi } from "@services/spotify/api/spotifyApi";
import { SpotifyTypes } from "@services/spotify/api/spotifyTypes";
import { Command } from "@utils/models/command";
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

export default class SpotifyCommand extends Command {

    readonly #spotifyApi : SpotifyApi = new SpotifyApi(
        process.env.SPOTIFY_CLIENT_ID || "",
        process.env.SPOTIFY_CLIENT_SECRET || ""        
    );

    constructor() {
        super(SpotifyCommand.#makeCommand());
    }

    static #makeCommand = () : SlashCommandBuilder => {
        const spotifyCommand : SlashCommandBuilder = new SlashCommandBuilder();
        spotifyCommand.setName("spotify").setDescription("Find whatever you want on Spotify catalog");
        spotifyCommand.addSubcommandGroup(subcommandGroup => {
            subcommandGroup.setName("search").setDescription("Search artists, tracks, albums, and more on Spotify");
            subcommandGroup.addSubcommand(this.#makeSubcommand({ 
                name: "artists", description: "Search artists on Spotify", optionName: "query", optionDescription: "Artist to search"
            }));
            subcommandGroup.addSubcommand(this.#makeSubcommand({ 
                name: "tracks", description: "Search tracks on Spotify", optionName: "query", optionDescription: "Track to search"
            }));
            subcommandGroup.addSubcommand(this.#makeSubcommand({ 
                name: "albums", description: "Search albums on Spotify", optionName: "query", optionDescription: "Album to search"
            }));
            subcommandGroup.addSubcommand(this.#makeSubcommand({ 
                name: "playlists", description: "Search playlists on Spotify", optionName: "query", optionDescription: "Playlist to search"
            }));
            
            return subcommandGroup;
        });
        return spotifyCommand;
    }

    static #makeSubcommand = ({ name, description, optionName, optionDescription } : { name : string, description : string, optionName : string, optionDescription : string}) : SlashCommandSubcommandBuilder => {
        const subcommand : SlashCommandSubcommandBuilder = new SlashCommandSubcommandBuilder();
        subcommand.setName(name).setDescription(description);
        subcommand.addStringOption(option => {
            option.setName(optionName).setDescription(optionDescription).setMaxLength(25).setRequired(true);
            return option;
        });
        return subcommand;
    }

    /* #makeEmbed = () : EmbedBuilder => {

    } */

    #makeRequest = async (query : string, type : SpotifyTypes) => {
        const data = await this.#spotifyApi.search(query, type);
        const 
    }

    override execute = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        const query : string = interaction.options.getString("query")!;
        const { _group : group } : any = interaction.options;
        const { _subcommand : subcommand } : any = interaction.options;

        if (group === "search") {
            switch (subcommand) {
                case "artists":
                    this.#makeRequest(query, SpotifyTypes.ARTIST);
                    break;
                case "albums":
                    this.#makeRequest(query, SpotifyTypes.ALBUM);
                    break;
                case "tracks":
                    this.#makeRequest(query, SpotifyTypes.TRACK);
                    break;
                case "playlists":
                    this.#makeRequest(query, SpotifyTypes.PLAYLIST);
                    break;

            }
        }


        await interaction.deferReply();
        await interaction.editReply(query);
    }


}