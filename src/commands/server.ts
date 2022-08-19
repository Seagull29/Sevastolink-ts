import { SlashCommandBuilder, CommandInteraction } from "discord.js";


export default class ServerCommand {

    #slashCommand : SlashCommandBuilder = new SlashCommandBuilder();

    constructor() {
        this.#slashCommand.setName("server").setDescription("Replies with the server info");
    }

    execute = async (interaction : CommandInteraction) : Promise<void | never> => {
        await interaction.reply(`Server info: ${interaction.guild?.name}\n${interaction.guild?.createdAt}`);
    }

    get slashCommand() {
        return this.#slashCommand;
    }


}


/* export default {
    data: new SlashCommandBuilder().setName("server").setDescription("Replies with the server info"),
    async execute(interaction : CommandInteraction) {
        await interaction.reply(`Server info: ${interaction.guild?.name}\n${interaction.guild?.createdAt}`)
    }
}  */
