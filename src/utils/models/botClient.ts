import { Client, ClientOptions, Collection } from "discord.js";

export class Bot extends Client {
    
    readonly #commands : Collection<string, any> = new Collection();

    constructor(clientOptions : ClientOptions) {
        super(clientOptions);
    }

    get commands() : Collection<string, any> {
        return this.#commands;
    }
}