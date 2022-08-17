import { Client, GatewayIntentBits, Collection, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";

import fs from "fs";
import path from "path";

dotenv.config();


interface ClientBot extends Client {
    commands?: Collection<string, any>
}

const client : ClientBot  = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));


const readCommands = async () => {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath);
        client.commands!.set(command.default.data.name, command);
    }
}
readCommands();











client.once("ready", () => {
    console.log("Ready");
});


client.on("interactionCreate", async interaction => {
    /* console.log(interaction); */
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const command = client.commands?.get(interaction.commandName);

    if (!command) {
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: "There was a problem while executing this command",
            ephemeral: true
        });
    }

    /* const { commandName } = interaction;

    if (commandName === "ping") {
        await interaction.reply("ping");
    } else if (commandName === "server") {
        await interaction.reply(`server name: ${interaction.guild?.name}\n${interaction.guild?.memberCount}\n${interaction.guild?.createdAt}`);
    } else if (commandName === "user") {
        await interaction.reply(`user info: ${interaction.user.tag}\n${interaction.user.id}`);
    } */
});




client.login(process.env.CLIENT_TOKEN);