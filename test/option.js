const sinon = require('sinon');
const {option} = require('../lib/core');
const {MissingOptionError} = require('../lib/errors');

describe('option', () => {
    let consoleWarnStub;

    beforeEach(() => {
        consoleWarnStub = sinon.stub(console, 'warn');
    });

    afterEach(() => {
        consoleWarnStub.restore();
    });

    const LAZY_CONFIG = {
        root: {defaultKey: 'defaultValue'}
    };

    it('should parse a simple option', () => {
        const parser = option({});

        const value = parser({option: 'value'}, LAZY_CONFIG);

        assert.equal(value, 'value');
    });

    it('should allow to override it with env var', () => {
        const parser = option({});

        const value = parser({
            option: 'value',
            envVar: 'from env'
        }, LAZY_CONFIG);

        assert.equal(value, 'from env');
    });

    it('should call parseEnv callback with env value', () => {
        const parseEnv = sinon.stub();
        const parser = option({parseEnv});

        parser({
            envVar: 'from env'
        }, LAZY_CONFIG);

        assert.calledWith(parseEnv, 'from env');
    });

    it('should return the value returned by parseEnv callback', () => {
        const parser = option({
            parseEnv: sinon.stub().returns('parsed')
        });

        const value = parser({
            envVar: ''
        }, LAZY_CONFIG);

        assert.equal(value, 'parsed');
    });

    it('should allow to override it with cli flag', () => {
        const parser = option({});

        const value = parser({
            option: 'value',
            envVar: 'from env',
            cliOption: 'from cli'
        }, LAZY_CONFIG);

        assert.equal(value, 'from cli');
    });

    it('should call parseCli callback with argv value', () => {
        const parseCli = sinon.stub();
        const parser = option({parseCli});

        parser({
            cliOption: 'option'
        }, LAZY_CONFIG);

        assert.calledWith(parseCli, 'option');
    });

    it('should return the value returned by parseCli callback', () => {
        const parser = option({
            parseCli: sinon.stub().returns('parsed')
        });

        const value = parser({
            cliOption: ''
        }, LAZY_CONFIG);

        assert.equal(value, 'parsed');
    });

    it('should not return default if option is set', () => {
        const parser = option({
            defaultValue: 'def'
        });

        const value = parser({option: 'value'}, LAZY_CONFIG);

        assert.equal(value, 'value');
    });

    describe('if no option set', () => {
        it('should return defaultValue', () => {
            const parser = option({
                defaultValue: 'def'
            });

            const value = parser({}, LAZY_CONFIG);

            assert.equal(value, 'def');
        });

        it('should call defaultValue callback', () => {
            const defaultValStub = sinon.stub().returns('def');
            const parser = option({
                defaultValue: defaultValStub
            });

            const value = parser({}, LAZY_CONFIG);

            assert.calledOnce(defaultValStub);
            assert.equal(value, 'def');
        });

        it('should pass config and current node to defaultValue callback', () => {
            const defaultValStub = sinon.stub().returns('def');
            const parser = option({
                defaultValue: defaultValStub
            });

            const config = {
                root: {
                    topLevel: {
                        subLevel: 'subLevelVal'
                    }
                }
            };

            parser({parent: 'topLevel'}, config);

            assert.calledWith(defaultValStub, config.root, {subLevel: 'subLevelVal'});
        });

        it('should pass root node as current to defaultValue callback if no parent set', () => {
            const defaultValStub = sinon.stub().returns('def');
            const parser = option({
                defaultValue: defaultValStub
            });

            parser({parent: ''}, LAZY_CONFIG);

            assert.calledWith(defaultValStub, LAZY_CONFIG.root, LAZY_CONFIG.root);
        });

        it('should throw if no default nor value is set', () => {
            const parser = option({});
            assert.throws(() => parser({}, LAZY_CONFIG), MissingOptionError);
        });

        it('should not throw if option is deprecated', () => {
            const parser = option({isDeprecated: true});
            assert.doesNotThrow(() => parser({}, LAZY_CONFIG), MissingOptionError);
        });

        it('should not log warning on deprecated option without any value', () => {
            option({isDeprecated: true})({}, LAZY_CONFIG);

            assert.notCalled(consoleWarnStub);
        });
    });

    it('should log warning on deprecated option if option is set', () => {
        option({isDeprecated: true})({envVar: 'foo'}, LAZY_CONFIG);

        assert.calledWith(consoleWarnStub, sinon.match('option is deprecated'));
    });

    function testAfterParseCallback(name) {
        it(`should call ${name} callback on a parser with root as current node for top level option`, () => {
            const callback = sinon.stub().named(name);
            const parser = option({
                [name]: callback
            });

            parser({option: 'value'}, LAZY_CONFIG);

            assert.calledWith(callback, 'value', LAZY_CONFIG.root, LAZY_CONFIG.root);
        });

        it(`should call ${name} callback on a parser with root as current node`, () => {
            const callback = sinon.stub().named(name);
            const parser = option({
                [name]: callback
            });

            const config = {
                root: {
                    topLevel: {
                        subLevel: 'subLevelVal'
                    }
                }
            };

            parser({option: 'value', parent: 'topLevel'}, config);

            assert.calledWith(callback, 'value', config.root, {subLevel: 'subLevelVal'});
        });

        it(`should call ${name} callback on a parsed env var`, () => {
            const callback = sinon.stub().named(name);
            const parseEnv = sinon.stub().returns('parsed');
            const parser = option({
                parseEnv,
                [name]: callback
            });

            parser({envVar: 'value'}, LAZY_CONFIG);

            assert.calledWith(callback, 'parsed');
        });

        it(`should call ${name} callback on a parsed cli flag`, () => {
            const callback = sinon.stub().named(name);
            const parseCli = sinon.stub().returns('parsed');
            const parser = option({
                parseCli,
                [name]: callback
            });

            parser({cliOption: 'value'}, LAZY_CONFIG);

            assert.calledWith(callback, 'parsed');
        });

        it(`should call ${name} callback with meta info if option is specified`, () => {
            const callback = sinon.stub().named(name);
            const parser = option({
                [name]: callback
            });

            parser({option: 'value'}, LAZY_CONFIG);

            assert.calledWith(callback, 'value', LAZY_CONFIG.root, LAZY_CONFIG.root, {isSetByUser: true});
        });

        it(`should call ${name} callback with meta info if option is specified by env`, () => {
            const callback = sinon.stub().named(name);
            const parser = option({
                [name]: callback
            });

            parser({envVar: 'value'}, LAZY_CONFIG);

            assert.calledWith(callback, 'value', LAZY_CONFIG.root, LAZY_CONFIG.root, {isSetByUser: true});
        });

        it(`should call ${name} callback with meta info if option is specified by cli`, () => {
            const callback = sinon.stub().named(name);
            const parser = option({
                [name]: callback
            });

            parser({cliOption: 'value'}, LAZY_CONFIG);

            assert.calledWith(callback, 'value', LAZY_CONFIG.root, LAZY_CONFIG.root, {isSetByUser: true});
        });

        it(`should call ${name} callback with meta info that the option is not specified`, () => {
            const callback = sinon.stub().named(name);
            const parser = option({
                defaultValue: 'value',
                [name]: callback
            });

            parser({}, LAZY_CONFIG);

            assert.calledWith(callback, 'value', LAZY_CONFIG.root, LAZY_CONFIG.root, {isSetByUser: false});
        });
    }

    testAfterParseCallback('validate');
    testAfterParseCallback('map');

    it('should pass separate meta info object to map and validate', () => {
        const validateCallback = sinon.stub();
        const mapCallback = sinon.stub();
        const parser = option({
            defaultValue: 'value',
            validate: validateCallback,
            map: mapCallback
        });

        parser({}, LAZY_CONFIG);

        assert.notEqual(validateCallback.firstCall.args[3], mapCallback.firstCall.args[3]);
    });

    it('should return value returned by map callback', () => {
        const map = sinon.stub().returns('mapped');
        const parser = option({map});

        const value = parser({option: 'value'}, LAZY_CONFIG);
        assert.equal(value, 'mapped');
    });
});
