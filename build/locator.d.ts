import type { LocatorArg, Locator } from './types/locator';
export default function <T>({ options, env, argv, envPrefix, cliPrefix }: LocatorArg<T>): Locator<T>;
