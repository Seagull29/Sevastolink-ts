import { MessageComponentInteraction } from "discord.js";

export default {
    name: "interactionCreate", 
    once: false,
    async execute(interaction : MessageComponentInteraction) {
        if (!interaction.isButton()) {
            return;
        }
    
    } 
}