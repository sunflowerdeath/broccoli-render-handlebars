var path = require('path')
var fs = require('fs')
var crypto = require('crypto')

var dirmatch = require('dirmatch')
var _ = require('underscore')
var handlebars = require('handlebars')
var Filter = require('broccoli-glob-filter')

var makePartialName = function(partialPath) {
	var name = partialPath
	var ext = path.extname(partialPath)
	if (ext === '.hbs' || ext === '.handlebars') {
		name = path.basename(partialPath, ext)
	}
	return name
}

var Tree = function(inputTree, options) {
	if (!(this instanceof Tree)) return new Tree(inputTree, options)

	if (!options) options = {}
	if (options.files === undefined) options.files = ['**/*.hbs', '**/*.handlebars']
	if (options.targetExtension === undefined) options.targetExtension = 'html'
	if (options.makePartialName === undefined) options.makePartialName = makePartialName

	this.handlebars = options.handlebars || handlebars.create()
	if (options.helpers) this.handlebars.registerHelper(options.helpers)

  Filter.apply(this, arguments)
}

Tree.prototype = Object.create(Filter.prototype)
Tree.prototype.description = 'Handlebars'

Tree.prototype.read = function(readTree) {
	var _this = this
	return readTree(this.inputTree).then(function(srcDir) {
		_this.cachePartials(srcDir)
		return Filter.prototype.read.call(_this, readTree)
	})
}

Tree.prototype.cachePartials = function(srcDir) {
	if (!this.options.partials) return
	var partials = dirmatch(srcDir, this.options.partials)
	var absPartials = _.map(partials, function(file) { return path.join(srcDir, file) })
	var partialsHash = this.hashFiles(absPartials)
	if (this.cachedPartialsHash !== partialsHash) {
		this.cachedPartialsHash = partialsHash
		this.cachedPartials = this.loadPartials(srcDir, partials)
		this.invalidateCache()
	}
}

Tree.prototype.loadPartials = function(srcDir, partialsPaths) {
	var partials = {}
	_.each(partialsPaths, function(partialPath) {
		var name = this.options.makePartialName(partialPath)
		var content = fs.readFileSync(path.join(srcDir, partialPath), 'utf8')
		partials[name] = this.handlebars.compile(content)
	}, this)
	return partials
}

Tree.prototype.hashFiles = function(files) {
	var keys = _.map(files, this.hashFile.bind(this))
	return crypto.createHash('md5').update(keys.join(''))
}

Tree.prototype.processFileContent = function(content, relPath) {
	var template = this.handlebars.compile(content, {partials: this.cachedPartials})
	var context = this.options.context
	if (typeof this.options.context === 'function') context = context(relPath)
	return template(this.options.context, {
		partials: this.cachedPartials
	})
}

module.exports = Tree
