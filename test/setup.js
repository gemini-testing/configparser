const chai = require('chai');

global.sinon = require('sinon');
global.assert = require('chai').assert;

sinon.assert.expose(chai.assert, {prefix: ''});
