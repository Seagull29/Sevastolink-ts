import fs from "fs";
import path from "path";

export const readFiles = (filesPath : string, files : string[] = []) : string[] => {
    const pathFiles : string[] = fs.readdirSync(filesPath);
    for (const file of pathFiles) {
        const filePath : string = path.join(filesPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            files = readFiles(filePath, files);
        } else {
            files.push(filePath);
        }
    }
    return files;

}