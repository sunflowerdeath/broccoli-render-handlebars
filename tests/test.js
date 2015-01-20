var assert = require('assert')
var fs = require('fs-extra')
var path = require('path')
var _ = require('underscore')
var broccoli = require('broccoli')
var sinon = require('sinon')

var renderHandlebars = require('..')

describe('broccoli render handlebars', function() {
	var ORIG_DIR = path.join(__dirname, 'files')
	var DIR = path.join(__dirname, 'files-copy')
	var builder

	beforeEach(function() {
		fs.copySync(ORIG_DIR, DIR)
	})

	afterEach(function() {
		if (builder) builder.cleanup()
		fs.removeSync(DIR)
	})

	var SIMPLE_DIR = path.join(DIR, 'simple')
	var PARTIALS_DIR = path.join(DIR, 'partials')

	it('renders templates', function() {
		var tree = renderHandlebars(SIMPLE_DIR, {
			context: {test: 'test'}
		})
		builder = new broccoli.Builder(tree)
		return builder.build().then(function(result) {
			var dir = result.directory
			var file = fs.readFileSync(path.join(dir, 'template1.html'), 'utf8')
			assert.equal(file, 'test1\n')
		})
	})

	it('caches rendered templates and re-renders changed templates', function() {
		var tree = renderHandlebars(SIMPLE_DIR, {
			context: {test: 'test'}
		})
		var spy = sinon.spy(tree, 'processFileContent')
		builder = new broccoli.Builder(tree)
		return builder.build()
			.then(function() { assert.equal(spy.callCount, 2) })
			.then(builder.build.bind(builder))
			.then(function() { assert.equal(spy.callCount, 2) })
			.then(function() {
				fs.writeFileSync(path.join(SIMPLE_DIR, 'template1.hbs'), 'changed')
			})
			.then(builder.build.bind(builder))
			.then(function() { assert.equal(spy.callCount, 3) })
	})

	it('uses partials', function() {
		var tree = renderHandlebars(PARTIALS_DIR, {
			files: ['template1.hbs', 'template2.hbs'],
			partials: ['partial.hbs'],
			context: {test: 'test'}
		})
		builder = new broccoli.Builder(tree)
		return builder.build().then(function(result) {
			var dir = result.directory
			var file = fs.readFileSync(path.join(dir, 'template1.html'), 'utf8')
			assert.equal(file, 'test\n1\n')
		})
	})

	it('caches partials and re-renders all templates when partial changed', function() {
		var tree = renderHandlebars(PARTIALS_DIR, {
			files: ['template1.hbs', 'template2.hbs'],
			partials: ['partial.hbs'],
			context: {test: 'test'}
		})
		var spy = sinon.spy(tree, 'processFileContent')
		builder = new broccoli.Builder(tree)
		return builder.build()
			.then(function() { assert.equal(spy.callCount, 2) })
			.then(function() {
				fs.writeFileSync(path.join(SIMPLE_DIR, 'partial.hbs'), 'changed')
			})
			.then(builder.build.bind(builder))
			.then(function() { assert.equal(spy.callCount, 4) })
	})

	it('makePartialName', function() {
	})

	it('helpers', function() {
	})

	it('context', function() {
	})

	it('changeFileName', function() {
	})
})
