import { GiphyCategory } from "@services/giphy/models/giphyCategory";
import { GiphyGif } from "@services/giphy/models/giphyGif";
import { EmbedBuilder, User } from "discord.js";

export const buildGiphyEmbed = (gif : GiphyGif, user : User, index : number, long : number) : EmbedBuilder => {
    const now : Date = new Date();
    const embed : EmbedBuilder = new EmbedBuilder();
    const { user : gifUser } = gif;
    const trendingDate : string = new Date(gif.trendingDatetime).toDateString();
    embed.setTitle(gif.title || "Oh! This is a lost gif without a name").setURL(gif.url).setColor(user.accentColor!).setThumbnail("https://ucb4d3b291391bc060502d507126.previews.dropboxusercontent.com/p/thumb/ABpnVvUArQaqvn68DnGrpsGf1s3eihVoEeYSntmNZPmB6_U6zcli6xxEtKqjelfeK5x8Yynj3ml2JS8lFh7GSPZxjA2xRgWWifYSj2tupuKPC02CV7Cp4qzQ1-QIGn6G2aGVtI9et_Zi-XO4ROxosHTRqJukUxrpaDrHKJa_ThwahFxAP93cz8XWJY12ep7gN6EKsrcIqS_4qyvy3F6_8CwqYEmKo4n5BCE4IUwMzP7GtT3VfYCHceKlHrJnDMii7N9P_QaANib0QXXDuIAQhGRRQz87wixE-O6I_HFjQ1WMd4zu6bWGR8AJRr6n_d7Tg0VA_IGZvtTKRzKKRTipjnUDlaY6f4VIi8TvY4bKo7ixH_KHS5evQX1orZGOt34Losc/p.png").setImage(gif.originalImage);
    if (gifUser) {
        embed.setAuthor({
            name: gifUser.displayName || gifUser.username,
            url: gifUser.profileUrl,
            iconURL: gifUser.avatarUrl
        });
    }
    embed.setFooter({
        text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}\nResult ${index + 1} of ${long}`,
        iconURL: user.avatarURL() || ""
    });
    embed.addFields(
        { name: "Source", value: gif.source || "It seems there's not a source" },
        { name: "Rating", value: gif.rating, inline: true },
        { name: "Creation date", value: new Date(gif.importDatetime).toDateString(), inline: true },
        { name: "Trending date", value: trendingDate === "Invalid Date" ? "It never was a trending" : trendingDate, inline: true }
    );
    return embed;
}

export const buildGiphyCategoryEmbed = (category : GiphyCategory, user : User, index : number, long : number) : EmbedBuilder => {
    const now : Date = new Date();
    const embed : EmbedBuilder = new EmbedBuilder();
    const { gif } = category;
    const { subcategories : categorySubcategories } = category;
    const subcategories : string[] = [];
    for (let subcategory = 0; subcategory < 15; ++subcategory) {
        if (categorySubcategories[subcategory]) {
            subcategories.push(categorySubcategories[subcategory].name);
        }
    }
    embed.setTitle(`Category: ${category.name}`).setThumbnail("https://images-na.ssl-images-amazon.com/images/I/11VW65eq80L.png").setImage(gif.originalImage).setColor(user.accentColor!);
    if (gif.user) {
        embed.setAuthor({
            name: gif.user.displayName || gif.user.username,
            url: gif.user.profileUrl,
            iconURL: gif.user.avatarUrl
        });
    }
    embed.setFooter({
        text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}\nResult ${index + 1} of ${long}`,
        iconURL: user.avatarURL() || ""
    });
    embed.addFields(
        { name: "Subcategories", value: `${subcategories.join(", ")}`}
    );
    return embed;
}

