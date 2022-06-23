import { createSignal, createMemo, createEffect, createResource, on } from 'solid-js'
import { read, write, owrite } from './play'


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
        let [__, fen] = _.tb.match(/\[([^\]]*)\]/)
        return fen.split(',').map(_ => {
          let [___, color, role, file, rank] = _.match(/(\w)-(\w)-\((\w)-(\w)/)
          return `${color}${role}@${file}${rank}`
        })
      })
    })



  return {
    get hellos() {
      return m_puzzles()
    }
  }
}
