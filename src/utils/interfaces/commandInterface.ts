import { Message, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";

export interface ICommand {
    slashCommand: SlashCommandBuilder | SlashCommandSubcommandBuilder,
    execute(interaction : any) : Promise<void>
}