import type { RootParsedConfig } from "./common";
import type { LazyObject } from "./lazy";
import type { Locator } from "./locator";

export type MapParser<T, R = any> = (locator: Locator<T>, config: RootParsedConfig<R>) => LazyObject<T>;
