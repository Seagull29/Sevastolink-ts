import { Command } from "@utils/models/command";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default class UserCommand extends Command {

    constructor() {
        const slashCommandBuilder : SlashCommandBuilder = new SlashCommandBuilder();
        super(
            slashCommandBuilder.setName("user").
                                setDescription("Replies with the user info")
        );
    }

    override execute = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        await interaction.reply(`User info: ${interaction.user.tag}\n${interaction.user.username}`);
    }

}