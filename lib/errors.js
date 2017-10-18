class MissingOptionError extends Error {
    constructor(optionName) {
        const message = `${optionName} is required`;
        super(message);
        this.name = 'MissingOptionError';
        this.message = message;
        this.optionName = optionName;

        Error.captureStackTrace(this, MissingOptionError);
    }
}

class UnknownKeysError extends Error {
    constructor(keys) {
        const message = `Unknown options: ${keys.join(', ')}`;
        super(message);
        this.name = 'UnknownKeysError';
        this.message = message;
        this.keys = keys;

        Error.captureStackTrace(this, UnknownKeysError);
    }
}

module.exports = {MissingOptionError, UnknownKeysError};
