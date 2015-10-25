import depsify from './depsify'
import EventEmitter from 'events'

export default function () {
  return new Reduce()
}

class Reduce extends EventEmitter {
  constructor() {
    super()
  }
  src(pattern, opts) {
    let b = depsify(pattern, opts)
    let onerror = this.emit.bind(this, 'error')

    b.on('log', this.emit.bind(this, 'log'))
    b.on('error', onerror)

    return b.bundle().on('error', onerror)
  }
}

