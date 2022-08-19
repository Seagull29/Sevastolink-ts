import fs from "fs";
import path from "path";


const readDir = (pathfile : string) => {
    let fil = fs.readdirSync(pathfile)
    fil.forEach((file : string) => {
        if (fs.statSync(path.join(pathfile, file)).isDirectory()) {
            /* files = readDir(path.join(pathfile, file), files); */
            readDir(path.join(pathfile, file))
        } else {
            /* files.push(path.join(pathfile, file)); */
            console.log(path.join(pathfile, file));
        }
    });
    //return files;
}



readDir(path.join(__dirname, "commands"))