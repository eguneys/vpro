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
  (await fetch(`http://localhost:8080/hello`)).json()

const make_hello = (hello: Hello) => {

  let id = createSignal(3)
    const r_puzzles = createResource(id[0], fetch_puzzles)
    const m_puzzles = createMemo(() => {
      let res = read(r_puzzles)
      return res
    })



  return {
    get hellos() {
      return m_puzzles()
    }
  }
}
