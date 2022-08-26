import { OnEvent } from "@utils/models/onEvent";
import { ActivityType, Client } from "discord.js";


export default class OnReadyEvent extends OnEvent {

    constructor () {
        super("ready", true);
    }

    override execute = (client : Client) : void => {
        client.user?.setPresence({
            activities: [
                {
                    type: ActivityType.Listening,
                    name: "Spotify"
                }
            ],
            status: "online" 
        });
        console.log(`${client.user?.username} is ready to service!`);
    }
}