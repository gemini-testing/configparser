const {root, section, map, option} = require('./core');
const {MissingOptionError, UnknownKeysError} = require('./errors');

module.exports = {
    root, section, map, option,
    MissingOptionError, UnknownKeysError
};
