import { Bot } from "@utils/models/botClient";
import { OnInteractionCreate } from "@utils/models/onInteractionCreate";
import { UserContextMenuCommandInteraction } from "discord.js";

export default class OnContextMenuInteractionCreate extends OnInteractionCreate {

    constructor() {
        super("interactionCreate", false);
    }

    override execute = async (interaction : UserContextMenuCommandInteraction) : Promise<void> => {
        if (!interaction.isUserContextMenuCommand()) {
            return;
        }

        const client : Bot = interaction.client as Bot;

        const command = client.commands?.get(interaction.commandName);

        if (!command) {
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "There was a problem while executing this context menu command",
                ephemeral: true
            });
        }
    }
}