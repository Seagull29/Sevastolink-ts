import { ContextMenuCommandBuilder, SlashCommandBuilder } from "discord.js";

export interface ICommand {
    slashCommand: SlashCommandBuilder | ContextMenuCommandBuilder,
    execute(interaction : any) : Promise<void>
}