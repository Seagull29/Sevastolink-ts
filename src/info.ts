import { ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder, User } from "discord.js";

export default {
    data: new SlashCommandBuilder()
                .setName("info")
                .setDescription("Get info about a user or a server")
                .addSubcommand(subcommand => subcommand.setName("user").setDescription("info about a user").addUserOption(option => option.setName("user").setDescription("the user")))
                .addSubcommand(subcommand => subcommand.setName("server").setDescription("Info about the server")),
    async execute(interaction : ChatInputCommandInteraction) {
        if (interaction.options.getSubcommand() === "user") {
            const user : User | null = interaction.options.getUser("user");

            user ? interaction.reply(`Username: ${user.username}\nId: ${user.id}`) : interaction.reply(`Your username: ${interaction.user.username}\nYour id: ${interaction.user.id}`);

        } else if (interaction.options.getSubcommand() === "server") {
            await interaction.reply(`Server name: ${interaction.guild?.name}\nTotal members: ${interaction.guild?.memberCount}`)
        }
    }
}