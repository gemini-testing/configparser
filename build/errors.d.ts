export declare class MissingOptionError extends Error {
    optionName: string;
    constructor(optionName: string);
}
export declare class UnknownKeysError extends Error {
    keys: Array<string>;
    constructor(keys: Array<string>);
}
