import _ from 'lodash';

import type { LazyObject } from '../types/lazy';

export const isLazy = Symbol('isLazy');

export function buildLazyObject<T>(keys: Array<keyof T>, getKeyGetter: (key: keyof T) => () => (T[keyof T] | LazyObject<T[keyof T]>)): LazyObject<T> {
    const target = {
        [isLazy]: true
    } as LazyObject<T>;

    for (const key of keys) {
        defineLazy(target, key, getKeyGetter(key));
    }

    return target;
}

export function forceParsing<T>(lazyObject: LazyObject<T>): T {
    return _.cloneDeep(lazyObject);
}

function defineLazy<T>(object: LazyObject<T>, key: keyof T, getter: () => T[keyof T] | LazyObject<T[keyof T]>): void {
    let defined = false;
    let value: T[keyof T];

    Object.defineProperty(object, key, {
        get(): T[keyof T] {
            if (!defined) {
                defined = true;
                const val = getter();

                if (isLazyObject(val)) {
                    value = forceParsing(val);
                } else {
                    value = val;
                }
            }

            return value;
        },
        enumerable: true
    });
}

function isLazyObject<T>(value: T): value is LazyObject<T> {
    return _.isObject(value) && hasOwnProperty(value, isLazy) && value[isLazy] === true;
}

function hasOwnProperty<T extends {}>(obj: T, prop: PropertyKey): obj is T & Record<typeof prop, unknown> {
    return obj.hasOwnProperty(prop);
}
