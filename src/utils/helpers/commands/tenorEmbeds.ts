import { TenorCategory } from "@services/tenor/models/tenorCategory";
import { TenorGif } from "@services/tenor/models/tenorGif";
import { EmbedBuilder, User } from "discord.js";

export const buildTenorEmbed = (tenorGif : TenorGif, user : User, index : number, long : number) : EmbedBuilder => {
    const now : Date = new Date();
    const embed : EmbedBuilder = new EmbedBuilder();
    const { tags } = tenorGif;
    embed.setTitle(tenorGif.title || tenorGif.contentDescription).setThumbnail("https://tenor.com/assets/img/tenor-app-icon.png").setColor(user.accentColor!).setImage(tenorGif.gifUrl).setURL(tenorGif.url);
    embed.setFooter({
        text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}\nResult ${index + 1} of ${long}`,
        iconURL: user.avatarURL() || ""
    });
    embed.addFields(
        { name: "Tags", value: tags.slice(0, Math.ceil(tags.length / 2)).join(", ") },
        { name: "Create date", value: new Date(tenorGif.created).toDateString(), inline: true },   
    );
    return embed;
}

export const buildTenorCategoryEmbed = (tenorCategory : TenorCategory, user : User, index : number, long : number) : EmbedBuilder => {
    const now : Date = new Date();
    const embed : EmbedBuilder = new EmbedBuilder();
    embed.setTitle(`Category: ${tenorCategory.searchTerm}`).setColor(user.accentColor!).setImage(tenorCategory.image);
    embed.setAuthor({
        name: "Tenor",
        url: "https://tenor.com/",
        iconURL: "https://tenor.com/assets/img/tenor-app-icon.png" 
    });
    embed.setFooter({
        text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}\nResult ${index + 1} of ${long}`,
        iconURL: user.avatarURL() || ""
    });
    return embed;
}