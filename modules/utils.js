export const HttpUrlPattern = /^(http(s)?:\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;

export function isHttpUrl(input) {
    return HttpUrlPattern.test(input);
}

export function sanitizePathName(input) {
    const regex = /[^a-zA-Z0-9\-_.\/]/g;

    const sanitized = input.replace(regex, "");
    return sanitized;
}

export function truncateString(input, maxLength) {
    if (input.length > maxLength)
        return input.substr(0, maxLength) + "...";
    return input;
}

export function toFixedLength(input, maxLength) {
    return truncateString(input, maxLength).padEnd(maxLength, ".");    
}

export function parenthesize(input){
    return `(${input})`;
}

export function logFormat(type, url){
    let message = (type instanceof Error) ? type.message : type;
    return `${parenthesize(toFixedLength(message, 20))}: ${url}`;
}

export default {HttpUrlPattern, isHttpUrl, sanitizePathName, truncateString, toFixedLength, parenthesize, logFormat}