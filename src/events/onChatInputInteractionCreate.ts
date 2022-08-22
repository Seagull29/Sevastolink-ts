import { Bot } from "@utils/models/botClient";
import { OnInteractionCreate } from "@utils/models/onInteractionCreate";
import { ChatInputCommandInteraction, Message } from "discord.js";

export default class OnChatInputInteractionCreate extends OnInteractionCreate {
    
    constructor() {
        super("interactionCreate", false);
    }

    override execute = async (interaction : ChatInputCommandInteraction, message : Message) : Promise<void> => {
        const client : Bot = interaction.client as Bot;
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const command = client.commands?.get(interaction.commandName);

        if (!command) {
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "There was a problem while executing this command",
                ephemeral: true
            });
        }
    }
}