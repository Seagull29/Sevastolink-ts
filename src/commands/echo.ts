import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { setTimeout as wait } from "timers/promises";

export default {
    data: new SlashCommandBuilder()
            .setName("echo")
            .setDescription("Replies with your input")
            .addStringOption(option => option.setName("input").setDescription("The input to echo back").setRequired(true)),
    async execute(interaction : CommandInteraction) {
        const message = interaction.options.getString("input");
        await interaction.deferReply();
        await wait(2000);
        await interaction.editReply("info");
    }
}