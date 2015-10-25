import lazypipe from 'lazypipe'
import watchify from 'watchify'
import depsify from './depsify'
import run from 'run-callback'
import EventEmitter from 'events'

export default function watch(opts) {
  return new Watch(opts)
}

class Watch extends EventEmitter {
  constructor(opts) {
    super()
    this.options = opts
  }
  src(pattern, opts) {
    let b = depsify(pattern, opts)
    watchify(b, this.options)

    let onerror = this.emit.bind(this, 'error')
    let bundle = () => {
      run(() => {
        let s = b.bundle().on('error', onerror)
        if (this._lazypipe) {
          return s.pipe(this._lazypipe().on('error', onerror))
        }
        return s
      }, (err) => {
        if (err) {
          return onerror(err)
        }
        // allow to listen for bundling done
        this.emit('change')
      })
    }

    b.on('log', this.emit.bind(this, 'log'))
    b.on('error', onerror)
    b.on('update', bundle)

    // allow lazypipe to collect transforms
    process.nextTick(bundle)

    this.b = b

    return this
  }
  close() {
    this.b.close()
  }

  pipe() {
    if (!this._lazypipe) {
      this._lazypipe = lazypipe()
    }
    this._lazypipe = this._lazypipe.pipe.apply(this._lazypipe, arguments)
    return this
  }

}

