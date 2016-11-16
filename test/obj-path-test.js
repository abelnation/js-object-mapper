var assert = require('chai').assert;

var ObjectMapper = require('../lib/object-mapper');
var objectValueAtPath = ObjectMapper.objectValueAtPath;
var setObjectValueAtPath = ObjectMapper.setObjectValueAtPath;
var MappingError = ObjectMapper.MappingError;
var OptionalMappingNotPresentError = ObjectMapper.OptionalMappingNotPresentError;

describe('objectValueAtPath', function() {

	it('finds value for single token', function() {
		var src = { 'foo': 'bar' };
		assert.equal(objectValueAtPath(src, [ 'foo' ]), 'bar');
	});

	it('finds value for optional single token', function() {
		var src = { 'foo': 'bar' };
		assert.equal(objectValueAtPath(src, [ 'foo?' ]), 'bar');
		assert.equal(objectValueAtPath(src, [ '?foo' ]), 'bar');
	});

	it('finds value for nested token', function() {
		var src = { 'a': { 'b': { 'c': 'test' } } };
		assert.equal(objectValueAtPath(src, [ 'a', 'b', 'c' ]), 'test');
	});

	it('finds value for optional nested token', function() {
		var src = { 'a': { 'b': { 'c': 'test' } } };
		assert.equal(objectValueAtPath(src, [ 'a', 'b?', 'c' ]), 'test');
		assert.equal(objectValueAtPath(src, [ 'a', '?b', 'c' ]), 'test');
	});

	it('throws when token missing', function() {
		var src = { 'other': 'oops' };
		assert.throws(function() {
			objectValueAtPath(src, [ 'foo' ]);
		}, MappingError);
	});

	it('throws when nested token missing', function() {
		var src = { 'a': { 'b': { 'other': 'oops' } } };
		assert.throws(function() {
			objectValueAtPath(src, [ 'a', 'b', 'c' ]);
		}, MappingError);
	});

	it('throws OptionalMappingNotPresentError when key is optional', function() {
		var src = { 'foo': 'bar' };
		assert.throws(function() {
			objectValueAtPath(src, [ 'other?' ]);
		}, OptionalMappingNotPresentError);
		assert.throws(function() {
			objectValueAtPath(src, [ '?other' ]);
		}, OptionalMappingNotPresentError);
	});

	it('throws OptionalMappingNotPresentError when inner key is optional', function() {
		var src = { 'a': { 'b': { 'c': 'test' } } };
		assert.throws(function() {
			objectValueAtPath(src, [ 'a', 'other?', 'c' ]);
		}, OptionalMappingNotPresentError);
		assert.throws(function() {
			objectValueAtPath(src, [ 'a', '?other', 'c' ]);
		}, OptionalMappingNotPresentError);
	});

});

describe('setObjectValueAtPath', function() {
	
	it('sets simple key value', function() {
		var dst = {};
		setObjectValueAtPath(dst, [ 'foo' ], 'test');
		assert.deepEqual(dst, { 'foo': 'test' });
	});

	it('replaces simple key value', function() {
		var dst = { 'foo': 'prev' };
		setObjectValueAtPath(dst, [ 'foo' ], 'test');
		assert.deepEqual(dst, { 'foo': 'test' });
	});

	it('sets nested key value', function() {
		var dst = {};
		setObjectValueAtPath(dst, [ 'a', 'b', 'c' ], 'test');
		assert.deepEqual(dst, { 'a': { 'b': { 'c': 'test' } } });
	});

	it('throws when value in path not a dict', function() {
		assert.throws(function() {
			setObjectValueAtPath({ 'a': 'test' }, [ 'a', 'b', 'c' ], 'test');
		}, MappingError);
		assert.throws(function() {
			setObjectValueAtPath({ 'a': 1234 }, [ 'a', 'b', 'c' ], 'test');
		}, MappingError);
		assert.throws(function() {
			setObjectValueAtPath({ 'a': [ 0, 1, 2, 3 ] }, [ 'a', 'b', 'c' ], 'test');
		}, MappingError);
	});

});