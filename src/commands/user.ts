import { SlashCommandBuilder, CommandInteraction } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName("user").setDescription("Replies with the user info"),
    async execute (interaction : CommandInteraction) {
        await interaction.reply(`User info: ${interaction.user.tag}\n${interaction.user.username}`);
    }
}