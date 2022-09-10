import { Command } from "@utils/models/command";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default class ClipCommand extends Command {
    /* readonly #giphyApi : GiphyApi = new GiphyApi(
        envMap.get(Environment.GIPHY_KEY)!
    ); */
    
    constructor() {
        super(ClipCommand.#buildCommand());
    }

    static #buildCommand = () : SlashCommandBuilder => {
        const clipCommand : SlashCommandBuilder = new SlashCommandBuilder();
        clipCommand.setName("clip").setDescription("Find this new type of gif provided by Giphy");
        clipCommand.addSubcommand(subcommand => {
            subcommand.setName("search").setDescription("Search clips on Giphy");
            subcommand.addStringOption(option => {
                option.setName("query").setDescription("Topic to search on Giphy").setMaxLength(30).setRequired(true);
                return option;
            });
            return subcommand;
        });
        clipCommand.addSubcommand(subcommand => {
            subcommand.setName("trending").setDescription("Look at the current trending clips on Giphy");
            return subcommand;
        });
        return clipCommand;
    }

    /* #handleReply = async (interaction : ChatInputCommandInteraction, giphyClips : any[]) : Promise<void> => {
        if (!giphyClips.length) {
            return;
        }
        const nextInteractionId : string = nanoid();
        const previousInteractionId : string = nanoid();
        const user : User = await interaction.user.fetch();
        let clipEmbed : EmbedBuilder = new EmbedBuilder();
        let index : number = 0;
        const giphyClip = giphyClips[index];
        await interaction.editReply({
            embeds: [clipEmbed],
            components: [buildMenuButtons(previousInteractionId, nextInteractionId, ButtonStyle.Primary)]
        });
        const navigationFilter = (messageInteraction : MessageComponentInteraction) => messageInteraction.customId === previousInteractionId || messageInteraction.customId === nextInteractionId;
        const collector = interaction.channel?.createMessageComponentCollector({
            filter: navigationFilter,
            time: 1000 * 60 * 4,
            max: giphyClips.length
        });
        collector?.on("collect", async (messageInteraction : MessageComponentInteraction) => {
            if (messageInteraction.customId === nextInteractionId) {
                ++index;
            } else if (messageInteraction.customId === previousInteractionId) {
                --index;
            }
            if (index === giphyClips.length) {
                index = 0;
            }
            if (index === -1) {
                index = giphyClips.length - 1;
            }
            const newCurrentGif : GiphyClip = giphyClips[index];
            clipEmbed = new EmbedBuilder();
            await messageInteraction.update({
                embeds: [clipEmbed]
            });
        });
        collector?.on("end", collected => {
            console.log(`Collected ${collected.size} items`);
        });   
    } */

    #handleSearchSubcommand = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        await interaction.reply({
            content: ">>> ***This command is under development. Sorry.***",
            ephemeral: true
        });        
    }

    #handleTrendingSubcommand = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        await interaction.reply({
            content: ">>> ***This command is under development. Sorry.***",
            ephemeral: true
        });        
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
        }
    }
}