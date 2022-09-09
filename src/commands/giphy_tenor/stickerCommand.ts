import { Environment, envMap } from "@config/env";
import { GiphyApi } from "@services/giphy/api/giphyApi";
import { GiphyTypes } from "@services/giphy/api/giphyTypes";
import { GiphyCategory } from "@services/giphy/models/giphyCategory";
import { GiphyGif } from "@services/giphy/models/giphyGif";
import { TenorApi } from "@services/tenor/api/tenorApi";
import { TenorTypes } from "@services/tenor/api/tenorTypes";
import { TenorCategory } from "@services/tenor/models/tenorCategory";
import { TenorGif } from "@services/tenor/models/tenorGif";
import { buildGiphyCategoryEmbed, buildGiphyEmbed } from "@utils/helpers/commands/giphy";
import { buildMenuButtons } from "@utils/helpers/commands/menuButtons";
import { buildTenorCategoryEmbed, buildTenorEmbed } from "@utils/helpers/commands/tenor";
import { Command } from "@utils/models/command";
import { ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, MessageComponentInteraction, SlashCommandBuilder, User } from "discord.js";
import { nanoid } from "nanoid";

export default class StickerCommand extends Command {
    readonly #giphyApi : GiphyApi = new GiphyApi(
        envMap.get(Environment.GIPHY_KEY)!
    );
    readonly #tenorApi : TenorApi = new TenorApi(
        envMap.get(Environment.TENOR_KEY)!,
        envMap.get(Environment.TENOR_CLIENT_KEY)!
    );

    constructor() {
        super(StickerCommand.#buildCommand());
    }

    static #buildCommand = () : SlashCommandBuilder => {
        const stickerCommand : SlashCommandBuilder = new SlashCommandBuilder();
        stickerCommand.setName("sticker").setDescription("Find the sticker you want on bot Giphy and Tenor");
        stickerCommand.addSubcommand(subcommand => {
            subcommand.setName("search").setDescription("Search stickers on both Giphy and Tenor");
            subcommand.addStringOption(option => {
                option.setName("query").setDescription("Topic to search on Giphy and Tenor").setMaxLength(30).setRequired(true);
                return option;
            });
            return subcommand;
        });
        stickerCommand.addSubcommand(subcommand => {
            subcommand.setName("trending").setDescription("Look at the current trending stickers on the web");
            return subcommand;
        });
        stickerCommand.addSubcommand(subcommand => {
            subcommand.setName("random").setDescription("Get random stickers");
            subcommand.addStringOption(option => {
                option.setName("query").setDescription("To filter the random result").setMaxLength(30).setRequired(true);
                return option;
            });
            return subcommand;
        });
        return stickerCommand;
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
            this.#giphyApi.search(query, GiphyTypes.STICKER),
            this.#tenorApi.search(query, { searchFilter: TenorTypes.STICKER })
        ]);
        const giphyStickers : GiphyGif[] = giphyData.data.map((sticker : any) => new GiphyGif(sticker));
        const tenorStickers : TenorGif[] = tenorData.results.map((sticker : any) => new TenorGif(sticker));
        this.#handleReply(interaction, [...giphyStickers, ...tenorStickers]);
    }

    #handleTrendingSubcommand = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        await interaction.deferReply();
        const [giphyData, tenorData] = await Promise.all([
            this.#giphyApi.trending(GiphyTypes.STICKER),
            this.#tenorApi.featured({ searchFilter: TenorTypes.STICKER})
        ]);
        console.log(giphyData.data[1]);
        const giphyStickers : GiphyGif[] = giphyData.data.map((sticker : any) => new GiphyGif(sticker));
        const tenorStickers : TenorGif[] = tenorData.results.map((sticker : any) => new TenorGif(sticker));
        this.#handleReply(interaction, [...giphyStickers, ...tenorStickers]);
    }

    #handleRandomSubcommand = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        await interaction.deferReply();
        const query : string = interaction.options.getString("query")!;
        const giphyData = await this.#giphyApi.random(query, GiphyTypes.STICKER);
        const { data } = giphyData;
        const sticker : GiphyGif = new GiphyGif(data);
        this.#handleReply(interaction, [sticker]);
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
        }
    }
}