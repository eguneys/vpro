import { on, createResource, batch, createEffect, createSignal, createMemo, mapArray } from 'solid-js'
import { read, write, owrite } from './play'
import tau from './tau'
import { file_store } from './storage'

const base_source = `
% V Aid Prolog Language

:- dynamic(white/1).
:- dynamic(orange/1).
:- dynamic(black/1).

color(white, Pos) :- white(Pos).
color(orange, Pos) :- orange(Pos).
color(black, Pos) :- black(Pos).
`

function zip<A, B, C>(as: Array<A>, bs: Array<B>, fn: (a: A, b: B) => C) {
  return as.map((a, i) => fn([a, bs[i]]))
}

function find_lines(error) {
  if (error?.id === 'line') {
    return error.args[0].value
  }
  return error?.args?.flatMap(find_lines) || []
}

export class Pro {

  get content() {
    return read(this._source)
  }

  ovim!: OVim

  constructor() {

    this._source = createSignal(file_store.get() || base_source)

    this.r_consult = createResource(this._source[0], _pq(_ => tau.consult(_)))

    this.r_whites = createResource("color(Color, X).", _pq(_ => tau.all(_)))
    let m_colors = createMemo(() => {
      let res = read(this.r_whites)
      if (res) {
        return zip(res.Color, res.X.map(_ => _.split('-').join('')), _ => _.join('@'))
      }
      return []
    })

    createEffect(() => {
      let colors = m_colors()


      if (this.oboard) {
        this.oboard.squares = colors
      }

    })

    createEffect(on(this.r_consult[0], () => {
      if (!this.r_consult[0].error) {
        refetch(this.r_whites)
      }
    }))

    createEffect(on(() => this.r_consult[0].error, (error) => {
      let lines = find_lines(error)
      if (!this.ovim) {
        return
      }
      this.ovim.clear_lines()
      lines.forEach(_ => {
        this.ovim.line_klass(_-2, 'error')
      })
    }))
  }

  on_command(command: string, content: string) {
    switch (command) {
      case ':copy':
        navigator.clipboard.writeText(content)
        break
      case ':w':
        owrite(this._source, content)
        file_store.set(content)
        break
      case ':clear':
        file_store.remove()
        owrite(this._source, base_source)
        this.ovim.content = base_source
        break
      default:
          owrite(this._source, content)
        break
    }
  }
}



function refetch(resource: Resource) {
  let [_, { refetch }] = resource
  refetch()
}

let _pq = pqueue()
export function pqueue() {
  let queue = Promise.resolve()


  return (fn) => {
    return _ => {
      return new Promise((resolve, reject) => {
        queue = queue.then(() => fn(_).then(resolve).catch(reject))
      })
    }
  }
}

