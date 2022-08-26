import { ICommand } from "@utils/interfaces/commandInterface";
import { ContextMenuCommandBuilder, SlashCommandBuilder } from "discord.js";

export abstract class Command implements ICommand {

    #slashCommand! : SlashCommandBuilder | ContextMenuCommandBuilder;

    constructor(slashCommandBuilder : SlashCommandBuilder | ContextMenuCommandBuilder) {
        this.#slashCommand = slashCommandBuilder;
    }

    get slashCommand() : SlashCommandBuilder | ContextMenuCommandBuilder {
        return this.#slashCommand;
    }

    execute = async (interaction : any) : Promise<void> => {}

}