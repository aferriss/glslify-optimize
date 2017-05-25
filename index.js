var escodegen = require('escodegen')
var optimize  = require('./optimize')
var through   = require('through2')
var esprima   = require('esprima')
var astw      = require('astw')

module.exports = transform

function debug(){}
if (process.env.DEBUG === 'glslify-optimize') {
  debug = console.error
}

function transform(filename) {
  var stream = through(write, flush)
  var buffer = []

  return stream

  function write(chunk, _, next) {
    buffer.push(chunk)
    next()
  }

  function flush() {
    var src = buffer.join('')
    if (src.indexOf('GLSLIFY') === -1) {

    console.log(src);
      this.push(src)
      this.push(null)
      return
    }

    var ast = esprima.parse(src)
    var walk = astw(ast)

    debug('Original source:')
    //    debug('\n' + src)

    walk(function(node) {
      if (node.type !== 'Literal') return
      if (node.value.length <1 ) return
      if (typeof node.value !== 'string') return
      var opti;
      if(node.value.indexOf('gl_FragColor') !== -1){
        console.log(node.value);
         opti = optimize.frag(node.value); 
         node.value = opti;
      }
      if(node.value.indexOf('gl_Position') !== -1){
         opti = optimize.vert(node.value);
         node.value = opti;
      }
    })

    this.push(src = escodegen.generate(ast))
    this.push(null)
    //    debug(src)
  }
}
