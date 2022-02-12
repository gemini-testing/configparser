import type { RootParsedConfig } from "./common";
import type { LazyObject } from "./lazy";
import type { Locator } from "./locator";
import type { DeepPartial } from "./utils";

export type MapParser<T, R = any> = (locator: Locator<DeepPartial<T>>, config: RootParsedConfig<R>) => LazyObject<T>;
