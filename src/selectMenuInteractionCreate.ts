import { MessageComponentInteraction } from "discord.js";
import { setTimeout as wait } from "timers/promises";

export default {
    name: "interactionCreate",
    once: false,
    async execute(interaction : MessageComponentInteraction) {
        if (!interaction.isSelectMenu()) {
            return;
        }

        if (interaction.customId === "select") {
            /* await interaction.update({ content: "Something was selected", components: []}); */
            await interaction.deferUpdate();
            await wait(4000);
            await interaction.editReply({ content: "Something was selected", components: []});
        }
    }
}