import { SpotifyApi } from "@services/spotify/api/spotifyApi";
import { SpotifyTypes } from "@services/spotify/api/spotifyTypes";
import { SpotifyArtist } from "@services/spotify/models/spotifyArtist";
import { Command } from "@utils/models/command";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, Message, MessageComponentInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder, User } from "discord.js";
import { setTimeout as wait } from "timers/promises";
import { nanoid } from "nanoid";
import { SpotifyAlbum } from "@services/spotify/models/spotifyAlbum";
import { SpotifyTrack } from "@services/spotify/models/spotifyTrack";
import { convertMstoTime } from "@utils/helpers/convertMs";
import { SpotifyPlaylist } from "@services/spotify/models/spotifyPlaylist";
import { SpotifyObject } from "@services/spotify/models/spotifyObject";
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
            option.setName(optionName).setDescription(optionDescription).setMaxLength(30).setRequired(true);
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

    #makeTrackEmbed = (tracks : SpotifyTrack[], user : User, index : number) : EmbedBuilder => {
        const now : Date = new Date();
        const embed : EmbedBuilder = new EmbedBuilder();
        const track : SpotifyTrack = tracks[index];
        const { artists, album } = track;
        const artistTrackNames : string[] = [];
        const artistAlbumNames : string[] = [];
        for (const artist of artists) {
            artistTrackNames.push(artist.name);
        }
        for (const artist of album.artists) {
            artistAlbumNames.push(artist.name);
        }
        const allTrackArtists : string = artistTrackNames.join(", ");
        const allAlbumArtists : string = artistAlbumNames.join(", ");
        embed.setTitle(track.name).setURL(track.externalUrl).setColor(user.accentColor!);
        embed.setAuthor({
            name: "Spotify",
            iconURL: "https://developer.spotify.com/assets/branding-guidelines/icon4@2x.png",
            url: "https://open.spotify.com/"
        });
        embed.setThumbnail(album.standardImage);
        embed.setFooter({
            text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}\nResult ${index + 1} of ${tracks.length}`,
            iconURL: user.avatarURL() || ""
        });
        embed.addFields(
            { name: "Artists", value: allTrackArtists },
            { name: "Album", value: album.name, inline: true },
            { name: "Album release date", value: album.releaseDate, inline: true},
            { name: "Album type", value: album.albumType, inline: true },
            { name: "Album artists", value: allAlbumArtists },
            { name: "Disc number", value: track.discNumber.toString(), inline: true },
            { name: "Duration", value: convertMstoTime(track.durationMs), inline: true },
            { name: "Track number", value: track.trackNumber.toString(), inline: true },
            { name: "Available markets", value: `${track.availableMarkets.length} countries`, inline: true },
            { name: "Explicit", value: `${track.explicit ? "Yes" : "No"}`, inline: true },
            { name: "Popularity", value: track.popularity.toString(), inline: true }
        );
        return embed;
    }

    #makePlaylistEmbed = (playlists : SpotifyPlaylist[], user : User, index : number) : EmbedBuilder => {
        const now : Date = new Date();
        const embed : EmbedBuilder = new EmbedBuilder();
        const playlist : SpotifyPlaylist = playlists[index];
        const { owner } = playlist;
        embed.setTitle(playlist.name).setURL(playlist.externalUrl).setColor(user.accentColor!);
        embed.setAuthor({
            name: "Spotify",
            iconURL: "https://developer.spotify.com/assets/branding-guidelines/icon4@2x.png",
            url: "https://open.spotify.com/"
        });
        embed.setThumbnail(playlist.standardImage);
        embed.setFooter({
            text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}\nResult ${index + 1} of ${playlists.length}`,
            iconURL: user.avatarURL() || ""
        });
        embed.addFields(
            { name: "Description", value: playlist.description || "No description" },
            { name: "Author", value: owner.displayName, inline: true },
            { name: "Author id", value: owner.id, inline: true },
            { name: "Collaborative", value: `${playlist.collaborative ? "Yes" : "No"}`, inline: true },
            { name: "Tracks", value: playlist.tracks.toString(), inline: true },
            { name: "Type", value: playlist.type, inline: true }
        )
        return embed;
    }

    #makeReply = async (interaction : ChatInputCommandInteraction, spotifyObjects : SpotifyObject[]) : Promise<void> => {
        if (!spotifyObjects.length) {
            this.#replyToEmptyData(interaction);
            return;
        }
        const nextInteractionId : string = nanoid();
        const previousInteractionId : string = nanoid();
        let index : number = 0;
        const selected : SpotifyObject = spotifyObjects[index];
        const user : User = await interaction.user.fetch();
        let spotifyEmbed : EmbedBuilder = new EmbedBuilder();
        if (selected instanceof(SpotifyArtist)) {
            spotifyEmbed = this.#makeArtistEmbed(spotifyObjects as SpotifyArtist[], user, index);
        } else if (selected instanceof(SpotifyAlbum)) {
            spotifyEmbed = this.#makeAlbumEmbed(spotifyObjects as SpotifyAlbum[], user, index);
        } else if (selected instanceof(SpotifyTrack)) {
            spotifyEmbed = this.#makeTrackEmbed(spotifyObjects as SpotifyTrack[], user, index);
        } else if (selected instanceof(SpotifyPlaylist)) {
            spotifyEmbed = this.#makePlaylistEmbed(spotifyObjects as SpotifyPlaylist[], user, index);
        }
        await interaction.editReply({
            embeds: [spotifyEmbed],
            components: [this.#makeButtons(previousInteractionId, nextInteractionId)]
        });
        let embedUrlMessage : Message = await (await interaction.followUp(selected.externalUrl)).fetch();
        const navigationFilter = (messageInteraction : MessageComponentInteraction) => messageInteraction.customId === previousInteractionId || messageInteraction.customId === nextInteractionId;
        const collector = interaction.channel?.createMessageComponentCollector({
            filter: navigationFilter,
            time: 1000 * 60 * 4,
            max: spotifyObjects.length
        });
        collector?.on("collect", async (messageInteraction : MessageComponentInteraction) => {
            if (messageInteraction.customId === nextInteractionId) {
                ++index;
            } else if (messageInteraction.customId === previousInteractionId) {
                --index;
            }
            if (index === spotifyObjects.length) {
                index = 0;
            }
            if (index === -1) {
                index = spotifyObjects.length - 1;
            }
            const currentSpotifyObject : SpotifyObject = spotifyObjects[index];
            let newEmbed : EmbedBuilder = new EmbedBuilder();
            embedUrlMessage.delete();
            if (currentSpotifyObject instanceof(SpotifyArtist)) {
                newEmbed = this.#makeArtistEmbed(spotifyObjects as SpotifyArtist[], user, index);
            } else if (currentSpotifyObject instanceof(SpotifyAlbum)) {
                newEmbed = this.#makeAlbumEmbed(spotifyObjects as SpotifyAlbum[], user, index);
            } else if (currentSpotifyObject instanceof(SpotifyTrack)) {
                newEmbed = this.#makeTrackEmbed(spotifyObjects as SpotifyTrack[], user, index);
            } else if (currentSpotifyObject instanceof(SpotifyPlaylist)) {
                newEmbed = this.#makePlaylistEmbed(spotifyObjects as SpotifyPlaylist[], user, index);
            }
            await messageInteraction.update({
                embeds: [newEmbed]
            });
            embedUrlMessage = await messageInteraction.followUp(currentSpotifyObject.externalUrl);
        });
        collector?.on("end", collected => {
            console.log(`Collected ${collected.size} items`);
        });
    }

    #processArtists = async (interaction : ChatInputCommandInteraction, query : string) : Promise<void> => {
        await interaction.deferReply();
        const data = await this.#spotifyApi.search(query, SpotifyTypes.ARTIST);
        const { artists : { items } } = data;
        const artists : SpotifyArtist[] = [];
        for (const artist of items) {
            artists.push(new SpotifyArtist(artist));
        }
        this.#makeReply(interaction, artists);
    }

    #processTracks = async (interaction : ChatInputCommandInteraction, query : string) : Promise<void> => {
        await interaction.deferReply();
        const data = await this.#spotifyApi.search(query, SpotifyTypes.TRACK);
        const { tracks : { items } } = data;
        const tracks : SpotifyTrack[] = [];
        for (const track of items) {
            tracks.push(new SpotifyTrack(track));
        }
        this.#makeReply(interaction, tracks);
    }

    #processAlbums = async (interaction : ChatInputCommandInteraction, query : string) : Promise<void> => {
        await interaction.deferReply();
        const data = await this.#spotifyApi.search(query, SpotifyTypes.ALBUM);
        const { albums : { items } } = data;
        const albums : SpotifyAlbum[] = [];
        for (const album of items) {
            albums.push(new SpotifyAlbum(album));
        }
        this.#makeReply(interaction, albums);
    }

    #processPlaylists = async (interaction : ChatInputCommandInteraction, query : string) : Promise<void> => {
        await interaction.deferReply();
        const data = await this.#spotifyApi.search(query, SpotifyTypes.PLAYLIST);
        const { playlists : { items } } = data;
        const playlists : SpotifyPlaylist[] = [];
        for (const playlist of items) {
            playlists.push(new SpotifyPlaylist(playlist));
        }
        this.#makeReply(interaction, playlists);
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