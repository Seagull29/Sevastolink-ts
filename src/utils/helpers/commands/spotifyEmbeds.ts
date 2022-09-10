import { SpotifyAlbum } from "@services/spotify/models/spotifyAlbum";
import { SpotifyArtist } from "@services/spotify/models/spotifyArtist";
import { SpotifyPlaylist } from "@services/spotify/models/spotifyPlaylist";
import { SpotifyTrack } from "@services/spotify/models/spotifyTrack";
import { EmbedBuilder, User } from "discord.js";
import { convertMstoTime } from "@utils/helpers/convertMs";

export const buildArtistEmbed = (artist : SpotifyArtist, user : User, index? : number, length? : number) : EmbedBuilder => {
    const now : Date = new Date();
    const embed : EmbedBuilder = new EmbedBuilder();
    let positionInfo : string = index && length ? `\nResult ${index + 1} of ${length}` : "";
    embed.setTitle(artist.name).setURL(artist.externalUrl).setColor(user.accentColor!);
    embed.setAuthor({
        name: "Spotify",
        iconURL: "https://developer.spotify.com/assets/branding-guidelines/icon4@2x.png",
        url: "https://open.spotify.com/"
    });
    embed.setThumbnail(artist.standardImage);
    embed.setFooter({
        text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}${positionInfo}`,
        iconURL: user.avatarURL() || ""
    });
    embed.addFields(
        { name: "Genres", value: !artist.genres.length ? "There are not genres to show" : artist.genres.join(", ") },
        { name: "Type", value: artist.type, inline: true  },
        { name: "Followers", value: artist.followers.toString(), inline: true },
        { name: "Popularity", value: artist.popularity.toString(), inline: true }
    );
    return embed;
}

export const buildAlbumEmbed = (album : SpotifyAlbum, user : User, index? : number, length? : number) : EmbedBuilder => {
    const now : Date = new Date();
    const embed : EmbedBuilder = new EmbedBuilder();
    const { artists } = album;
    const artistNames : string[] = [];
    for (const artist of artists) {
        artistNames.push(artist.name);
    }
    const allArtists : string = artistNames.join(", ");
    let positionInfo : string = index && length ? `\nResult ${index + 1} of ${length}` : "";
    embed.setTitle(album.name).setURL(album.externalUrl).setColor(user.accentColor!);
    embed.setAuthor({
        name: "Spotify",
        iconURL: "https://developer.spotify.com/assets/branding-guidelines/icon4@2x.png",
        url: "https://open.spotify.com/"
    });
    embed.setThumbnail(album.standardImage);
    embed.setFooter({
        text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}${positionInfo}`,
        iconURL: user.avatarURL() || ""
    });
    embed.addFields(
        { name: "Artists", value: allArtists },
        { name: "Album type", value: album.albumType },
        { name: "Available markets", value: `${album.availableMarkets.length} countries`, inline: true },
        { name: "Release date", value: album.releaseDate, inline: true },
        { name: "Total tracks", value: album.totalTracks.toString(), inline: true }
    );
    return embed;
}

export const buildTrackEmbed = (track : SpotifyTrack, user : User, index? : number, length? : number) : EmbedBuilder => {
    const now : Date = new Date();
    const embed : EmbedBuilder = new EmbedBuilder();
    const { artists, album } = track;
    const artistTrackNames : string[] = [];
    const artistAlbumNames : string[] = [];
    for (const artist of artists) {
        artistTrackNames.push(artist.name);
    }
    for (const artist of album.artists) {
        artistAlbumNames.push(artist.name);
    }
    const allTrackArtists : string = artistTrackNames.join(", ");
    const allAlbumArtists : string = artistAlbumNames.join(", ");
    let positionInfo : string = index && length ? `\nResult ${index + 1} of ${length}` : "";
    embed.setTitle(track.name).setURL(track.externalUrl).setColor(user.accentColor!);
    embed.setAuthor({
        name: "Spotify",
        iconURL: "https://developer.spotify.com/assets/branding-guidelines/icon4@2x.png",
        url: "https://open.spotify.com/"
    });
    embed.setThumbnail(album.standardImage);
    embed.setFooter({
        text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}${positionInfo}`,
        iconURL: user.avatarURL() || ""
    });
    embed.addFields(
        { name: "Artists", value: allTrackArtists },
        { name: "Album", value: album.name, inline: true },
        { name: "Album release date", value: album.releaseDate, inline: true},
        { name: "Album type", value: album.albumType, inline: true },
        { name: "Album artists", value: allAlbumArtists },
        { name: "Disc number", value: track.discNumber.toString(), inline: true },
        { name: "Duration", value: convertMstoTime(track.durationMs), inline: true },
        { name: "Track number", value: track.trackNumber.toString(), inline: true },
        { name: "Available markets", value: `${track.availableMarkets.length} countries`, inline: true },
        { name: "Explicit", value: `${track.explicit ? "Yes" : "No"}`, inline: true },
        { name: "Popularity", value: track.popularity.toString(), inline: true }
    );
    return embed;
}

export const buildPlaylistEmbed = (playlist : SpotifyPlaylist, user : User, index? : number, length? : number) : EmbedBuilder => {
    const now : Date = new Date();
    const embed : EmbedBuilder = new EmbedBuilder();
    const { owner } = playlist;
    let positionInfo : string = index && length ? `\nResult ${index + 1} of ${length}` : "";
    embed.setTitle(playlist.name).setURL(playlist.externalUrl).setColor(user.accentColor!);
    embed.setAuthor({
        name: "Spotify",
        iconURL: "https://developer.spotify.com/assets/branding-guidelines/icon4@2x.png",
        url: "https://open.spotify.com/"
    });
    embed.setThumbnail(playlist.standardImage);
    embed.setFooter({
        text: `Requested by ${user.username} at ${now.toDateString()} - ${now.toLocaleTimeString()}${positionInfo}`,
        iconURL: user.avatarURL() || ""
    });
    embed.addFields(
        { name: "Description", value: playlist.description || "No description" },
        { name: "Author", value: owner.displayName, inline: true },
        { name: "Author id", value: owner.id, inline: true },
        { name: "Collaborative", value: `${playlist.collaborative ? "Yes" : "No"}`, inline: true },
        { name: "Tracks", value: playlist.tracks.toString(), inline: true },
        { name: "Type", value: playlist.type, inline: true }
    )
    return embed;
}