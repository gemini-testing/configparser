export class MissingOptionError extends Error {
    constructor(optionName) {
        let message = `${optionName} is required`;
        super(message);
        this.name = 'MissingOptionError';
        this.message = message;
        this.optionName = optionName;

        Error.captureStackTrace(this, MissingOptionError);
    }
}

export class UnknownKeysError extends Error {
    constructor(keys) {
        let message = `Unknown options: ${keys.join(', ')}`;
        super(message);
        this.name = 'UnknownKeysError';
        this.message = message;
        this.keys = keys;

        Error.captureStackTrace(this, UnknownKeysError);
    }
}
