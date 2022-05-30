import { on, createResource, batch, createEffect, createSignal, createMemo, mapArray } from 'solid-js'
import { read, write, owrite } from './play'
import tau from './tau'

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

    this._source = createSignal(`% V Aid Prolog Language
:- dynamic(white/1).

  `)

    this.r_consult = createResource(this._source[0], _pq(_ => tau.consult(_)))

    this.r_whites = createResource("white(X).", _pq(_ => tau.all(_)))
    let m_whites = createMemo(() => {
      let res = read(this.r_whites)
      if (res) {
        return res.X
      }
      return []
    })

    createEffect(() => {
      let whites = m_whites()


      if (this.oboard) {
        this.oboard.squares = whites.map(_ => 'white@' + _.split('-').join(''))
      }

    })

    createEffect(on(this.r_consult[0], () => {
      console.log('Error', this.r_consult[0].error)
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
    owrite(this._source, content)
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

