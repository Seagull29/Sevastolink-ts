import { GiphyApi } from "@services/giphy/api/giphyApi";
import { GiphyTypes } from "@services/giphy/api/giphyTypes";
import { GiphyCategory } from "@services/giphy/models/giphyCategory";
import { GiphyGif } from "@services/giphy/models/giphyGif";
import { TenorApi } from "@services/tenor/api/tenorApi";
import { TenorGif } from "@services/tenor/models/tenorGif";
import { Command } from "@utils/models/command";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, MessageComponentInteraction, SlashCommandBuilder, User } from "discord.js";
import dotenv from "dotenv";
import { nanoid } from "nanoid";
dotenv.config();

export default class GifCommand extends Command {

    readonly #giphyApi : GiphyApi = new GiphyApi(
        process.env.GIPHY_KEY || ""
    );
    readonly #tenorApi : TenorApi = new TenorApi(
        process.env.TENOR_KEY || "",
        process.env.TENOR_CLIENT_KEY || ""
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

    #buildGiphyGifEmbed = (gif : GiphyGif, user : User, index : number, long : number) : EmbedBuilder => {
        const now : Date = new Date();
        const embed : EmbedBuilder = new EmbedBuilder();
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
            text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}\nResult ${index + 1} of ${long}`,
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

    #buildGiphyCategoryEmbed = (category : GiphyCategory, user : User, index : number, long : number) : EmbedBuilder => {
        const now : Date = new Date();
        const embed : EmbedBuilder = new EmbedBuilder();
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
            text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}\nResult ${index + 1} of ${long}`,
            iconURL: user.avatarURL() || ""
        });
        embed.addFields(
            { name: "Subcategories", value: `${subcategories.join(", ")}`}
        );
        return embed;
    }

    #buildTenorGifEmbed = (tenorGif : TenorGif, user : User, index : number, long : number) : EmbedBuilder => {
        const now : Date = new Date();
        const embed : EmbedBuilder = new EmbedBuilder();
        const { tags } = tenorGif;
        embed.setTitle(tenorGif.title || tenorGif.contentDescription).setThumbnail("https://tenor.com/assets/img/tenor-app-icon.png").setColor(user.accentColor!).setImage(tenorGif.gifUrl).setURL(tenorGif.url);
        embed.setFooter({
            text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}\nResult ${index + 1} of ${long}`,
            iconURL: user.avatarURL() || ""
        });
        embed.addFields(
            { name: "Tags", value: tags.slice(0, Math.floor(tags.length / 2)).join(", ") },
            { name: "Create date", value: new Date(tenorGif.created).toDateString(), inline: true },   
        );
        return embed;
    }

    #handleReply = async (interaction : ChatInputCommandInteraction, gifObjects : (GiphyGif | TenorGif | GiphyCategory)[]) : Promise<void> => {
        if (!gifObjects.length) {
            return;
        }
        const nextInteractionId : string = nanoid();
        const previousInteractionId : string = nanoid();
        const user : User = await interaction.user.fetch();
        let index : number = 0;
        let gifEmbed : EmbedBuilder = new EmbedBuilder();
        let gifObject : GiphyGif | TenorGif | GiphyCategory = gifObjects[index];
        if (gifObject instanceof(GiphyGif)) {
            gifEmbed = this.#buildGiphyGifEmbed(gifObject , user, index, gifObjects.length);
        } else if (gifObject instanceof(GiphyCategory)) {
            gifEmbed = this.#buildGiphyCategoryEmbed(gifObject, user, index, gifObjects.length);
        } else if (gifObject instanceof(TenorGif)) {
            gifEmbed = this.#buildTenorGifEmbed(gifObject, user, index, gifObjects.length);
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
            let newCurrentGif : GiphyGif | TenorGif | GiphyCategory = gifObjects[index];
            if (newCurrentGif instanceof(GiphyGif)) {
                gifEmbed = this.#buildGiphyGifEmbed(newCurrentGif, user, index, gifObjects.length);
            } else if (newCurrentGif instanceof(GiphyCategory)) {
                gifEmbed = this.#buildGiphyCategoryEmbed(newCurrentGif, user, index, gifObjects.length);
            } else if (newCurrentGif instanceof(TenorGif)) {
                gifEmbed = this.#buildTenorGifEmbed(newCurrentGif, user, index, gifObjects.length);
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
        const gifs = Promise.all([
            this.#giphyApi.search(query, GiphyTypes.GIF),
            this.#tenorApi.search(query)
        ]);
        const [giphyData, tenorData] = await gifs;
        const giphyGifs : GiphyGif[] = giphyData.data.map((gif : any) => new GiphyGif(gif));
        const tenorGifs : TenorGif[] = tenorData.results.map((gif : any) => new TenorGif(gif));
        /* const giphyData = await this.#giphyApi.search(query, GiphyTypes.GIF);
        const { data } = giphyData;
        const giphyGifs : GiphyGif[] = [];
        for (const gif of data) {
            giphyGifs.push(new GiphyGif(gif));
        } */
        //this.#handleReply(interaction, giphyGifs);
        /* const tenorData = await this.#tenorApi.search(query);
        const { results } = tenorData;
        const tenorGifs : TenorGif[] = [];
        for (const gif of results) {
            tenorGifs.push(new TenorGif(gif));
        } */
        this.#handleReply(interaction, [...giphyGifs, ...tenorGifs]);
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