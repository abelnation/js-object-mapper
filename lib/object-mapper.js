
function MappingError(message) {
    this.name = 'MappingError';
    this.message = message;
    this.stack = (new Error()).stack;
}
MappingError.prototype = new Error;

function OptionalMappingNotPresentError(message) {
    this.name = 'OptionalMappingNotPresentError';
    this.message = message;
    this.stack = (new Error()).stack;
}
OptionalMappingNotPresentError.prototype = new Error;

var RE_IS_OPTIONAL = /(^\?)|(\?$)/g;

// obj: object to search in
// path: array of traversal steps
function objectValueAtPath(obj, path) {
	
	var ctx = obj;
	var curToken = path[0];
	var curPath = [];

	for (var i = 0; i < path.length; i++) {
		
		curToken = path[i];
		curPath.push(curToken);

		// have remaining path, but context is not a dict
		if (typeof ctx !== 'object') {
			throw new MappingError('cannot traverse down value for key: ' + curToken);
		}
		
		var isOptional = RE_IS_OPTIONAL.test(curToken);
		
		// strip ? out of path token
		if (isOptional) {
			curToken = curToken.replace(RE_IS_OPTIONAL, '');
		}

		if (curToken in ctx) {
			ctx = ctx[curToken];
		} else if (isOptional) {
			throw new OptionalMappingNotPresentError('optional key not present: ' + curToken);
		} else {
			throw new MappingError('required key not present in src: ' + curToken + ' for path: ' + curPath.join('.'));
		}
	}

	return ctx;
}

// obj: object to search in and set the value
// path: array of traversal steps
// does not support optionals in path
function setObjectValueAtPath(obj, path, value) {
	var ctx = obj;
	var curToken = path[0];
	var curPath = [];

	// we create nested objects for all keys except the last
	// so iterate over all but last key
	for (var i = 0; i < path.length-1; i++) {
		
		curToken = path[i];
		curPath.push(curToken);

		// have remaining path, but context is not a dict
		if (typeof ctx !== 'object') {
			throw new MappingError('cannot traverse down value for key: ' + curToken);
		}

		if (!(curToken in ctx)) {
			ctx[curToken] = {};
		} else if (typeof ctx[curToken] !== 'object' || ctx[curToken] instanceof Array) {
			throw new MappingError('value encountered in path: ' + curPath.join('.') + 'is not an object: ' + ctx[curToken]);
		}

		ctx = ctx[curToken];
	}

	var finalToken = path[path.length - 1];
	ctx[finalToken] = value;
}

//
// Mapping
// internal class
//

// Represents a single key/value mapping
function Mapping(srcConfig, dstConfig) {
	this.srcConfig = srcConfig;
	this.dstConfig = dstConfig;
}
Mapping.prototype.apply = function(src, dst) {
	try {
		var srcValue = objectValueAtPath(src, this.srcConfig.path);
	} catch (e) {
		 if (e instanceof OptionalMappingNotPresentError) {
		 	return;
		 }
		 throw e;
	}

	if (this.dstConfig.transform) {
		srcValue = this.dstConfig.transform(srcValue);
	}
	setObjectValueAtPath(dst, this.dstConfig.path, srcValue);
}
Mapping.fromConfigPair = function(srcSpec, dstSpec) {
	var srcConfig = {};
	var dstConfig = {};

	if (typeof srcSpec === 'string') {
		srcConfig.path = srcSpec.split('.');
	} else if ('path' in srcSpec && typeof srcSpec.path === 'string') {
		srcConfig.path = srcSpec.path.split('.');
	} else if ('path' in srcSpec && srcSpec.path instanceof Array) {
		srcConfig.path = srcSpec.path;
	} else {
		throw new MappingError('invalid srcSpec: ' + srcSpec);
	}

	if (typeof dstSpec === 'string') {
		dstConfig.path = dstSpec.split('.');
	} else if ('path' in dstSpec && typeof dstSpec.path === 'string') {
		dstConfig.path = dstSpec.path.split('.');
	} else if ('path' in dstSpec && dstSpec.path instanceof Array) {
		dstConfig.path = dstSpec.path;
	} else {
		throw new MappingError('invalid dstSpec: ' + dstSpec);
	}

	if (dstSpec.transform && typeof dstSpec.transform === 'function') {
		dstConfig.transform = dstSpec.transform;
	}

	return new Mapping(srcConfig, dstConfig);
}

//
// ObjectMapper
// public interface
//

function ObjectMapper(config) {
	this.mappings = [];
	for (var key in config) {
		this.mappings.push(Mapping.fromConfigPair(key, config[key]));
	}
}

ObjectMapper.prototype.map = function(src) {
	var result = {};
	for (var i = 0; i < this.mappings.length; i++) {
		this.mappings[i].apply(src, result);
	}
	return result;
}

// Expose helper functions/classes as inner classes
ObjectMapper.MappingError = MappingError;
ObjectMapper.OptionalMappingNotPresentError = OptionalMappingNotPresentError;
ObjectMapper.Mapping = Mapping;
ObjectMapper.objectValueAtPath = objectValueAtPath;
ObjectMapper.setObjectValueAtPath = setObjectValueAtPath;

module.exports = ObjectMapper;