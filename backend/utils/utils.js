import dotenv from 'dotenv';
dotenv.config();



export const frontendHost = `${process.env.DOMAIN || `localhost:${process.env.FRONTEND_PORT || process.env.PORT}`}`;
export const frontendRootUrl = `${process.env.PROTOCOL__ || 'https://'}${frontendHost}`;

export const backendHost = `${process.env.DOMAIN || `localhost:${process.env.PORT}`}`;
export const backendRootUrl = `${process.env.PROTOCOL__ || 'https://'}${backendHost}`;

export function isNil(any) {
    return any === undefined || any === null || any === NaN;
}

export function isEmpty(any) {
    return isNil(any) || any === '';
}

export function isObject(any) {
    return any != null && typeof any === 'object';
}

export function isArray(any) {
    return Object.prototype.toString.call(any) === '[object Array]';
}

export function hasFileExt(file, fileExt) {
    if (fileExt[0] === '.') fileExt = fileExt.substring(1, fileExt.length);
    return file.split('.').pop() === fileExt;
}

export function formatDate(timestamp = Date.now()) {
    const d = new Date(timestamp);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${month}-${day}-${year}_${hours}_${minutes}_${seconds}`;
}
