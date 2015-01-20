#broccoli-render-handlebars

Broccoli plugin that renders handlebars templates.

Plugin supports caching:
* It caches template files and re-render only changed files.
* It caches partials and re-render all templates, when some partial is changed.

##Install

```
npm install broccoli-render-handlebars
```

##Usage

```
var renderHandlebars = require('broccoli-render-handlebars')

var tree = renderHandlebars('inputDir', {
  // Paths or glob patterns
  files: ['templates/**/*.hbs'],
  partials: ['partials/**/*.hbs']
})
```

##renderHandlebars(inputTree, options)

###inputTree

Broccoli input tree

###options

Object with options


##List of options

###files

Type: `array.<string>`
<br>
Default: `['**/*.hbs', '**/*.handlebars']`

List of files or glob patterns of templates to render.

###partials

Type: `array.<string>`

List of files or glob patterns of partial templates.

###makePartialName

Type: `function(string) -> string`
<br>
Default: Path with removed `.hbs` or `.handlebars` extension.

Function that takes path of partial and returns name.

###helpers

Type: `object`

Handlebars helpers.

###context 

Type: `object|function(string) -> object`

Handlebars render context or function that takes path of template and returns context.

###changeFileName 

Type: `function(string) -> string`
<br>
Default: Path with `.hbs` or `.handlebars` extension changed to `.html`.

Function that takes path of template and returns name of rendered file.

###handlebars

Type: `object`

Handlebars instance with already registered helpers and partials.

#License

Public domain, see the `LICENCE.md` file.
