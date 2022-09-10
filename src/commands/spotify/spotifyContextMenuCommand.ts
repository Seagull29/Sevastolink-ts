import { Environment, envMap } from "@config/env";
import { SpotifyApi } from "@services/spotify/api/spotifyApi";
import { SpotifyTypes } from "@services/spotify/api/spotifyTypes";
import { SpotifyAlbum } from "@services/spotify/models/spotifyAlbum";
import { SpotifyArtist } from "@services/spotify/models/spotifyArtist";
import { SpotifyTrack } from "@services/spotify/models/spotifyTrack";
import { buildAlbumEmbed, buildArtistEmbed, buildTrackEmbed } from "@utils/helpers/commands/spotifyEmbeds";
import { getLimitedWords, normalizer } from "@utils/helpers/queryNormalizer";
import { Command } from "@utils/models/command";
import { ActionRowBuilder, Activity, ApplicationCommandType, ButtonBuilder, ButtonStyle, ContextMenuCommandBuilder, EmbedBuilder, Guild, GuildMember, MessageComponentInteraction, User, UserContextMenuCommandInteraction } from "discord.js";
import { nanoid } from "nanoid";

export default class SpotifyContextMenuCommand extends Command {
    
    readonly #spotifyApi : SpotifyApi = new SpotifyApi(
        envMap.get(Environment.SPOTIFY_CLIENT_ID)!,
        envMap.get(Environment.SPOTIFY_CLIENT_SECRET)!
    );

    constructor() {
        super(new ContextMenuCommandBuilder().setName("User Spotify activity").setType(ApplicationCommandType.User));
    }

    #buildButtons = (getTrackButton : string, getAlbumButton : string, getArtistButton : string) : ActionRowBuilder<ButtonBuilder> => {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(getTrackButton).setStyle(ButtonStyle.Success).setLabel("Get track"),
            new ButtonBuilder().setCustomId(getAlbumButton).setStyle(ButtonStyle.Success).setLabel("Get track's album"),
            new ButtonBuilder().setCustomId(getArtistButton).setStyle(ButtonStyle.Success).setLabel("Get track's artist")
        );
        return row;
    }   

    #getTrack = async (message : MessageComponentInteraction, spotifyActivity : Activity) : Promise<void> => {
        const { details, state } = spotifyActivity;
        const largeText : string | null = spotifyActivity.assets!.largeText;
        const album : string = getLimitedWords(normalizer(largeText!), " ", 6);
        const track : string = getLimitedWords(normalizer(details!), " ", 7);
        const mainArtist : string = getLimitedWords(normalizer(state!), "; ", 1);
        const query : string = `${track} ${mainArtist} ${album}`;
        const spotifyData = await this.#spotifyApi.search(query.length > 100 ? query.slice(0, 100) : query, SpotifyTypes.TRACK);
        const user : User = await message.user.fetch();
        const { tracks : { items }} = spotifyData;
        if (!items.length) {
            await message.update({
                components: [],
                content: ">>> Oh! We couln't find the requested song. It might be for different reasons"
            });
            return;
        }
        const foundTrack : SpotifyTrack = new SpotifyTrack(items[0]);
        const trackEmbed : EmbedBuilder = buildTrackEmbed(foundTrack, user);
        
        await message.update({
            components: [],
            content: ">>> ***We found the song! It may not be the same that you requested***"
        });
        await message.followUp({
            embeds: [trackEmbed]
        });
        await message.followUp({
            content: `>>> ${foundTrack.externalUrl}`
        });
    }

    #getAlbum = async (message : MessageComponentInteraction, spotifyActivity : Activity) : Promise<void> => {
        const { state } = spotifyActivity;
        const largeText : string | null = spotifyActivity.assets!.largeText;
        const album : string = getLimitedWords(normalizer(largeText!), " ", 8);
        const mainArtist : string = getLimitedWords(normalizer(state!), "; ", 1);
        const spotifyData = await this.#spotifyApi.search(`${album} ${mainArtist}`, SpotifyTypes.ALBUM);
        console.log(album);
        const user : User = await message.user.fetch();
        const { albums : { items }} = spotifyData;
        if (!items.length) {
            await message.update({
                components: [],
                content: ">>> Oh! We couldn't find the requested album. It might be for different reasons"
            });
            return;
        }
        const foundAlbum : SpotifyAlbum = new SpotifyAlbum(items[0]);
        const albumEmbed : EmbedBuilder = buildAlbumEmbed(foundAlbum, user);
        
        await message.update({
            components: [],
            content: ">>> ***We found the album! It may not be the same that you requested***"
        });
        await message.followUp({
            embeds: [albumEmbed]
        });
        await message.followUp({
            content: `>>> ${foundAlbum.externalUrl}`
        });
    }

    #getArtist = async (message : MessageComponentInteraction, spotifyActivity : Activity) : Promise<void> => {
        const { state } = spotifyActivity;
        const artists : string = state!.replaceAll("; ", ",");
        const spotifyData = await this.#spotifyApi.search(artists, SpotifyTypes.ARTIST);
        const user : User = await message.user.fetch();
        const { artists : { items }} = spotifyData;
        if (!items.length) {
            await message.update({
                components: [],
                content: ">>> Oh! We couldn't find the requested artist. It might be for different reasons"
            })
            return;
        }
        const foundArtist : SpotifyArtist = new SpotifyArtist(items[0]);
        const artistEmbed : EmbedBuilder = buildArtistEmbed(foundArtist, user);
        await message.update({
            components: [],
            content: ">>> ***We found the artist! It may not be the same that you requested***"
        });
        await message.followUp({
            embeds: [artistEmbed]
        });
        await message.followUp({
            content: `>>> ${foundArtist.externalUrl}`
        });
    }

    #getOwnPlaylist = async (interaction : UserContextMenuCommandInteraction) : Promise<void> => {
        const playlistId : string = "https://open.spotify.com/playlist/5c9MvCiJztdWCdo9ubz5Y9";
        await interaction.editReply({
            components: [],
            content: ">>> ***I'm listening to my own playlist. Enjoy with me!\nI'll be so glad if you give me a heart on my playlist! 🎧🎸***"
        });
        await interaction.followUp({
            content: `>>> ${playlistId}`
        });
    }

    override execute = async (interaction : UserContextMenuCommandInteraction) : Promise<void> => {
        await interaction.deferReply({ ephemeral: true });
        const targetUserId : string  = interaction.targetUser.id;
        const guild : Guild = interaction.guild!;
        const targetMember : GuildMember = await guild.members.fetch({
            user: targetUserId,
            withPresences: true
        });
        const { presence } = targetMember;
        if (!presence) {
            await interaction.editReply({
                content: `>>> The user ***${targetMember.user.username}*** is offline, and doesn't have any activities`,
            });
            return;
        }
        if (!presence.activities.length) {
            await interaction.editReply({
                content: `>>> The user ***${targetMember.user.username}*** doesn't have any activities`,
            });
            return;
        }
        const spotifyActivity : Activity | undefined = presence.activities.find((activity : Activity) => activity.name === "Spotify");
        if (!spotifyActivity) {
            await interaction.editReply({
                content: `>>> The user ***${targetMember.user.username}*** isn't listening to any track on Spotify`,
            });
            return;
        }
        if (!spotifyActivity.details) {
            this.#getOwnPlaylist(interaction);
            return;
        }
        const trackButton : string = nanoid();
        const albumButton : string = nanoid();
        const artistButton : string = nanoid();
        await interaction.editReply({
            components: [this.#buildButtons(trackButton, albumButton, artistButton)],
        });
        const choiceFilter = (message : MessageComponentInteraction) => message.customId === trackButton || message.customId === albumButton || message.customId === artistButton;
        const collector = interaction.channel?.createMessageComponentCollector({
            filter: choiceFilter,
            time: 1000 * 60 * 1,
            max: 1
        });
        collector?.on("collect", async (messageInteraction : MessageComponentInteraction) => {
            switch (messageInteraction.customId) {
                case trackButton:
                    this.#getTrack(messageInteraction, spotifyActivity);
                    break;
                case albumButton:
                    this.#getAlbum(messageInteraction, spotifyActivity);
                    break;
                case artistButton:
                    this.#getArtist(messageInteraction, spotifyActivity);
                    break;
            }
        });
    }
}