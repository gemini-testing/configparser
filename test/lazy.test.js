import {buildLazyObject, forceParsing} from '../src/lazy';
import {assert} from 'chai';
import sinon from 'sinon';

describe('build lazy object', () => {
    it('should build an object with given keys', () => {
        const result = buildLazyObject(['key1', 'key2'], sinon.spy());
        assert.deepEqual(Object.keys(result), ['key1', 'key2']);
    });

    it('should call callback passing each key', () => {
        const callback = sinon.spy().named('getKeyGetter');
        buildLazyObject(['key'], callback);
        assert.calledWith(callback, 'key');
    });

    it('should not call getters when building object', () => {
        const getter = sinon.spy().named('getter');
        buildLazyObject(['key'], () => getter);
        assert.notCalled(getter);
    });

    it('should call getter when property accessed', () => {
        const getter = sinon.spy().named('getter');
        const result = buildLazyObject(['key'], () => getter);

        /*eslint-disable no-unused-expressions*/
        result.key;
        /*eslint-enable no-unused-expressions*/

        assert.calledOnce(getter);
    });

    it('should not call getter when property accessed second time', () => {
        const getter = sinon.spy().named('getter');
        const result = buildLazyObject(['key'], () => getter);

        /*eslint-disable no-unused-expressions*/
        result.key;
        result.key;
        /*eslint-enable no-unused-expressions*/

        assert.calledOnce(getter);
    });

    it('should return value returned by getter', () => {
        const getter = sinon.stub().named('getter').returns('value');
        const result = buildLazyObject(['key'], () => getter);

        assert.equal(result.key, 'value');
    });

    it('should call getter when called forceParsing', () => {
        const getter = sinon.stub().named('getter');
        const result = buildLazyObject(['key'], () => getter);

        forceParsing(result);
        assert.calledOnce(getter);
    });

    it('should return correct object after forceParsing', () => {
        const getter = sinon.stub().named('getter').returns('value');
        const lazy = buildLazyObject(['key'], () => getter);

        const result = forceParsing(lazy);
        assert.deepEqual(result, {key: 'value'});
    });
});
