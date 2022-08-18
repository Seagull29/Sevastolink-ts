import { ChatInputCommandInteraction } from "discord.js";
import { ClientBot } from "index";
export default {
    name: "interactionCreate", 
    once: false,
    async execute(interaction : ChatInputCommandInteraction) {
        const { client } : { client : ClientBot } = interaction;
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