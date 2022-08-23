import { SpotifyApi } from "@services/spotify/api/spotifyApi";
import { SpotifyTypes } from "@services/spotify/api/spotifyTypes";
import { SpotifyArtist } from "@services/spotify/models/spotifyArtist";
import { Command } from "@utils/models/command";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, Message, MessageComponentInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder, User } from "discord.js";
import { setTimeout as wait } from "timers/promises";
import { nanoid } from "nanoid";
import { SpotifyAlbum } from "@services/spotify/models/spotifyAlbum";

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

    #replyToEmptyData = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        await interaction.editReply({
            content: ">>> There are not results to show.\nProbably a bad search query was written.",
        });
        await wait(2000);
        await interaction.deleteReply();
    }

    #makeButtons = (previousId : string, nextId : string) : ActionRowBuilder<ButtonBuilder> => {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(previousId).setStyle(ButtonStyle.Success).setEmoji("⏮️").setLabel("Previous"),
            new ButtonBuilder().setCustomId(nextId).setStyle(ButtonStyle.Success).setLabel("Next").setEmoji("⏭️")
        );
        return row;
    }

    #makeArtistEmbed = (artists : SpotifyArtist[], user : User, index : number) : EmbedBuilder => {

        const now : Date = new Date();
        const embed : EmbedBuilder = new EmbedBuilder();
        const artist : SpotifyArtist = artists[index];

        embed.setTitle(artist.name).setURL(artist.externalUrl).setColor(user.accentColor!);
        embed.setAuthor({
            name: "Spotify",
            iconURL: "https://developer.spotify.com/assets/branding-guidelines/icon4@2x.png",
            url: "https://open.spotify.com/"
        });
        embed.setThumbnail(artist.standardImage);
        embed.setFooter({
            text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}\nResult ${index + 1} of ${artists.length}`,
            iconURL: user.avatarURL() || ""
        });
    
        embed.addFields(
            { name: "Genres", value: artist.genres.join(", ") },
            { name: "Type", value: artist.type, inline: true  },
            { name: "Followers", value: artist.followers.toString(), inline: true },
            { name: "Popularity", value: artist.popularity.toString(), inline: true }
        );
        return embed;
    }

    #makeAlbumEmbed = (albums : SpotifyAlbum[], user : User, index : number) : EmbedBuilder => {
        const now : Date = new Date();
        const embed : EmbedBuilder = new EmbedBuilder();
        const album : SpotifyAlbum = albums[index];

        const { artists } = album;
        const artistNames : string[] = [];
        for (const artist of artists) {
            artistNames.push(artist.name);
        }
        const allArtists : string = artistNames.join(", ");

        embed.setTitle(album.name).setURL(album.externalUrl).setColor(user.accentColor!);
        embed.setAuthor({
            name: "Spotify",
            iconURL: "https://developer.spotify.com/assets/branding-guidelines/icon4@2x.png",
            url: "https://open.spotify.com/"
        });
        embed.setThumbnail(album.standardImage);
        embed.setFooter({
            text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}\nResult ${index + 1} of ${albums.length}`,
            iconURL: user.avatarURL() || ""
        });
        embed.addFields(
            { name: "Artists", value: allArtists },
            { name: "Album type", value: album.albumType },
            { name: "Available markets", value: `${album.availableMarkets.length} countries`, inline: true },
            { name: "Release date", value: album.releaseDate, inline: true },
            { name: "Total tracks", value: album.totalTracks.toString(), inline: true }
        );
        return embed;
    }

    #processArtists = async (interaction : ChatInputCommandInteraction, query : string) : Promise<void> => {
        await interaction.deferReply();
        const data = await this.#spotifyApi.search(query, SpotifyTypes.ARTIST);
        const { artists : { items } } = data;
        const artists : SpotifyArtist[] = [];
        for (const artist of items) {
            artists.push(new SpotifyArtist(artist));
        }

        if (!artists.length) {
            this.#replyToEmptyData(interaction);
            return;
        }
        
        const nextInteractionId : string = nanoid();
        const previousInteractionId : string = nanoid();

        console.log(nextInteractionId, "otra vez");
        console.log(previousInteractionId, "otra vez");

        let index : number = 0;
        const selected : SpotifyArtist = artists[index];
        const user : User = await interaction.user.fetch();
        
        await interaction.editReply({
            embeds: [this.#makeArtistEmbed(artists, user, index)],
            components: [this.#makeButtons(previousInteractionId, nextInteractionId)]
        });

        let embedUrlMessage : Message = await (await interaction.followUp(selected.externalUrl)).fetch();

        const navigationFilter = (messageInteraction : MessageComponentInteraction) => messageInteraction.customId === previousInteractionId || messageInteraction.customId === nextInteractionId;

        const nextCollector = interaction.channel?.createMessageComponentCollector({
            filter: navigationFilter,
            time: 1000 * 60 * 2,
            max: 5
        });

        nextCollector?.on("collect", async (messageInteraction : MessageComponentInteraction) => {

            if (messageInteraction.customId === nextInteractionId) {
                ++index;
            } else if (messageInteraction.customId === previousInteractionId) {
                --index;
            }

            if (index === artists.length) {
                index = 0;
            }

            if (index === -1) {
                index = artists.length - 1;
            }

            const currentArtist : SpotifyArtist = artists[index];
            embedUrlMessage.delete();

            await messageInteraction.update({
                embeds: [this.#makeArtistEmbed(artists, user, index)]
            });
            embedUrlMessage = await messageInteraction.followUp(currentArtist.externalUrl);
        });

        nextCollector?.on("end", collected => {
            console.log(`Collected ${collected.size} items`);
        });
 
    }

    #processTracks = async (interaction : ChatInputCommandInteraction, query : string) => {
        const data = await this.#spotifyApi.search(query, SpotifyTypes.TRACK);
        const { tracks : { items } } = data;
        console.log("tracks", items[0]);    
        
    }

    #processAlbums = async (interaction : ChatInputCommandInteraction, query : string) => {
        await interaction.deferReply();
        const data = await this.#spotifyApi.search(query, SpotifyTypes.ALBUM);
        const { albums : { items } } = data;
        console.log(items[0]);
        const albums : SpotifyAlbum[] = [];
        for (const album of items) {
            albums.push(new SpotifyAlbum(album));
        }

        if (!albums.length) {
            this.#replyToEmptyData(interaction);
            return;
        }

        /* let index : number = 0;
        const selected : SpotifyAlbum = albums[index];
        const user : User = await interaction.user.fetch();

        await interaction.editReply({
            embeds: [this.#makeAlbumEmbed(albums, user, index)],
            components: [this.#makeButtons()]
        });

        let embedUrlMessage : Message = await (await interaction.followUp(selected.externalUrl)).fetch();

        const navigationFilter = (messageInteraction : MessageComponentInteraction) => messageInteraction.customId === "nextElement" || messageInteraction.customId === "previousElement";

        const nextCollector = interaction.channel?.createMessageComponentCollector({
            filter: navigationFilter,
            time: 1000 * 60 * 2,
            max: 5
        });

        nextCollector?.on("collect", async (messageInteraction : MessageComponentInteraction) => {

            if (messageInteraction.customId === "nextElement") {
                ++index;
            } else if (messageInteraction.customId === "previousElement") {
                --index;
            }

            if (index === albums.length) {
                index = 0;
            }

            if (index === -1) {
                index = albums.length - 1;
            }

            const currentAlbum : SpotifyAlbum = albums[index];
            embedUrlMessage.delete();
            
            await messageInteraction.update({
                embeds: [this.#makeAlbumEmbed(albums, user, index)]
            });
            embedUrlMessage = await messageInteraction.followUp(currentAlbum.externalUrl);
        });

        nextCollector?.on("end", collected => {
            console.log(`Collected ${collected.size} items`);
        }); */

    }

    #processPlaylists = async (interaction : ChatInputCommandInteraction, query : string) => {
        const data = await this.#spotifyApi.search(query, SpotifyTypes.PLAYLIST);
        const { playlists : { items } } = data;
        console.log("playlists", items);
    }
    
    override execute = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        const query : string = interaction.options.getString("query")!;
        const { _group : group } : any = interaction.options;
        const { _subcommand : subcommand } : any = interaction.options;

        if (group === "search") {
            switch (subcommand) {
                case "artists":
                    this.#processArtists(interaction, query);
                    break;
                case "albums":
                    this.#processAlbums(interaction, query);
                    break;
                case "tracks":
                    this.#processTracks(interaction, query);
                    break;
                case "playlists":
                    this.#processPlaylists(interaction, query);
                    break;

            }
        }
    }


}