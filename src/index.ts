import "module-alias/register";
import { readFiles } from "@utils/helpers/readFiles";
import { GatewayIntentBits, ClientOptions, RESTPostAPIApplicationCommandsJSONBody, REST, Routes, ActivityType } from "discord.js";
import { Bot } from "@utils/models/botClient";
import path from "path";
import env from "@utils/env";

class BotSetup {

    #bot! : Bot;
    readonly #CLIENT_TOKEN! : string;
    readonly #CLIENT_ID! : string;
    
    constructor(clientOptions : ClientOptions, [clientToken, clientId] : string[]) {
        this.#bot = new Bot(clientOptions);
        this.#CLIENT_TOKEN = clientToken;
        this.#CLIENT_ID = clientId;
    }
    
    #loadCommands = async () : Promise<void> => {
        const commandFiles : string[] = readFiles(path.join(__dirname, "commands"));
        for (const commandFile of commandFiles) {
            const commandClass = (await import(commandFile)).default;
            const command = new commandClass();
            this.#bot.commands?.set(command.slashCommand.name, command);
        }
    }
    
    #loadEvents = async () : Promise<void> => {
        const eventFiles : string[] = readFiles(path.join(__dirname, "events"));
        for (const eventFile of eventFiles) {
            const eventClass = (await import(eventFile)).default;
            const event = new eventClass();
            event.once ? this.#bot.once(event.name, (...args : any) => event.execute(...args)) : this.#bot.on(event.name, (...args : any) => event.execute(...args));
        }
    }

    registerCommands = async () : Promise<void> => {
        const commands : RESTPostAPIApplicationCommandsJSONBody[] = [];
        const commandFiles : string[] = readFiles(path.join(__dirname, "commands"));
        for (const commandFile of commandFiles) {
            const commandClass = (await import(commandFile)).default;
            const command = new commandClass();
            commands.push(command.slashCommand.toJSON());
        }
        const rest : REST = new REST({ version: "10" }).setToken(this.#CLIENT_TOKEN);

        rest.put(Routes.applicationCommands(this.#CLIENT_ID), { body: commands }).then(() => console.log("Commands were successfully registered")).catch(console.error);
    }
    
    setup = () : void => {
        try {
            this.#loadCommands();
            this.#loadEvents();
            this.#bot.login(this.#CLIENT_TOKEN);    
        } catch (error) {
            console.log("There was an error while starting the bot");
        }
    }
    
}

const main = () : void => {
    const sevastolink : BotSetup = new BotSetup({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
    }, [env.clientToken!, env.clientId!]);
    /* sevastolink.registerCommands(); */
    sevastolink.setup();
}

main();
