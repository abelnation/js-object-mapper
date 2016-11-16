var assert = require('chai').assert;

var ObjectMapper = require('../lib/object-mapper');

describe('object-mapper', function() {

	describe('simple mappings', function() {

		it('maps src key to dest key', function() {
			var mapper = new ObjectMapper({ 'foo': 'bar' });
			var result = mapper.map({ foo: 'test' });
			assert.deepEqual(result, { bar: 'test' });
		});

		it('maps nested src key to dest key', function() {
			var mapper = new ObjectMapper({ 'foo.fab': 'bar' });
			var result = mapper.map({ 'foo': { 'fab': 'test' } });
			assert.deepEqual(result, { 'bar': 'test' });
		});

		it('maps src key to nested dest key', function() {
			var mapper = new ObjectMapper({ 'foo': 'bar.baz' });
			var result = mapper.map({ foo: 'test' });
			assert.deepEqual(result, { bar: { baz: 'test' } });
		});

		it('maps nested src key to nested dest key', function() {
			var mapper = new ObjectMapper({ 'foo.fab': 'bar.baz' });
			var result = mapper.map({ foo: { fab: 'test' } });
			assert.deepEqual(result, { bar: { baz: 'test' } });
		});

	});

	describe('optional mappings', function() {

		it('maps optional mapping when present', function() {
			var mapper = new ObjectMapper({ 'foo?': 'bar' });
			var result = mapper.map({ other: 'other' });
			assert.deepEqual(result, {});
		});

		it('maps optional mapping when present', function() {
			var mapper = new ObjectMapper({ 'foo?': 'bar' });
			var result = mapper.map({ foo: 'test' });
			assert.deepEqual(result, { bar: 'test' });
		});

		it('maps optional nested mapping when present', function() {
			var mapper = new ObjectMapper({ 'foo.fab?': 'bar' });
			var result = mapper.map({ foo: { fab: 'test' } });
			assert.deepEqual(result, { bar: 'test' });
		});

		it('does not map optional mapping when absent', function() {
			var mapper = new ObjectMapper({ 'foo?': 'bar' });
			var result = mapper.map({ other: 'other' });
			assert.deepEqual(result, {});
		});

		it('does not map optional nested mapping when parent key absent', function() {
			var mapper = new ObjectMapper({ 'foo?.fab': 'bar' });
			var result = mapper.map({ other: 'other' });
			assert.deepEqual(result, {});
		});

		it('throws error when required map key not present', function() {
			var mapper = new ObjectMapper({ 'foo': 'bar' });
			assert.throws(function() {
				mapper.map({ other: 'other' });
			});
		});

		it('throws error when absent parent key required and not present', function() {
			var mapper = new ObjectMapper({ 'foo.fab?': 'bar' });
			assert.throws(function() {
				mapper.map({ other: 'other' });
			});
		});

	});

	describe('value transformations', function() {

		it('simple value transform fn', function() {
			var transformFn = function(val, key) {
				return val.toUpperCase();
			}
			var mapper = new ObjectMapper({ 'foo': { path: 'bar', transform: transformFn } });
			var result = mapper.map({ 'foo': 'test' });
			assert.deepEqual(result, { 'bar': 'TEST' });
		});

	});

	describe('delegating mapping', function() {
		// TODO
	});

});