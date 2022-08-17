import { SlashCommandBuilder, Routes, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import { REST } from "@discordjs/rest";
import dotenv from "dotenv";

import fs from "fs";
import path from "path";

dotenv.config();

const CLIENT_TOKEN : string = process.env.CLIENT_TOKEN!;
const CLIENT_ID : string = process.env.CLIENT_ID!;



const readCommands = async () => {
    const commands : RESTPostAPIApplicationCommandsJSONBody[] = [];
    const commandsPath = path.join(__dirname, "commands");
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath);
        commands.push(command.default.data.toJSON());
    }
    const rest : REST = new REST({ version : "10"}).setToken(CLIENT_TOKEN);
    
    rest.put(Routes.applicationCommands(CLIENT_ID), {
        body: commands
    }).then(() => console.log("commands were successfully registered")).catch(console.error);
}

/* for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    import(filePath).then(command => commands.push(command.default.data.toJSON()));
} */

readCommands();


/* const commmands = [
    //new SlashCommandBuilder().setName("ping").setDescription("Replies with pong"),
    new SlashCommandBuilder().setName("server").setDescription("Replies with server infor"),
    new SlashCommandBuilder().setName("user").setDescription("Replies with user info")
].map(command => command.toJSON()); */



//rest.delete(Routes.applicationCommand(CLIENT_ID, "1006956160605241404")).then(() => console.log("command was deleted")).catch(console.error);