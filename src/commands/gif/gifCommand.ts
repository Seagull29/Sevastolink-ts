import { GiphyApi } from "@services/giphy/api/giphyApi";
import { GiphyTypes } from "@services/giphy/api/giphyTypes";
import { GiphyGif } from "@services/giphy/models/giphyGif";
import { Command } from "@utils/models/command";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, Message, MessageComponentInteraction, SlashCommandBuilder, User } from "discord.js";
import dotenv from "dotenv";
import { nanoid } from "nanoid";
dotenv.config();

export default class GifCommand extends Command {

    readonly #giphyApi : GiphyApi = new GiphyApi(
        process.env.GIPHY_KEY || ""
    );
    
    constructor() {
        super(GifCommand.#buildCommand())
    }

    static #buildCommand = () : SlashCommandBuilder => {
        const gifCommand : SlashCommandBuilder = new SlashCommandBuilder();
        gifCommand.setName("gif").setDescription("Find the sticker you want on both Giphy and Tenor");
        gifCommand.addSubcommand(subcommand => {
            subcommand.setName("search").setDescription("Search gifs on both Giphy and Tenor");
            subcommand.addStringOption(option => {
                option.setName("query").setDescription("Topic to search on Giphy and Tenor").setMaxLength(30).setRequired(true);
                return option;
            });
            return subcommand;
        });
        return gifCommand;
    }

    #buildButtons = (previousId : string, nextId : string) : ActionRowBuilder<ButtonBuilder> => {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(previousId).setStyle(ButtonStyle.Primary).setEmoji("⏮️").setLabel("Previous"),
            new ButtonBuilder().setCustomId(nextId).setStyle(ButtonStyle.Primary).setLabel("Next").setEmoji("⏭️")
        );
        return row;
    }

    #buildEmbed = (gifObjects : GiphyGif[], user : User, index : number) : EmbedBuilder => {
        const now : Date = new Date();
        const embed : EmbedBuilder = new EmbedBuilder();
        const gif : GiphyGif = gifObjects[index];
        const { user : gifUser } = gif;
        embed.setTitle(gif.title).setURL(gif.url).setColor(user.accentColor!).setThumbnail("https://ucb4d3b291391bc060502d507126.previews.dropboxusercontent.com/p/thumb/ABrUuqzrpxL9vjYypa4h1DcfopG2bFr4P-vjxM8iBuNDTraP4C6L7oVICujSj_sac38Igxchn3xGmYSHMCdGbY8tn2_LPnCLewUiil7mMrwLiY0ISGu7B-plxtw5d_ZHZqQ1SreqXC8z_fQudIXxK7mC5d_MmANYR4nA00YwU8yYl2ZxCRuDg4djNwq66XUAjo0Vk8IC_UeISkduC2qEI5M-0qWwGXFjI4D1QK98tb756nX6yt4G6sDq50gGymiWKCUBsq_kjj1DMkgzbKBodxnQgQR3qz8-6dHqiQOFN_jRSEmi2EAzlauqxYMQ4uYjoQCQUraUoAVf2GHU1tLqVmMbYAE9vBXUnWzq0pUHSCDWRnIMYuBiye9H_c7HbRawCHI/p.png").setImage(gif.originalImage);
        embed.setAuthor({
            name: gifUser.displayName || gifUser.username,
            url: gifUser.profileUrl,
            iconURL: gifUser.avatarUrl
        });
        embed.setFooter({
            text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}\nResult ${index + 1} of ${gifObjects.length}`,
            iconURL: user.avatarURL() || ""
        });
        embed.addFields(
            { name: "Source", value: gif.source },
            { name: "Rating", value: gif.rating, inline: true },
            { name: "Creation date", value: gif.importDatetime, inline: true },
            { name: "Trending date", value: gif.trendingDatetime, inline: true }
        )

        return embed;
    }

    #handleReply = async (interaction : ChatInputCommandInteraction, gifObjects : GiphyGif[]) : Promise<void> => {
        if (!gifObjects.length) {
            return;
        }
        const nextInteractionId : string = nanoid();
        const previousInteractionId : string = nanoid();
        let index : number = 0;
        const selected : GiphyGif = gifObjects[index];
        const user : User = await interaction.user.fetch();
        let spotifyEmbed : EmbedBuilder = new EmbedBuilder();
        spotifyEmbed = this.#buildEmbed(gifObjects, user, index);
        /* if (selected instanceof(SpotifyArtist)) {
            spotifyEmbed = this.#makeArtistEmbed(spotifyObjects as SpotifyArtist[], user, index);
        } else if (selected instanceof(SpotifyAlbum)) {
            spotifyEmbed = this.#makeAlbumEmbed(spotifyObjects as SpotifyAlbum[], user, index);
        } */
        await interaction.editReply({
            embeds: [spotifyEmbed],
            components: [this.#buildButtons(previousInteractionId, nextInteractionId)]
        });
        const navigationFilter = (messageInteraction : MessageComponentInteraction) => messageInteraction.customId === previousInteractionId || messageInteraction.customId === nextInteractionId;
        const collector = interaction.channel?.createMessageComponentCollector({
            filter: navigationFilter,
            time: 1000 * 60 * 4,
            max: gifObjects.length
        });
        collector?.on("collect", async (messageInteraction : MessageComponentInteraction) => {
            if (messageInteraction.customId === nextInteractionId) {
                ++index;
            } else if (messageInteraction.customId === previousInteractionId) {
                --index;
            }
            if (index === gifObjects.length) {
                index = 0;
            }
            if (index === -1) {
                index = gifObjects.length - 1;
            }
            const currentGif : GiphyGif = gifObjects[index];
            let newEmbed : EmbedBuilder = new EmbedBuilder();
            newEmbed = this.#buildEmbed(gifObjects, user, index);
            /* if (currentSpotifyObject instanceof(SpotifyArtist)) {
                newEmbed = this.#makeArtistEmbed(spotifyObjects as SpotifyArtist[], user, index);
            } else if (currentSpotifyObject instanceof(SpotifyAlbum)) {
                newEmbed = this.#makeAlbumEmbed(spotifyObjects as SpotifyAlbum[], user, index);
            } */
            await messageInteraction.update({
                embeds: [newEmbed]
            });
        });
        collector?.on("end", collected => {
            console.log(`Collected ${collected.size} items`);
        });
    }

    #handleSearchSubcommand = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        await interaction.deferReply();
        const query : string = interaction.options.getString("query")!;
        const giphyData = await this.#giphyApi.search(query, GiphyTypes.GIF);
        const { data } = giphyData;
        const giphyGifs : GiphyGif[] = [];
        for (const gif of data) {
            giphyGifs.push(new GiphyGif(gif));
        }
        console.log(data[0]);
        this.#handleReply(interaction, giphyGifs);
    }

    override execute = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        const { _subcommand : subcommand } : any = interaction.options;
        switch (subcommand) {
            case "search":
                this.#handleSearchSubcommand(interaction);
                break;
        }
        console.log(interaction.options);
        //const gifs = await this.#giphyApi.search(query, GiphyTypes.GIF);
    }

}