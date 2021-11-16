import type { isLazy } from "../lib/lazy";

export type LazyObject<T> = T & {
    [isLazy]: true;
};
