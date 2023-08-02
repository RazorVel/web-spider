#!/usr/bin/env node
import path from "path"
import {spider} from "./modules/core.js"
import {isHttpUrl} from "./modules/utils.js"

let args = process.argv;
const options = new Map();

//defaults
options.set("overwrite", false);
options.set("outputDirectory", path.resolve(".") + "/" + "spidernest");
options.set("depth", 1);

while (args.length){
    let current;
    
    switch(current = args.shift()){
        case "-o":
        case "--output-dir":
        case "--directory":
            options.set("outputDirectory", path.resolve(args.shift()));
            break;

        case "-d":
            case "--depth":
            options.set("depth", args.shift());
            break;

        case "-f":
        case "--force":
        case "--overwrite":
            options.set("overwrite", true);
            break;
            
        case (isHttpUrl(current) ? current : undefined):
            options.set("URL", current);
            break;

        default:
            continue;
        }
    }

spider(options.get("URL"), options.get("depth"), options.get("outputDirectory"), options.get("overwrite"), (err) => {
    if (err){
        return console.error(err.message);
    }

    console.log("Download complete...");    
});
