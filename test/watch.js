'use strict'

const test = require('tap').test
const reduce = require('..')
const path = require('path')
const mkdirp = require('mkdirp')
const fs = require('fs')
const os = require('os')

var tmpdir = path.join(
  (os.tmpdir || os.tmpDir)(), 'reduce-' + Math.random()
)
mkdirp.sync(tmpdir)
// /private/var  <--- soft link --- /var
tmpdir = fs.realpathSync(tmpdir)

const fixtures = path.resolve.bind(path, tmpdir)
const src = fixtures.bind(null, 'src')
const dest = fixtures.bind(null, 'build')
const pool = {}

mkdirp.sync(src())
mkdirp.sync(dest())

const write = function (file, n) {
  n = n || ''
  let base = path.basename(file, '.css')
  pool[base] = n
  let contents = base + n + '{}'
  if (base !== 'c') {
    contents = '@external "./c";' + contents
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

const entries = [src('a.css'), src('b.css')]
entries.forEach(write)

test('watch', function(t) {
  let count = 3
  let b = reduce.create({ basedir: src() })

  reduce.src(['a.css', 'b.css'], { cwd: src() })
    .pipe(reduce.watch(b, {
      common: 'c.css',
      groups: '+(a|b).css',
    }))
    .on('bundle', function (bundleStream) {
      bundleStream.pipe(reduce.dest(dest()))
        .on('data', () => {})
        .once('finish', () => setTimeout(next, 50))
    })


  function next() {
    t.equal(
      readDest('a.css'),
      getExpectedContents('a'),
      [count, 'a', pool.a].join(':')
    )
    t.equal(
      readDest('b.css'),
      getExpectedContents('b'),
      [count, 'b', pool.b].join(':')
    )
    t.equal(
      readDest('c.css'),
      getExpectedContents('c'),
      [count, 'c', pool.c].join(':')
    )
    if (!count--) {
      b.close()
      t.equal(count, -1)
      return t.end()
    }
    let file = [src('c.css')].concat(entries)[count % 3]
    let k = path.basename(file, '.css')
    let n = Math.floor(Math.random() * 10) + 1 + pool[k]
    write(file, n)
  }

})

