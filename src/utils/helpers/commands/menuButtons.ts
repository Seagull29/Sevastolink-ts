import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export const buildMenuButtons = (previousId : string, nextId : string, style : ButtonStyle) : ActionRowBuilder<ButtonBuilder> => {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(previousId).setStyle(style).setEmoji("⏮️").setLabel("Previous"),
        new ButtonBuilder().setCustomId(nextId).setStyle(style).setLabel("Next").setEmoji("⏭️")
    );
    return row;
}