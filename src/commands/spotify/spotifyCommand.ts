import { SpotifyApi } from "@services/spotify/api/spotifyApi";
import { SpotifyTypes } from "@services/spotify/api/spotifyTypes";
import { SpotifyArtist } from "@services/spotify/models/spotifyArtist";
import { Command } from "@utils/models/command";
import { ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, Message, MessageComponentInteraction, SlashCommandBuilder, User } from "discord.js";
import { setTimeout as wait } from "timers/promises";
import { nanoid } from "nanoid";
import { SpotifyAlbum } from "@services/spotify/models/spotifyAlbum";
import { SpotifyTrack } from "@services/spotify/models/spotifyTrack";
import { SpotifyPlaylist } from "@services/spotify/models/spotifyPlaylist";
import { SpotifyObject } from "@services/spotify/models/spotifyObject";
import { Environment, envMap } from "@config/env";
import { buildMenuButtons } from "@utils/helpers/commands/menuButtons";
import { buildAlbumEmbed, buildArtistEmbed, buildPlaylistEmbed, buildTrackEmbed } from "@utils/helpers/commands/spotifyEmbeds";

export default class SpotifyCommand extends Command {

    readonly #spotifyApi : SpotifyApi = new SpotifyApi(
        envMap.get(Environment.SPOTIFY_CLIENT_ID)!,
        envMap.get(Environment.SPOTIFY_CLIENT_SECRET)!     
    );

    constructor() {
        super(SpotifyCommand.#buildCommand());
    }

    static #buildCommand = () : SlashCommandBuilder => {
        const spotifyCommand : SlashCommandBuilder = new SlashCommandBuilder();
        spotifyCommand.setName("spotify").setDescription("Find whatever you want on Spotify catalog");
        spotifyCommand.addSubcommand(subcommand => {
            subcommand.setName("search").setDescription("Search artists, tracks, albums, and more on Spotify");
            subcommand.addStringOption(option => {
                option.setName("query").setDescription("Your query to search on Spotify").setRequired(true).setMaxLength(50);
                return option;
            });
            subcommand.addStringOption(option => {
                option.setName("type").setDescription("It can be track, album, artist or playlist").setRequired(true).addChoices(
                    { name: "Tracks", value: SpotifyTypes.TRACK },
                    { name: "Albums", value: SpotifyTypes.ALBUM },
                    { name: "Artists", value: SpotifyTypes.ARTIST },
                    { name: "Playlists", value: SpotifyTypes.PLAYLIST }
                );
                return option;
            });
            return subcommand;
        });
        return spotifyCommand;
    }

    #replyToEmptyData = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        await interaction.editReply({
            content: ">>> There are not results to show.\nProbably a bad search query was written.",
        });
        await wait(2000);
        await interaction.deleteReply();
    }

    #handleReply = async (interaction : ChatInputCommandInteraction, spotifyObjects : SpotifyObject[]) : Promise<void> => {
        if (!spotifyObjects.length) {
            this.#replyToEmptyData(interaction);
            return;
        }
        const nextInteractionId : string = nanoid();
        const previousInteractionId : string = nanoid();
        const user : User = await interaction.user.fetch();
        let index : number = 0;
        let currentSpotifyObject : SpotifyObject = spotifyObjects[index];
        let spotifyEmbed : EmbedBuilder = new EmbedBuilder();
        if (currentSpotifyObject instanceof(SpotifyArtist)) {
            spotifyEmbed = buildArtistEmbed(currentSpotifyObject as SpotifyArtist, user, index, spotifyObjects.length);
        } else if (currentSpotifyObject instanceof(SpotifyAlbum)) {
            spotifyEmbed = buildAlbumEmbed(currentSpotifyObject as SpotifyAlbum, user, index, length);
        } else if (currentSpotifyObject instanceof(SpotifyTrack)) {
            spotifyEmbed = buildTrackEmbed(currentSpotifyObject as SpotifyTrack, user, index, spotifyObjects.length);
        } else if (currentSpotifyObject instanceof(SpotifyPlaylist)) {
            spotifyEmbed = buildPlaylistEmbed(currentSpotifyObject as SpotifyPlaylist, user, index, spotifyObjects.length);
        }
        await interaction.editReply({
            embeds: [spotifyEmbed],
            components: [buildMenuButtons(previousInteractionId, nextInteractionId, ButtonStyle.Success)]
        });
        let embedUrlMessage : Message = await (await interaction.followUp(`>>> ${currentSpotifyObject.externalUrl}`)).fetch();
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
            currentSpotifyObject = spotifyObjects[index];
            embedUrlMessage.delete();
            if (currentSpotifyObject instanceof(SpotifyArtist)) {
                spotifyEmbed = buildArtistEmbed(currentSpotifyObject as SpotifyArtist, user, index, spotifyObjects.length);
            } else if (currentSpotifyObject instanceof(SpotifyAlbum)) {
                spotifyEmbed = buildAlbumEmbed(currentSpotifyObject as SpotifyAlbum, user, index, spotifyObjects.length);
            } else if (currentSpotifyObject instanceof(SpotifyTrack)) {
                spotifyEmbed = buildTrackEmbed(currentSpotifyObject as SpotifyTrack, user, index, spotifyObjects.length);
            } else if (currentSpotifyObject instanceof(SpotifyPlaylist)) {
                spotifyEmbed = buildPlaylistEmbed(currentSpotifyObject as SpotifyPlaylist, user, index, spotifyObjects.length);
            }
            await messageInteraction.update({
                embeds: [spotifyEmbed]
            });
            embedUrlMessage = await messageInteraction.followUp(`>>> ${currentSpotifyObject.externalUrl}`);
        });
        collector?.on("end", collected => {
            console.log(`Collected ${collected.size} items`);
        });
    }

    #handleSearchArtistsSubcommand = async (interaction : ChatInputCommandInteraction, query : string) : Promise<void> => {
        await interaction.deferReply();
        const data = await this.#spotifyApi.search(query, SpotifyTypes.ARTIST);
        const { artists : { items } } = data;
        const artists : SpotifyArtist[] = [];
        for (const artist of items) {
            artists.push(new SpotifyArtist(artist));
        }
        this.#handleReply(interaction, artists);
    }

    #handleSearchTracksSubcommand = async (interaction : ChatInputCommandInteraction, query : string) : Promise<void> => {
        await interaction.deferReply();
        const data = await this.#spotifyApi.search(query, SpotifyTypes.TRACK);
        const { tracks : { items } } = data;
        const tracks : SpotifyTrack[] = [];
        for (const track of items) {
            tracks.push(new SpotifyTrack(track));
        }
        this.#handleReply(interaction, tracks);
    }

    #handleSearchAlbumsSubcommand = async (interaction : ChatInputCommandInteraction, query : string) : Promise<void> => {
        await interaction.deferReply();
        const data = await this.#spotifyApi.search(query, SpotifyTypes.ALBUM);
        const { albums : { items } } = data;
        const albums : SpotifyAlbum[] = [];
        for (const album of items) {
            albums.push(new SpotifyAlbum(album));
        }
        this.#handleReply(interaction, albums);
    }

    #handleSearchPlaylistsSubcommand = async (interaction : ChatInputCommandInteraction, query : string) : Promise<void> => {
        await interaction.deferReply();
        const data = await this.#spotifyApi.search(query, SpotifyTypes.PLAYLIST);
        const { playlists : { items } } = data;
        const playlists : SpotifyPlaylist[] = [];
        for (const playlist of items) {
            playlists.push(new SpotifyPlaylist(playlist));
        }
        this.#handleReply(interaction, playlists);
    }
    
    override execute = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        const subcommand : string = interaction.options.getSubcommand();       
        if (subcommand === "search") {
            const query : string = interaction.options.getString("query")!;
            const type : string = interaction.options.getString("type")!;
            switch (type) {
                case SpotifyTypes.ARTIST:
                    this.#handleSearchArtistsSubcommand(interaction, query);
                    break;
                case SpotifyTypes.ALBUM:
                    this.#handleSearchAlbumsSubcommand(interaction, query);
                    break;
                case SpotifyTypes.TRACK:
                    this.#handleSearchTracksSubcommand(interaction, query);
                    break;
                case SpotifyTypes.PLAYLIST:
                    this.#handleSearchPlaylistsSubcommand(interaction, query);
                    break;
            }       
        }
    }
}