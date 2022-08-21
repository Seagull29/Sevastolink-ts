import { OnEvent } from "@utils/models/onEvent";
import { Client } from "discord.js";


export default class OnReadyEvent extends OnEvent {

    constructor () {
        super("ready", true);
    }

    override execute = (client : Client) : void => {
        console.log(`Ready Logged in as ${client.user?.tag}`);
    }
}