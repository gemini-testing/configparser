const locator = require('../lib/locator');

function locatorWithOptions(options) {
    return locator({options, env: {}, argv: []});
}

function locatorWithEnv(env, {envPrefix} = {}) {
    return locator({options: {}, env, argv: [], envPrefix});
}

function locatorWithArgv(argv, {cliPrefix} = {}) {
    return locator({options: {}, env: {}, argv, cliPrefix});
}

describe('locator', () => {
    it('should return a root option and undefined env/cli', () => {
        const root = {};
        const pointer = locatorWithOptions(root);
        assert.propertyVal(pointer, 'option', root);
        assert.propertyVal(pointer, 'envVar', undefined);
        assert.propertyVal(pointer, 'cliOption', undefined);
    });

    it('should return locator with "root" name', () => {
        const pointer = locatorWithOptions({});
        assert.propertyVal(pointer, 'name', 'root');
    });

    it('should return subkey value after nested call', () => {
        const pointer = locatorWithOptions({
            key: 'value'
        });
        const childPointer = pointer.nested('key');
        assert.propertyVal(childPointer, 'option', 'value');
    });

    it('should return nested name after nest call', () => {
        const pointer = locatorWithOptions({});
        const childPointer = pointer.nested('key');
        assert.propertyVal(childPointer, 'name', 'key');
    });

    it('should return empty parent for root children', () => {
        const pointer = locatorWithOptions({someKey: 'someVal'});
        const childPointer = pointer.nested('key');
        assert.propertyVal(childPointer, 'parent', '');
    });

    it('should return parent name for not root children', () => {
        const pointer = locatorWithOptions({someKey: 'someVal'});
        const childPointer = pointer.nested('child');
        const subChildPointer = childPointer.nested('subChild');
        assert.propertyVal(subChildPointer, 'parent', 'child');
    });

    it('should return env var value after nested call', () => {
        const pointer = locatorWithEnv({
            'option': 'env value'
        });
        const childPointer = pointer.nested('option');
        assert.propertyVal(childPointer, 'envVar', 'env value');
    });

    it('should read env value from snake_cased env var', () => {
        const pointer = locatorWithEnv({
            'some_option': 'env value'
        });
        const childPointer = pointer.nested('someOption');
        assert.propertyVal(childPointer, 'envVar', 'env value');
    });

    it('should return undefined env if there is no such variable', () => {
        const pointer = locatorWithEnv({
            'some_other_option': 'some value'
        });

        const childPointer = pointer.nested('name');

        assert.propertyVal(childPointer, 'envVar', undefined);
    });

    it('should read env value from env var with custom prefix', () => {
        const pointer = locatorWithEnv(
            {'foo_some_option': 'env value'},
            {envPrefix: 'foo_'}
        );
        const childPointer = pointer.nested('someOption');

        assert.propertyVal(childPointer, 'envVar', 'env value');
    });

    it('should return cli option after the nest call', () => {
        const pointer = locatorWithArgv([
            '--option',
            'cli value'
        ]);
        const childPointer = pointer.nested('option');

        assert.propertyVal(childPointer, 'cliOption', 'cli value');
    });

    it('should return cli option set with --option="cli value"', () => {
        const pointer = locatorWithArgv([
            '--option=cli value'
        ]);
        const childPointer = pointer.nested('option');

        assert.propertyVal(childPointer, 'cliOption', 'cli value');
    });

    it('should allow to have = sign inside option set with --option="cli=value"', () => {
        const pointer = locatorWithArgv([
            '--option=cli=value'
        ]);
        const childPointer = pointer.nested('option');

        assert.propertyVal(childPointer, 'cliOption', 'cli=value');
    });

    it('should allow to have = sign inside option set with --option "cli=value"', () => {
        const pointer = locatorWithArgv([
            '--option',
            'cli=value'
        ]);
        const childPointer = pointer.nested('option');

        assert.propertyVal(childPointer, 'cliOption', 'cli=value');
    });

    it('should use last value of an option', () => {
        const pointer = locatorWithArgv([
            '--option=first',
            '--option',
            'second',
            '--option',
            'last'
        ]);
        const childPointer = pointer.nested('option');

        assert.propertyVal(childPointer, 'cliOption', 'last');
    });

    it('should look for cli option in kebab-case', () => {
        const pointer = locatorWithArgv([
            '--some-option',
            'cli value'
        ]);
        const childPointer = pointer.nested('someOption');

        assert.propertyVal(childPointer, 'cliOption', 'cli value');
    });

    it('should return undefined if there is no such option', () => {
        const pointer = locatorWithArgv([
            '--some-other-option',
            'cli value'
        ]);

        const childPointer = pointer.nested('someOption');

        assert.propertyVal(childPointer, 'cliOption', undefined);
    });

    it('should use option with custom prefix', () => {
        const pointer = locatorWithArgv(
            ['--foo-option', 'cli value'],
            {cliPrefix: '--foo-'}
        );
        const childPointer = pointer.nested('option');

        assert.propertyVal(childPointer, 'cliOption', 'cli value');
    });

    it('should support nesting for more then 1 level', () => {
        const pointer = locator({
            options: {
                first: {
                    second: 'value'
                }
            },
            env: {
                'first_second': 'env value'
            },
            argv: [
                '--first-second',
                'cli value'
            ]
        });

        const childPointer = pointer.nested('first').nested('second');

        assert.propertyVal(childPointer, 'option', 'value');
        assert.propertyVal(childPointer, 'envVar', 'env value');
        assert.propertyVal(childPointer, 'cliOption', 'cli value');
    });

    it('should reset option', () => {
        const pointer = locator({
            env: {
                'first_second': 'env value'
            },
            argv: [
                '--first-second', 'cli value'
            ]
        });

        const newPointer = pointer.resetOption({
            first: {
                second: 'value'
            }
        });

        const childPointer = newPointer.nested('first').nested('second');

        assert.propertyVal(childPointer, 'option', 'value');
        assert.propertyVal(childPointer, 'envVar', 'env value');
        assert.propertyVal(childPointer, 'cliOption', 'cli value');
    });

    it('should support multiple envPrefix values', () => {
        const pointer = locatorWithEnv(
            {'bar_some_option': 'env value'},
            {envPrefix: ['foo_', 'bar_']}
        );
        const childPointer = pointer.nested('someOption');

        assert.propertyVal(childPointer, 'envVar', 'env value');
    });

    it('should use first existing envPrefix value', () => {
        const pointer = locatorWithEnv(
            {
                'bar_some_option': 'another env value',
                'foo_some_option': 'some env value'
            },
            {envPrefix: ['foo_', 'bar_']}
        );
        const childPointer = pointer.nested('someOption');

        assert.propertyVal(childPointer, 'envVar', 'some env value');
    });
});
