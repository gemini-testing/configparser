import type { isLazy } from "../lazy";
export declare type LazyObject<T> = T & {
    [isLazy]: true;
};
