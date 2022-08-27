import { Command } from "@utils/models/command";
import { ChatInputCommandInteraction, SlashCommandBuilder, User } from "discord.js";


export default class InfoCommand extends Command {

    constructor() {
        super(
            new SlashCommandBuilder().
                setName("info").
                setDescription("Get info about a user or a server").
                addSubcommand(subcommand => 
                              subcommand.setName("user").
                              setDescription("info about a user").
                              addUserOption(option => 
                                            option.setName("user").
                                            setDescription("the user"))).
                addSubcommand(subcommand =>
                              subcommand.setName("server").
                              setDescription("infor about the server")) as SlashCommandBuilder
                
        )
    }

    override execute = async (interaction : ChatInputCommandInteraction) : Promise<void> => {
        if (interaction.options.getSubcommand() === "user") {
            const user : User | null = interaction.options.getUser("user");

            user ? interaction.reply(`Username: ${user.username}\nId: ${user.id}`) : interaction.reply(`Your username: ${interaction.user.username}\nYour id: ${interaction.user.id}`);

        } else if (interaction.options.getSubcommand() === "server") {
            await interaction.reply(`Server name: ${interaction.guild?.name}\nTotal members: ${interaction.guild?.memberCount}`);
        }
    }
}