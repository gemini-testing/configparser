import type {Rooted} from './common';
import type {Locator} from './locator';

interface MetaInfo {
    isSetByUser: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface OptionParserConfig<Value, MappedValue, Result = any> {
    defaultValue?: Value | ((config: Result, currNode: any) => Value);
    parseCli?: (input?: string) => Value | undefined;
    parseEnv?: (input?: string) => Value | undefined;
    validate?: (value: unknown, config: Result, currNode: any, meta: MetaInfo) => asserts value is Value;
    map?(value: Value, config: Result, currNode: any, meta: MetaInfo): MappedValue;
    isDeprecated?: boolean;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface OptionParser<Value, Result> {
    (locator: Locator<Value>, config: Rooted<Result>): Value;
}
