import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
                .setName("info")
                .setDescription("Get info about a user or a server")
                .addSubcommand(subcommand => subcommand.setName("user").setDescription("info about a user").addUserOption(option => option.setName("user").setDescription("the user")))
                .addSubcommand(subcommand => subcommand.setName("server").setDescription("Info about the server")),
    async execute(interaction : CommandInteraction) {
        
    }
}