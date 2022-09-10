import { OnEvent } from "@utils/models/onEvent";
import { ActivityOptions, ActivityType, Client } from "discord.js";


export default class OnReadyEvent extends OnEvent {

    constructor () {
        super("ready", true);
    }

    override execute = (client : Client) : void => {
        const activity : ActivityOptions = { 
            type: ActivityType.Listening,
            name: "Spotify",
        }
        client.user?.setPresence({
            activities: [activity],
            status: "online" 
        });
        console.log(`${client.user?.username} is ready to service!`);
    }
}