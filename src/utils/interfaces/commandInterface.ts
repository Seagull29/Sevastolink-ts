import { SlashCommandBuilder } from "discord.js";

export interface ICommand {
    slashCommand: SlashCommandBuilder,
    execute(interaction : any) : Promise<void>
}