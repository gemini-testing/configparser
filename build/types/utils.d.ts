export declare type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends {} ? DeepPartial<T[K]> : T[K];
};
