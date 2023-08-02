import fs from "fs"
import path from "path"
import superAgent from "superagent"
import {isText, isBinary} from "istextorbinary"
import {mkdirp} from "mkdirp"
import {EventEmitter} from "events"
import {isHttpUrl, logFormat} from "./utils.js"

export function NetworkIO() {
    EventEmitter.call(this);

    this.visited = [];
}

Object.setPrototypeOf(NetworkIO.prototype, EventEmitter.prototype);

NetworkIO.prototype.download = function download(url){
    let responseHandler = (err, res) => {
        if (err){
            return this.emit("error", new Error(logFormat(err, url)));
        }
        this.visited.push(url);
        this.emit("success", res);
    }
    
    if (!this.visited.includes(url)){
        superAgent
            .get(url)
            .end(responseHandler)
            ;
    }

    return this;
};

NetworkIO.prototype.saveFile = function saveFile(filePath, buffer, overwrite) {
    let normalized = path.normalize(filePath.replace(/^file:\/\/\/(.+)/, "/$1").replace(/(.+)\/$/, "$1/index.html"));
    const target = path.parse(normalized); 

    fs.access(normalized , fs.constants.F_OK, (err) => {
        if (!err && !overwrite){
            return this.emit("fileExist", normalized);
        }

        mkdirp(target.dir)
            .then(onMkdirExit)
            .catch(err => this.emit("error", new Error(logFormat(err, filePath))))
            ;

        function onMkdirExit(made) {
            let payload = isText(null, buffer) ? buffer.toString() : (isBinary(null, buffer) ? buffer : undefined);

            fs.writeFile(normalized, payload, onWriteExit);
        }

        let onWriteExit = (err) => {
            if (err){
                return this.emit("error", new Error(logFormat(err, filePath)));
            }
            this.emit("success", normalized);
        }
    })

    return this;
};

export default {NetworkIO}