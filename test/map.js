const {map} = require('../build/core');
const {forceParsing} = require('../build/lazy');
const _ = require('lodash');

describe('map', () => {
    it('should return an object', () => {
        const parser = map(sinon.stub());
        const result = parser({
            option: {}
        });

        assert.isObject(result);
    });

    it('should call value parser for each value when forced parsing', () => {
        const valueParser = sinon.stub();
        const parser = map(valueParser);
        const key1Locator = {};
        const key2Locator = {};
        const config = {};
        const nestedStub = sinon.stub();
        nestedStub
            .withArgs('key1').returns(key1Locator)
            .withArgs('key2').returns(key2Locator);

        const locator = {
            option: {
                key1: '',
                key2: ''
            },

            nested: nestedStub
        };

        forceParsing(parser(locator, config));

        assert.calledWith(valueParser, key1Locator, config);
        assert.calledWith(valueParser, key2Locator, config);
    });

    it('should reset locator with default value if no option passed', () => {
        const defaultValue = {someKey: {}};
        const parser = map(sinon.stub(), defaultValue);
        const locator = {
            resetOption: sinon.stub()
        };
        locator.resetOption.returns(
            _.extend({}, locator, {
                option: {}
            })
        );

        parser(locator, {});

        assert.calledWith(locator.resetOption, defaultValue);
    });

    it('should call value parser wit default value if no option passed', () => {
        const valueParser = sinon.stub();
        const defaultValue = {someKey: 'someVal'};
        const parser = map(valueParser, defaultValue);
        const locator = {
            resetOption: sinon.stub()
        };
        const newLocator = _.extend({}, locator, {
            option: defaultValue,
            nested: sinon.stub()
        });
        newLocator.nested.withArgs('someKey').returns(defaultValue.someKey);
        locator.resetOption.returns(newLocator);

        forceParsing(parser(locator, {}));

        assert.calledWith(valueParser, 'someVal');
    });

    it('should not reset locator with default value if option passed', () => {
        const defaultValue = {someKey: {}};
        const parser = map(sinon.stub(), defaultValue);
        const locator = {
            option: {},
            resetOption: sinon.stub()
        };

        parser(locator, {});

        assert.notCalled(locator.resetOption);
    });

    it('should return the object parsed with value parser', () => {
        const parser = map(sinon.stub().returns('parsed'));

        const result = parser({
            option: {
                key1: ''
            },
            nested: sinon.stub()
        });

        assert.deepEqual(result, {key1: 'parsed'});
    });

    it('should allow value parser to access not yet parsed dependencies', function() {
        const firstLocator = {};
        const secondLocator = {};
        const valueParser = sinon.spy((locator, config) => {
            if (locator === secondLocator) {
                //TODO: find a way to call a function only on first call
                return;
            }
            assert.neverCalledWith(valueParser, secondLocator, context);

            /*eslint-disable no-unused-expressions*/
            config.name.second;
            /*eslint-enable no-unused-expressions*/

            assert.calledWith(valueParser, secondLocator, context);
        });
        const parser = map(valueParser);
        const config = {};
        const nestedStub = sinon.stub();

        nestedStub
            .withArgs('first').returns(firstLocator)
            .withArgs('second').returns(secondLocator);

        parser({
            name: '.name',
            option: {
                first: 1,
                second: 2
            },
            nested: nestedStub
        }, config);
    });
});
