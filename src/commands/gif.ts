import { Command } from "@utils/models/command";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { setTimeout as wait } from "timers/promises";

export default abstract class GifCommand extends Command {

    constructor() {
        super(
            new SlashCommandBuilder().
                setName("gif").
                setDescription("The gif category").
                addStringOption(option => option.setName("category").
                                                 setDescription("the gif category").
                                                 setRequired(true).
                                                 addChoices(
                                                    {
                                                        name: "Funny", 
                                                        value: "gif_funny"
                                                    }
                                                 )
                                                 
                ) as SlashCommandBuilder
        )
    }

    override execute = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        await interaction.reply("gifs");
        await wait(2000);
        await interaction.editReply("Gif updated");
    }

}