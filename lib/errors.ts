export class MissingOptionError extends Error {
    public optionName: string;

    constructor(optionName: string) {
        const message = `${optionName} is required`;
        super(message);
        this.name = 'MissingOptionError';
        this.message = message;
        this.optionName = optionName;

        Error.captureStackTrace(this, MissingOptionError);
    }
}

export class UnknownKeysError extends Error {
    public keys: Array<string>;

    constructor(keys: Array<string>) {
        const message = `Unknown options: ${keys.join(', ')}`;
        super(message);
        this.name = 'UnknownKeysError';
        this.message = message;
        this.keys = keys;

        Error.captureStackTrace(this, UnknownKeysError);
    }
}
