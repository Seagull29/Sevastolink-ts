
export const normalizer = (query : string) : string => {
    const regexPattern : RegExp = /[&-,.()/:]/g;
    return query.toLowerCase().replace(regexPattern, "")
}

export const getLimitedWords = (query : string, character : string, limit : number) : string => {
    const cleanWords = query.split(character).filter((word : string) => word);
    const words : string[] = cleanWords.slice(0, limit);
    return words.join(" ");
}