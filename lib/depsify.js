import depsify from 'depsify'
import glob from 'globby'
import unpick from 'util-mix/unpick'
import thr from 'through2'
import postcss from 'postcss'
import url from 'postcss-custom-url'
import factor from 'factor-vinylify'

var urlProcessor = postcss(url)

export default function (pattern, opts) {
  opts = opts || {}
  let bopts = unpick(['factor'], opts)
  bopts.basedir = bopts.basedir || process.cwd()

  let entries = glob.sync(pattern, { cwd: bopts.basedir })
  let b = depsify(entries, bopts)

  b.plugin(factor, opts.factor)

  // rebase `url()`
  b.on('factor.pipeline', function (file, pipeline) {
    let labeled = pipeline.get('pack')
    let pack = b.pack()
    pack.pop()
    pack.push(thr.obj(function (row, _, next) {
      urlProcessor.process(row.source, { from: row.file, to: file })
        .then(function (result) {
          next(null, result.css)
        })
    }))
    labeled.splice(labeled.length - 1, 1, pack)
  })

  return b
}

