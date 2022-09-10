import { GiphyApi } from "@services/giphy/api/giphyApi";
import { GiphyTypes } from "@services/giphy/api/giphyTypes";
import { GiphyCategory } from "@services/giphy/models/giphyCategory";
import { GiphyGif } from "@services/giphy/models/giphyGif";
import { TenorApi } from "@services/tenor/api/tenorApi";
import { TenorCategory } from "@services/tenor/models/tenorCategory";
import { TenorGif } from "@services/tenor/models/tenorGif";
import { Command } from "@utils/models/command";
import { ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, MessageComponentInteraction, SlashCommandBuilder, User } from "discord.js";
import { nanoid } from "nanoid";
import { Environment, envMap } from "@config/env";
import { buildGiphyCategoryEmbed, buildGiphyEmbed } from "@utils/helpers/commands/giphyEmbeds";
import { buildTenorCategoryEmbed, buildTenorEmbed } from "@utils/helpers/commands/tenorEmbeds";
import { buildMenuButtons } from "@utils/helpers/commands/menuButtons";

export default class GifCommand extends Command {

    readonly #giphyApi : GiphyApi = new GiphyApi(
        envMap.get(Environment.GIPHY_KEY)!
    );
    readonly #tenorApi : TenorApi = new TenorApi(
        envMap.get(Environment.TENOR_KEY)!,
        envMap.get(Environment.TENOR_CLIENT_KEY)!
    );
    
    constructor() {
        super(GifCommand.#buildCommand());
    }

    static #buildCommand = () : SlashCommandBuilder => {
        const gifCommand : SlashCommandBuilder = new SlashCommandBuilder();
        gifCommand.setName("gif").setDescription("Find the gif you want on both Giphy and Tenor");
        gifCommand.addSubcommand(subcommand => {
            subcommand.setName("search").setDescription("Search gifs on both Giphy and Tenor");
            subcommand.addStringOption(option => {
                option.setName("query").setDescription("Topic to search on Giphy and Tenor").setMaxLength(30).setRequired(true);
                return option;
            });
            return subcommand;
        });
        gifCommand.addSubcommand(subcommand => {
            subcommand.setName("trending").setDescription("Look at the current trending gifs on the web");
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

    #handleReply = async (interaction : ChatInputCommandInteraction, gifObjects : (GiphyGif | TenorGif | GiphyCategory | TenorCategory)[]) : Promise<void> => {
        if (!gifObjects.length) {
            return;
        }
        const nextInteractionId : string = nanoid();
        const previousInteractionId : string = nanoid();
        const user : User = await interaction.user.fetch();
        let index : number = 0;
        let gifEmbed : EmbedBuilder = new EmbedBuilder();
        let gifObject : GiphyGif | TenorGif | GiphyCategory | TenorCategory = gifObjects[index];
        if (gifObject instanceof(GiphyGif)) {
            gifEmbed = buildGiphyEmbed(gifObject , user, index, gifObjects.length);
        } else if (gifObject instanceof(GiphyCategory)) {
            gifEmbed = buildGiphyCategoryEmbed(gifObject, user, index, gifObjects.length);
        } else if (gifObject instanceof(TenorGif)) {
            gifEmbed = buildTenorEmbed(gifObject, user, index, gifObjects.length);
        } else if (gifObject instanceof(TenorCategory)) {
            gifEmbed = buildTenorCategoryEmbed(gifObject, user, index, gifObjects.length);
        }
        await interaction.editReply({
            embeds: [gifEmbed],
            components: [buildMenuButtons(previousInteractionId, nextInteractionId, ButtonStyle.Primary)]
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
            let newCurrentGif : GiphyGif | TenorGif | GiphyCategory | TenorCategory = gifObjects[index];
            if (newCurrentGif instanceof(GiphyGif)) {
                gifEmbed = buildGiphyEmbed(newCurrentGif, user, index, gifObjects.length);
            } else if (newCurrentGif instanceof(GiphyCategory)) {
                gifEmbed = buildGiphyCategoryEmbed(newCurrentGif, user, index, gifObjects.length);
            } else if (newCurrentGif instanceof(TenorGif)) {
                gifEmbed = buildTenorEmbed(newCurrentGif, user, index, gifObjects.length);
            } else if (newCurrentGif instanceof(TenorCategory)) {
                gifEmbed = buildTenorCategoryEmbed(newCurrentGif, user, index, gifObjects.length);
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
        const [giphyData, tenorData] = await Promise.all([
            this.#giphyApi.search(query, GiphyTypes.GIF),
            this.#tenorApi.search(query)
        ]);
        const giphyGifs : GiphyGif[] = giphyData.data.map((gif : any) => new GiphyGif(gif));
        const tenorGifs : TenorGif[] = tenorData.results.map((gif : any) => new TenorGif(gif));
        this.#handleReply(interaction, [...giphyGifs, ...tenorGifs]);
    }

    #handleTrendingSubcommand = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        await interaction.deferReply();
        const [giphyData, tenorData] = await Promise.all([
            this.#giphyApi.trending(GiphyTypes.GIF),
            this.#tenorApi.featured()
        ]);
        const giphyGifs : GiphyGif[] = giphyData.data.map((gif : any) => new GiphyGif(gif));
        const tenorGifs : TenorGif[] = tenorData.results.map((gif : any) => new TenorGif(gif));
        this.#handleReply(interaction, [...giphyGifs, ...tenorGifs]); 
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
        const [giphyData, tenorData] = await Promise.all([
            this.#giphyApi.categories(),
            this.#tenorApi.categories()
        ]);
        const giphyCategories : GiphyCategory[] = giphyData.data.map((category : any) => new GiphyCategory(category));
        const tenorCategories : TenorCategory[] = tenorData.tags.map((category : any) => new TenorCategory(category));
        this.#handleReply(interaction, [...giphyCategories, ...tenorCategories]);
    }

    override execute = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        const subcommand : string = interaction.options.getSubcommand();
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
    }
}