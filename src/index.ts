import "module-alias/register";
import { readFiles } from "@utils/helpers/readFiles";
import { Client, GatewayIntentBits, Collection, ClientOptions } from "discord.js";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

class Bot extends Client {

    #commands : Collection<string, any> = new Collection();

    constructor(clientOptions : ClientOptions) {
        super(clientOptions);
    }

    #loadCommands = async () : Promise<void> => {
        const commandFiles : string[] = readFiles(path.join(__dirname, "commands"));
        for (const commandFile of commandFiles) {
            const commandClass = (await import(commandFile)).default;
            const command = new commandClass();
            this.#commands.set(command.slashCommand.name, command);
        }
    }

    #loadEvents = async () : Promise<void> => {
        const eventFiles : string[] = readFiles(path.join(__dirname, "events"));
        for (const eventFile of eventFiles) {
            const eventClass = (await import(eventFile)).default;
            const event = new eventClass();
            event.once ? this.once(event.name, (...args) => event.execute(...args)) : this.on(event.name, (...args) => event.execute(...args));
        }
    }

    setup = () : void => {
        this.#loadCommands();
        this.#loadEvents();
        this.login(process.env.CLIENT_TOKEN);
    }

}

const main = () : void => {
    const bot : Bot = new Bot({
        intents: [GatewayIntentBits.Guilds]
    });
    bot.setup();
}

main();



/* 
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
readEvents(); */

