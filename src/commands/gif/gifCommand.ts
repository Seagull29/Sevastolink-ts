import { GiphyApi } from "@services/giphy/api/giphyApi";
import { GiphyTypes } from "@services/giphy/api/giphyTypes";
import { GiphyCategory } from "@services/giphy/models/giphyCategory";
import { GiphyGif } from "@services/giphy/models/giphyGif";
import { Command } from "@utils/models/command";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, MessageComponentInteraction, SlashCommandBuilder, User } from "discord.js";
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
        gifCommand.addSubcommand(subcommand => {
            subcommand.setName("trending").setDescription("Look at the current trending gifs");
            return subcommand;
        });
        gifCommand.addSubcommand(subcommand => {
            subcommand.setName("random").setDescription("Get random gifs");
            subcommand.addStringOption(option => {
                option.setName("query").setDescription("To filter the random result").setMaxLength(30).setRequired(true);
                return option;
            });
            return subcommand;
        });
        gifCommand.addSubcommand(subcommand => {
            subcommand.setName("categories").setDescription("Get all gif categories");
            return subcommand;
        })
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
        const trendingDate : string = new Date(gif.trendingDatetime).toDateString();
        embed.setTitle(gif.title).setURL(gif.url).setColor(user.accentColor!).setThumbnail("https://ucb4d3b291391bc060502d507126.previews.dropboxusercontent.com/p/thumb/ABrUuqzrpxL9vjYypa4h1DcfopG2bFr4P-vjxM8iBuNDTraP4C6L7oVICujSj_sac38Igxchn3xGmYSHMCdGbY8tn2_LPnCLewUiil7mMrwLiY0ISGu7B-plxtw5d_ZHZqQ1SreqXC8z_fQudIXxK7mC5d_MmANYR4nA00YwU8yYl2ZxCRuDg4djNwq66XUAjo0Vk8IC_UeISkduC2qEI5M-0qWwGXFjI4D1QK98tb756nX6yt4G6sDq50gGymiWKCUBsq_kjj1DMkgzbKBodxnQgQR3qz8-6dHqiQOFN_jRSEmi2EAzlauqxYMQ4uYjoQCQUraUoAVf2GHU1tLqVmMbYAE9vBXUnWzq0pUHSCDWRnIMYuBiye9H_c7HbRawCHI/p.png").setImage(gif.originalImage);
        if (gifUser) {
            embed.setAuthor({
                name: gifUser.displayName || gifUser.username,
                url: gifUser.profileUrl,
                iconURL: gifUser.avatarUrl
            });
            
        }
        embed.setFooter({
            text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}\nResult ${index + 1} of ${gifObjects.length}`,
            iconURL: user.avatarURL() || ""
        });
        embed.addFields(
            { name: "Source", value: gif.source || "It seems there's not a source" },
            { name: "Rating", value: gif.rating, inline: true },
            { name: "Creation date", value: new Date(gif.importDatetime).toDateString(), inline: true },
            { name: "Trending date", value: trendingDate === "Invalid Date" ? "It never was a trending" : trendingDate, inline: true }
        );
        
        return embed;
    }

    #buildCategoryEmbed = (categories : GiphyCategory[], user : User, index : number) : EmbedBuilder => {
        const now : Date = new Date();
        const embed : EmbedBuilder = new EmbedBuilder();
        const category : GiphyCategory = categories[index];
        const { gif } = category;
        const { subcategories : categorySubcategories } = category;
        const subcategories : string[] = [];
        for (let subcategory = 0; subcategory < 25; ++subcategory) {
            if (categorySubcategories[subcategory]) {
                subcategories.push(categorySubcategories[subcategory].name);
            }
        }
        embed.setTitle(`Category: ${category.name}`).setThumbnail("https://ucb4d3b291391bc060502d507126.previews.dropboxusercontent.com/p/thumb/ABrUuqzrpxL9vjYypa4h1DcfopG2bFr4P-vjxM8iBuNDTraP4C6L7oVICujSj_sac38Igxchn3xGmYSHMCdGbY8tn2_LPnCLewUiil7mMrwLiY0ISGu7B-plxtw5d_ZHZqQ1SreqXC8z_fQudIXxK7mC5d_MmANYR4nA00YwU8yYl2ZxCRuDg4djNwq66XUAjo0Vk8IC_UeISkduC2qEI5M-0qWwGXFjI4D1QK98tb756nX6yt4G6sDq50gGymiWKCUBsq_kjj1DMkgzbKBodxnQgQR3qz8-6dHqiQOFN_jRSEmi2EAzlauqxYMQ4uYjoQCQUraUoAVf2GHU1tLqVmMbYAE9vBXUnWzq0pUHSCDWRnIMYuBiye9H_c7HbRawCHI/p.png").setImage(gif.originalImage).setColor(user.accentColor!);
        if (gif.user) {
            embed.setAuthor({
                name: gif.user.displayName || gif.user.username,
                url: gif.user.profileUrl,
                iconURL: gif.user.avatarUrl
            });
        }
        embed.setFooter({
            text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}\nResult ${index + 1} of ${categories.length}`,
            iconURL: user.avatarURL() || ""
        });
        embed.addFields(
            { name: "Subcategories", value: `${subcategories.join(", ")}`}
        );
        return embed;
    }

    #handleReply = async (interaction : ChatInputCommandInteraction, gifObjects : GiphyGif[] | GiphyCategory[]) : Promise<void> => {
        if (!gifObjects.length) {
            return;
        }
        const nextInteractionId : string = nanoid();
        const previousInteractionId : string = nanoid();
        const user : User = await interaction.user.fetch();
        let index : number = 0;
        let gifEmbed : EmbedBuilder = new EmbedBuilder();
        if (gifObjects[0] instanceof(GiphyGif)) {
            gifEmbed = this.#buildEmbed(gifObjects as GiphyGif[], user, index);
        } else if (gifObjects[0] instanceof(GiphyCategory)) {
            gifEmbed = this.#buildCategoryEmbed(gifObjects as GiphyCategory[], user, index);
        }
        await interaction.editReply({
            embeds: [gifEmbed],
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
            if (gifObjects[0] instanceof(GiphyGif)) {
                gifEmbed = this.#buildEmbed(gifObjects as GiphyGif[], user, index);
            } else if (gifObjects[0] instanceof(GiphyCategory)) {
                gifEmbed = this.#buildCategoryEmbed(gifObjects as GiphyCategory[], user, index);
            }
            await messageInteraction.update({
                embeds: [gifEmbed]
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
        this.#handleReply(interaction, giphyGifs);
    }

    #handleTrendingSubcommand = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        await interaction.deferReply();
        const giphyData = await this.#giphyApi.trending(GiphyTypes.GIF);
        const { data } = giphyData;
        const giphyGifs : GiphyGif[] = [];
        for (const gif of data) {
            giphyGifs.push(new GiphyGif(gif));
        }
        this.#handleReply(interaction, giphyGifs);
    }

    #handleRandomSubcommand = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        await interaction.deferReply();
        const query : string = interaction.options.getString("query")!;
        const giphyData = await this.#giphyApi.random(query, GiphyTypes.GIF);
        const { data } = giphyData;
        const gif : GiphyGif = new GiphyGif(data);
        this.#handleReply(interaction, [gif]);
    }

    #handleCategoriesSubcommand = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        await interaction.deferReply();
        const giphyData = await this.#giphyApi.categories();
        const { data } = giphyData;
        const categories : GiphyCategory[] = [];
        for (const category of data) {
            categories.push(new GiphyCategory(category));
        }
        this.#handleReply(interaction, categories);
    }

    override execute = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        const { _subcommand : subcommand } : any = interaction.options;
        switch (subcommand) {
            case "search":
                this.#handleSearchSubcommand(interaction);
                break;
            case "trending":
                this.#handleTrendingSubcommand(interaction);
                break;
            case "random":
                this.#handleRandomSubcommand(interaction);
                break;
            case "categories":
                this.#handleCategoriesSubcommand(interaction);
                break;
        }
        //const gifs = await this.#giphyApi.search(query, GiphyTypes.GIF);
    }

}