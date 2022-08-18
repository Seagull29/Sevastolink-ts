import { ActionRowBuilder, ButtonStyle, ButtonBuilder, ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder().setName("ping").setDescription("reply with pong"),
    async execute(interaction : ChatInputCommandInteraction) {
        /* await interaction.deleteReply(); */
        /* const message = await interaction.fetchReply(); */
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId("primary").setLabel("Primary").setStyle(ButtonStyle.Primary)
        );
        const embed = new EmbedBuilder().setColor(0x0099FF).setTitle("Some title").setURL("https://discord.js.org").setDescription("Some description");
        await interaction.reply({
            content: "pong",
            embeds: [embed],
            components: [row]
        })
    }
}