import { ICommand } from "@utils/interfaces/commandInterface";
import { Message, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";

export abstract class Command implements ICommand {

    #slashCommand! : SlashCommandBuilder | SlashCommandSubcommandBuilder;

    constructor(slashCommandBuilder : SlashCommandBuilder | SlashCommandSubcommandBuilder) {
        this.#slashCommand = slashCommandBuilder;
    }

    get slashCommand() : SlashCommandBuilder | SlashCommandSubcommandBuilder {
        return this.#slashCommand;
    }

    execute = async (interaction : any) : Promise<void> => {}

}