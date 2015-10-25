import reduce from '..'
import test from 'tape'
import mkdirp from 'mkdirp'
import path from 'path'
import fs from 'fs'
import os from 'os'

var tmpdir = path.join(
  (os.tmpdir || os.tmpDir)(), 'reduce-' + Math.random()
)
mkdirp.sync(tmpdir)
// /private/var  <--- soft link --- /var
tmpdir = fs.realpathSync(tmpdir)

var fixtures = path.resolve.bind(path, tmpdir)
var src = fixtures.bind(null, 'src')
var dest = fixtures.bind(null, 'build')
var pool = {}

mkdirp.sync(src())
mkdirp.sync(dest())

var write = function (file, n) {
  n = n || ''
  let base = path.basename(file, '.css')
  pool[base] = n
  let contents = base + n + '{}'
  if (base !== 'c') {
    contents = '@deps "./c";' + contents
  }
  fs.writeFileSync(file, contents)
}

function getExpectedContents(base) {
  return base + pool[base] + '{}'
}

function readDest(file) {
  return fs.readFileSync(dest(file), 'utf8')
}

write(src('c.css'))

var entries = [src('a.css'), src('b.css')]
entries.forEach(function (file) {
  write(file)
})

test('watch', function(t) {
  var changeNum = 3
  t.plan((changeNum + 1) * 3)
  var factorOpts = {
    common: 'c.css',
    needFactor: true,
  }
  reduce.watch()
    .on('error', console.log.bind(console))
    .on('change', next)
    .src(['a.css', 'b.css'], { basedir: src(), factor: factorOpts })
    .pipe(reduce.dest, dest())

  function next() {
    t.equal(
      readDest('a.css'),
      getExpectedContents('a'),
      [changeNum, 'a', pool.a].join(':')
    )
    t.equal(
      readDest('b.css'),
      getExpectedContents('b'),
      [changeNum, 'b', pool.b].join(':')
    )
    t.equal(
      readDest('c.css'),
      getExpectedContents('c'),
      [changeNum, 'c', pool.c].join(':')
    )
    change(this)
  }

  function change(w) {
    if (!changeNum--) {
      setTimeout(function() {
        w.close()
      }, 10)
      return
    }
    setTimeout(function() {
      var file = [src('c.css')].concat(entries)[changeNum % 3]
      var k = path.basename(file, '.css')
      var n = Math.floor(Math.random() * 10) + 1 + pool[k]
      write(file, n)
    }, 200)
  }

})

