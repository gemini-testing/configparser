import type { isLazy } from "../lazy";

export type LazyObject<T> = T & {
    [isLazy]: true;
};
