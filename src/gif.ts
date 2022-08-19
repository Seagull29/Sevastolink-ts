import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { setTimeout as wait } from "timers/promises";
export default {
    data: new SlashCommandBuilder()
                .setName("gif")
                .setDescription("The gif category")
                .addStringOption(option => option.setName("category").setDescription("The gif category").setRequired(true).addChoices(
                    { name: "Funny", value: "gif_funny" }
                )),
    async execute(interaction : CommandInteraction) {

        await interaction.reply("gifs");
        await wait(2000);
        await interaction.editReply("Gif updated");        
    }
}