import { createSignal, createMemo, createEffect, createResource, on } from 'solid-js'
import { read, write, owrite } from './play'
import { splitNoParen } from './tau'
import { uci_uci, uci_char } from './path'

function move_path(theme_moves: any) {
  let { theme, moves } = theme_moves

  return moves.map(move => {
    let pp = uci_char(uci_uci(move))
    return `${pp} ${move} { ${theme} }`
  })
}

function parse_move(move: string) {
  let [,f,r,f2,r2] = move.match(/(\w)-(\w)-\((\w)-(\w)\)/)

  return [f,r,f2,r2].join('')
}

export class Hello {


  get hellos() {
    return this.a_hello.hellos
  }


  constructor() {

    this.a_hello = make_hello(this)
  }
}


const fetch_puzzles = async () =>
console.log('here') ||
  (await fetch(`http://localhost:9663/hello`, { method: 'post' })).json()

const make_hello = (hello: Hello) => {

  let id = createSignal(3)
    const r_puzzles = createResource(id[0], fetch_puzzles)
    const m_puzzles = createMemo(() => {
      let res = read(r_puzzles)
      return res?.js.map(_ => {

          
        let res = splitNoParen(_.rest.slice(1, -1)).map(_ => {
          let m = _.match(/([^\(]*)\(\[(.*)\]\)$/)
          if (m) {
            let [,theme,moves] = m

            return {
              theme,
              moves: moves.split(',').map(parse_move)
            }
          } else {
            return parse_move(_)
          }
        })

        let [move, ...rest] = res

        let mss = [
          { theme: 'blunder', moves: [move]},
          ...rest
        ]

        let res_moves = []
        mss.reduce((path, move) => {

          let { theme, moves } = move

          let pp = uci_char(uci_uci(move))
          return `${pp} ${move} { ${theme} }`
          _moves.push(move_path(move))
        })




        let [, fen] = _.tb.match(/\[([^\]]*)\]/)
        let board = fen.split(',').map(_ => {
          let [, color, role, file, rank] = _.match(/(\w)-(\w)-\((\w)-(\w)/)
          return `${color}${role}@${file}${rank}`
        })
        return {
          moves,
          board
        }
      })
    })


  return {
    get hellos() {
      return m_puzzles()
    }
  }
}
