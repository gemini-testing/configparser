import {section} from '../src/core';
import {assert} from 'chai';
import {forceParsing} from '../src/lazy';
import sinon from 'sinon';

function stubLocator(locatorKeys) {
    return Object.assign({
        name: 'key',
        nested: sinon.stub()
    }, locatorKeys);
}

describe('section', () => {
    it('should call value parser for each option when forced parsing', () => {
        const valueParser = sinon.stub();
        const parser = section({
            subOption: valueParser
        });

        const config = {};
        const nestedLocator = {};

        forceParsing(parser({
            option: {subOption: ''},
            nested: sinon.stub()
                .withArgs('subOption')
                .returns(nestedLocator)
        }, config));

        assert.calledWith(valueParser, nestedLocator, config);
    });

    it('should return values returned by parser', () => {
        const parser = section({
            first: sinon.stub().returns('value1'),
            second: sinon.stub().returns('value2')
        });

        const result = parser(stubLocator({
            option: {
                first: 'first-value',
                second: 'second-value'
            }
        }));

        assert.deepEqual(result, {
            first: 'value1',
            second: 'value2'
        });
    });

    it('should throw if unknown option is passed', () => {
        const parser = section({
            property: sinon.stub()
        });

        assert.throws(() => {
            parser(stubLocator({
                option: {
                    iDontKnowThis: true
                }
            }));
        });
    });

    it('should allow to access any yet non-parsed option', () => {
        const dependencyParser = sinon.stub().returns('dep');

        const dependantParser = sinon.spy(function dependantParser(locator, config) {
            return 'prop1 ' + config.name.property2;
        });

        const parser = section({
            property1: dependantParser,
            property2: dependencyParser
        });

        const result = parser(stubLocator({
            name: '.name',
            option: {
                property1: 1,
                property2: 2
            }
        }), {});

        forceParsing(result);

        // Make sure that dependant parser was actually called first
        assert.callOrder(dependantParser, dependencyParser);

        assert.deepEqual(result, {
            property2: 'dep',
            property1: 'prop1 dep'
        });
    });
});
