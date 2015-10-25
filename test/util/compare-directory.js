import path from 'path'
import fs from 'fs'
import glob from 'globby'

function readFile(file) {
  return fs.readFileSync(file, 'utf8').trim()
}

export default function (actual, expected, t, msg, normalize) {
  if (typeof msg !== 'function') {
    msg = function (m) {
      return m
    }
  }
  let actualFiles = glob.sync(['**/*.css', '**/*.png'], { cwd: actual })
  let expectedFiles = glob.sync(['**/*.css', '**/*.png'], { cwd: expected })

  normalize = normalize || function (f) {
    return f
  }
  let normalized = actualFiles.map(normalize).sort()
  expectedFiles.sort()

  t.same(normalized, expectedFiles, msg('filenames should match'))

  let files = actualFiles
  files.forEach(function (f) {
    t.equal(
      readFile(path.resolve(actual, f)),
      readFile(path.resolve(expected, normalize(f))),
      msg(f)
    )
  })
}

