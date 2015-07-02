import _ from 'lodash';

const isLazy = Symbol('isLazy');

export function buildLazyObject(keys, getKeyGetter) {
    const target = {
        [isLazy]: true
    };
    for (const key of keys) {
        defineLazy(target, key, getKeyGetter(key));
    }
    return target;
}

export function forceParsing(lazyObject) {
    return _.cloneDeep(lazyObject);
}

function defineLazy(object, key, getter) {
    let defined = false;
    let value;

    Object.defineProperty(object, key, {
        get() {
            if (!defined) {
                defined = true;
                value = getter();
                if (_.isObject(value) && value[isLazy]) {
                    value = forceParsing(value);
                }
            }
            return value;
        },
        enumerable: true
    });
}
