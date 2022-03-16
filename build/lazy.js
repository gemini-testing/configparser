"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forceParsing = exports.buildLazyObject = exports.isLazy = void 0;
const lodash_1 = __importDefault(require("lodash"));
exports.isLazy = Symbol('isLazy');
function buildLazyObject(keys, getKeyGetter) {
    const target = {
        [exports.isLazy]: true
    };
    for (const key of keys) {
        defineLazy(target, key, getKeyGetter(key));
    }
    return target;
}
exports.buildLazyObject = buildLazyObject;
function forceParsing(lazyObject) {
    return lodash_1.default.cloneDeep(lazyObject);
}
exports.forceParsing = forceParsing;
function defineLazy(object, key, getter) {
    let defined = false;
    let value;
    Object.defineProperty(object, key, {
        get() {
            if (!defined) {
                defined = true;
                const val = getter();
                if (isLazyObject(val)) {
                    value = forceParsing(val);
                }
                else {
                    value = val;
                }
            }
            return value;
        },
        enumerable: true
    });
}
function isLazyObject(value) {
    return lodash_1.default.isObject(value) && hasOwnProperty(value, exports.isLazy) && value[exports.isLazy] === true;
}
function hasOwnProperty(obj, prop) {
    return obj.hasOwnProperty(prop);
}
