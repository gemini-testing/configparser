import {map} from '../src/core';
import {forceParsing} from '../src/lazy';
import {assert} from 'chai';
import sinon from 'sinon';

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
                .withArgs('key2').returns(key2Locator)
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
            /*jshint unused:false*/
            let result = config.name.second;

            assert.calledWith(valueParser, secondLocator, context);
        });
        const parser = map(valueParser);
        const config = {};

        parser({
            name: '.name',
            option: {
                first: 1,
                second: 2
            },
            nested: sinon.stub()
                .withArgs('first').returns(firstLocator)
                .withArgs('second').returns(secondLocator)
        }, config);
    });
});
