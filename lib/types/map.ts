import type {Rooted} from './common';
import type {LazyObject} from './lazy';
import type {Locator} from './locator';

export interface MapParser<Config, Result> {
    (locator: Locator<Config>, config: Rooted<Result>): LazyObject<Config>;
}
