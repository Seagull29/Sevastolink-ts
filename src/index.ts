import { Client, GatewayIntentBits, Collection, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";

import fs from "fs";
import path from "path";

dotenv.config();


export interface ClientBot extends Client {
    commands?: Collection<string, any>
}

const client : ClientBot  = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));


const readCommands = async () => {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath);
        const { default : defaultImport } = command;
        client.commands!.set(defaultImport.data.name, defaultImport);
    }
}

const readEvents = async () => {
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = await import(filePath);
        const { default : defaultImportEvent } = event;
        if (event.once) {
            client.once(defaultImportEvent.name, (...args) => defaultImportEvent.execute(...args));
        } else {
            client.on(defaultImportEvent.name, (...args) => defaultImportEvent.execute(...args));
        }
    }
}
readCommands();
readEvents();


client.login(process.env.CLIENT_TOKEN);