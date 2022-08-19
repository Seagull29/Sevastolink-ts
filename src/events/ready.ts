import { IEvent } from "@utils/interfaces/eventInterface";
import { Client } from "discord.js";


export default class OnReadyEvent implements IEvent {

    readonly #name! : string;
    readonly #once! : boolean;

    constructor () {
        this.#name = "ready";
        this.#once = true;
    }

    get name() {
        return this.#name;
    }

    get once() {
        return this.#once;
    }

    execute = (client : Client) : void => {
        console.log(`Ready Logged in as ${client.user?.tag}`);
    }
}

/* export default {
    name: "ready",
    once: true,
    execute(client : Client) {
        console.log(`Ready! Logged in as ${client.user?.tag}`);
    }
}; */