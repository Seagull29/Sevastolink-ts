import { SlashCommandBuilder, CommandInteraction } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName("server").setDescription("Replies with the server info"),
    async execute(interaction : CommandInteraction) {
        await interaction.reply(`Server info: ${interaction.guild?.name}\n${interaction.guild?.createdAt}`)
    }
} 
