import { OnEvent } from "@utils/models/onEvent";
import { Activity, ActivityFlagsBitField, ActivityType, Client, RichPresenceAssets } from "discord.js";


export default class OnReadyEvent extends OnEvent {

    constructor () {
        super("ready", true);
    }

    override execute = (client : Client) : void => {
        const activity : Activity = {
            name: "Spotify",
            details: "",
            state: "",
            timestamps: {
                start: null,
                end: null
            },
            assets: {
                largeText: "",
                largeImage: "",
            }
        };
        
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