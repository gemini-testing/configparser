import _ from 'lodash';

import type {LazyObject} from './types/lazy';

export const isLazy = Symbol('isLazy');

type SimpleOrLazyObject<T> = T | LazyObject<T>;

export function buildLazyObject<T>(keys: Array<keyof T>, getKeyGetter: (key: keyof T) => () => (SimpleOrLazyObject<T[keyof T]>)): LazyObject<T> {
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

function defineLazy<T>(object: LazyObject<T>, key: keyof T, getter: () => SimpleOrLazyObject<T[keyof T]>): void {
    let defined = false;
    let value: T[keyof T];

    Object.defineProperty(object, key, {
        get(): T[keyof T] {
            if (!defined) {
                defined = true;
                const val = getter();

                value = isLazyObject(val) ? forceParsing(val) : val;
            }

            return value;
        },
        enumerable: true
    });
}

function isLazyObject<T>(value: T): value is LazyObject<T> {
    return _.isObject(value) && hasOwnProperty(value, isLazy) && value[isLazy] === true;
}

function hasOwnProperty<T extends object, K extends PropertyKey>(obj: T, prop: K): obj is T & Record<K, unknown> {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
