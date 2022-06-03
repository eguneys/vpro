import { onError, on, createResource, batch, createEffect, createSignal, createMemo, mapArray } from 'solid-js'
import { read, write, owrite } from './play'
import tau from './tau'
import { file_store } from './storage'

import { puzzles, fen_pieses } from './data'

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

    this.list = make_list2('list', [])



    this._source = createSignal(file_store.get() || base_source)

    this.r_consult = createResource(this._source[0], _pq(_ => tau.consult(_)))

    this.r_whites = createResource("color(Color, X).", _pq(_ => tau.all(_)))
    let m_colors = createMemo(() => {
      let res = read(this.r_whites)
      console.log(res)
      if (res) {
        return zip(res.Color, res.X.map(_ => _.split('-').join('')), _ => _.join('@'))
      }
      return []
    })

    this.r_pieces = createResource("piece(Color-Role-X).", _pq(_ => tau.all(_)))
    let m_pieces = createMemo(() => {
      let res = read(this.r_pieces)
      if (res) {
        return zip(zip(res.Color, res.Role, _ => _.join('')), res.X.map(_ => _.split('-').join('')), _ => _.join('@'))
      }
      return []
    })

    this.r_list = createResource("list(Ls).", _pq(_ => tau.all(_)))
    let m_list = createMemo(() => {
      let res = read(this.r_list)

      if (!res) {
        this.list.pieses = []
        return
      }
      let pieses = res.Ls.map(_ => {
        let [K, F1, F2, R] = _.map(_ => _.split('-').join(''))
        return [`wk@${K}`, `wp@${F1}`, `wp@${F2}`, `br@${R}`]
      })

      this.list.pieses = pieses

    })

    createEffect(() => {
      let pieces = m_pieces()
      if (this.oboard) {
        this.oboard.pieses = pieces
      }
    })

    createEffect(() => {
      let colors = m_colors()
      if (this.oboard) {
        this.oboard.squares = colors
      }

    })

    onError(_ => { console.log('error', _); if (this.ovim) { this.ovim.prompt = _ }})

    createEffect(on(this.r_consult[0], () => {
      if (!this.r_consult[0].error) {
        refetch(this.r_whites)
        refetch(this.r_pieces)
        refetch(this.r_list)
      }
    }))

    createEffect(on(() => this.r_whites[0].error, (error) => {
      if (this.ovim) {
          this.ovim.prompt = error ? `Error: ${error}` : ''
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


    let filter = 'mateIn1'

    let _puzzles = puzzles.filter(_ => _.tags.includes(filter))
    let res = _puzzles.slice(0, 10).map(_ => {
      let { fen, moves } = _

      let pieses = fen_pieses(_.fen)

      let [f, s] = moves.split(' ')

      let src = f.slice(0, 2),
        dst = f.slice(2, 4)

      let p = pieses.find(_ => _.slice(-2) === src)
      let c= pieses.find(_ => _.slice(-2) === dst)
      pieses = pieses.filter(_ => _ !== p)
      pieses = pieses.filter(_ => _ !== c)

      let new_p = p.split('@')[0] + '@' + dst

      pieses.push(new_p)

      return pieses
    })
    console.log(res.map((_, i) => `board${i}([${_.map(_ => _.split('@')[0].split('').join('-') + '-(' +  _.split('@')[1].split('').join('-') + ')')}]).`).join('\n'))

    this.list = make_list(filter, _puzzles)

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

function uci_s(uci: string) {
  return [uci.slice(0, 2), uci.slice(2, 4), uci.slice(2, 4), uci.slice(2, 4)]
}

function make_list2(name: string, list: Array<Pieses>) {
  let _pieses = createSignal(list)

  return {
    get pieses() {
      return read(_pieses)
    },
    set pieses(pieses: Array<Pieses>) {
      owrite(_pieses, pieses)
    }
  }
}


function make_list(name: string, list: Array<Puzzle>) {

  let m_pieses = list.map(_ => {

    let m_fen = fen_pieses(_.fen)

    let last = uci_s(_.moves.split(' ')[0]),
      solution = uci_s(_.moves.split(' ')[1])

    let m_moves = last.map(_ => `orange@${_}`)
    .concat(solution.map(_ => `black@${_}`))

    return {
      m_fen,
      m_moves
    }
  })

  return {
    get name() {
      return name
    },
    get pieses() {
      return m_pieses
    },
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

