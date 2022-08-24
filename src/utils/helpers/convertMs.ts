
const formatToTwoDigits = (number : number) : string => {
    return number.toString().padStart(2, "0");
}

export const convertMstoTime = (ms : number) : string => {
    let seconds : number = Math.floor(ms / 1000);
    let minutes : number = Math.floor(seconds / 60);
    let hours : number = Math.floor(minutes / 60);

    seconds %= 60;
    minutes %= 60;

    return `${formatToTwoDigits(hours)}:${formatToTwoDigits(minutes)}:${formatToTwoDigits(seconds)}`;
}