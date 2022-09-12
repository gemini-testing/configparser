import type {Parser, Rooted} from './common';
import type {LazyObject} from './lazy';
import type {Locator} from './locator';

export type SectionProperties<Config, Result> = {[Key in keyof Config]: Parser<Config[Key], Result>};
export interface SectionParser<Config, Result> {
    (locator: Locator<Config>, config: Rooted<Result>): LazyObject<Config>;
}
