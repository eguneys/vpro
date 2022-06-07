import { onError, on, createResource, batch, createEffect, createSignal, createMemo, mapArray } from 'solid-js'
import { read, write, owrite } from './play'
import tau from './tau'
import { cursor_store, file_store } from './storage'

import { puzzles, fen_pieses } from './data'

import { uci_char, uci_uci } from './path'

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

function ab(a_b: string) {
  return a_b.split('-').join('')
}

export class Pro {

  get content() {
    return read(this._source)
  }

  ovim!: OVim

  on_mount() {
    this.ovim.cursor = JSON.parse(cursor_store.get()).cursor
  }

  constructor() {

    this.list = make_list2('list', [])

    this._source = createSignal(file_store.get() || base_source)

    this.r_consult = createResource(this._source[0], _pq(_ => tau.consult(_)))

    this.r_whites = createResource("color(Color, X).", _pq(_ => tau.all(_)))
    let m_colors = createMemo(() => {
      let res = read(this.r_whites)
      if (res) {
        console.log(res)

        return zip(res.Color, res.X.map(_ => _.split('-').join('')), _ => _.join('@'))
      }
      return []
    })

    this.r_pieces = createResource("piece(Color-Role-X).", _pq(_ => tau.all(_)))
    let m_pieces = createMemo(() => {
      let res = read(this.r_pieces)
      if (res) {
        console.log(zip(zip(res.Color, res.Role, _ => _.join('')), res.X.map(_ => _.split('-').join('')), _ => _.join('@')))
        return zip(zip(res.Color, res.Role, _ => _.join('')), res.X.map(_ => _.split('-').join('')), _ => _.join('@'))
      }
      return []
    })

    this.r_list = createResource("ls(Ls).", _pq(_ => tau.all(_)))
    let m_list = createMemo(() => {
      let res = read(this.r_list)

      console.log(res)
      if (!res) {
        this.list.pieses = []
        return
      }

      let _res = res.Ls.flatMap(Ls => {
        let base_path = ''
        return Ls.flatMap(_ => {
          let c = _.match(/check_ray\(w-[r|q|b|n]-\(([^\)]*)\)-\(w-[r|q|b|n]-\(([^\)]*)\)/)
          if (c) {
            let check_uci = uci_uci(c.slice(1,3).map(ab).join(''))

            let res= `${base_path}${uci_char(check_uci)} ${check_uci.orig+check_uci.dest} { check }`

            base_path += uci_char(check_uci)

            return res
          }
          c = _.match(/flee\(b-k-\(([^\)]*)\),b-k-\(([^\)]*)\)/)
          if (c) {
            let check_uci = uci_uci(c.slice(1,3).map(ab).join(''))
            let res = `${base_path}${uci_char(check_uci)} ${check_uci.orig+check_uci.dest} { flee }`

            base_path += uci_char(check_uci)
            return res
          }
          return []
        })
      })

      console.log(_res)
      _res = [...new Set(_res)]
      return _res
    })

    createEffect(() => {
      let lines = m_list()
      if (this.oreplay) {
        this.oreplay.moves = lines
      }
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


    let filter = 'mateIn2'

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

      pieses = pieses.map(_ => (_[0] === 'w' ? 'b' : 'w') + _.slice(1, _.length))

      return pieses
    })
    console.log(res.map((_, i) => `mateIn2${i}([${_.map(_ => _.split('@')[0].split('').join('-') + '-(' +  _.split('@')[1].split('').join('-') + ')')}]).`).join('\n'))

    //this.list = make_list2(filter, _puzzles)

  }

  on_command(command: string, content: string) {
    switch (command) {
      case ':copy':
        navigator.clipboard.writeText(content)
        break
      case ':w':
        owrite(this._source, content)
        file_store.set(content)
        cursor_store.set(JSON.stringify({ cursor: this.ovim.cursor }))
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

