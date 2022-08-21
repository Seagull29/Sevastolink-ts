import { OnInteractionCreate } from "@utils/models/onInteractionCreate";
import { SelectMenuInteraction } from "discord.js";
import { setTimeout as wait } from "timers/promises";

export default class OnSelectMenuInteractionCreate extends OnInteractionCreate {

    constructor() {
        super("interactionCreate", false);
    }

    override execute = async (interaction : SelectMenuInteraction) : Promise<void> => {
        if (!interaction.isSelectMenu()) {
            return;
        }

        if (interaction.customId === "select" ) {
            await interaction.deferUpdate();
            await wait(4000);
            await interaction.editReply({ content: "Something was selected", components: []});
        }
    }
}
