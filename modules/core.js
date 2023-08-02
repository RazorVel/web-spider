import path from "path"
import slug from "slug" 
import {isText, isBinary} from "istextorbinary"
import {HttpUrlPattern, isHttpUrl, sanitizePathName, logFormat} from "./utils.js"
import {NetworkIO} from "./networkIO.js"

export function spider(url, nest, outputDir, overwrite, callback) {
    if (!nest){
        return;
    }

    if (!isHttpUrl(url)){
        return callback(new Error("Please provide a valid URL"));
    }

    let agent = new NetworkIO();

    agent
        .download(url)
        .once("error", err => callback(err))
        .once("success", onDownloadExit)
        ;

    function onDownloadExit(res) {
        let buffer = Buffer.from(Buffer.isBuffer(res.body) ? res.body : res.text);

        let filePath = sanitizePathName(decodeURIComponent(outputDir + "/" + new URL(url).hostname + "/" + new URL(url).pathname).replaceAll(" ", "_"));

        agent
            .saveFile(filePath, buffer, overwrite)
            .once("error", err => callback(err))
            .once("fileExist", onFileExist)
            .once("success", onSaveExit)
            ;

        function onFileExist(pathName) {
            pathName ? console.log(logFormat("already exist", pathName)) : undefined;
            recurse();
        }

        function onSaveExit(path) {
            console.log(logFormat("crawled", path));
            recurse();
        }
        
        function recurse(){
            setImmediate(spiderLinks, buffer, nest, outputDir, overwrite, err => callback(err));
        }
    }
}

function spiderLinks(buffer, nest, outputDir, overwrite, callback) {
    if (!isText(null, buffer) || !nest) {
        return;
    }

    let pattern = new RegExp(HttpUrlPattern.source.replace(/^\^(.*)\$$/, "$1"), "gi");
    let links = buffer.toString().match(pattern);

    let completed = 0;

    function onSpiderExit(err) {
        completed++;

        if (err){
            return callback(err);
        }
        if (completed === links.length){
            return callback(null);
        }
    }

    links && links.forEach(link => {
        spider(link, nest-1, outputDir, overwrite, onSpiderExit);
    });
}

export default {spider}