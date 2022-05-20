import { batch, createEffect, createSignal, createMemo, mapArray } from 'solid-js'
import { read, write, owrite } from './play'
import { Vec2 } from 'soli2d'
import Tau from './tau'

export type OAtom = string
export type OPair = Array<Atom|OPair>

export class Game {

  get atoms() {
    return this.a_atoms.values
  }

  get selected_atoms() {
    return this.atoms.filter(_ => _.selected)
  }

  get logs() {
    return this.a_logs.values
  }

  constructor() {

    this.tau = new Tau()
    this.a_logs = make_array([], make_log)
    this.a_atoms = make_array([], _ => make_atom(this, _))
    
  }


  async init() {

    let session1 = `
      :- dynamic(one/2).
      session(1).
    `

    await this.tau.consult(session1)


    let {X} = await this.tau.one("session(X).")
    console.log(X[0])

    await this.tau.one("assertz(one(1, 2)).")

    let res = await this.tau.one("one(1, 2).")

    console.log(res)

  }
  

}

function make_log(log: string) {

  return {
    get value() { return log }
  }
}

const bare_atom = n => atom_key('a', n)
const pair_atom = n => atom_key('p', n)

function atom_key(type: string, name: string) {
  let id = atom_id_gen()

  return `${id} ${type} ${name}`
}

function atom_itn(atom_key: AtomKey) {
  return atom_key.split(' ')
}

function make_atom(game: Game, atom_key: AtomKey) {

  let [id, type, name] = atom_itn(atom_key)
  let _name = createSignal(name)

  let pos = make_position(10, 10)

  let m_rectangle = createMemo(() => [pos.x, pos.y, 30, 30])

  let _selected = createSignal(false)

  return {
    get key() { return atom_key },
    get name() { return read(_name) },
    get x() { return pos.x },
    get y() { return pos.y },
    on(x: number, y: number) {
      return hit_rectangle(...m_rectangle(), x, y)
    },
    in_rect(xy: Vec2, wh: Vec2) {
      return in_rectangle(m_rectangle(), [xy.x, xy.y, wh.x, wh.y])
    },
    set selected(b: boolean) {
      owrite(_selected, b)
    },
    get selected() {
      return read(_selected)
    },
    pos
  }

}

export function make_position(x, y) {
  let _x = createSignal(x, { equals: false })
  let _y = createSignal(y, { equals: false })

  let m_p = createMemo(() => point(read(_x), read(_y)))

  let m_vs = createMemo(() => Vec2.make(read(_x), read(_y)))

  return {
    get point() { return m_p() },
    get x() { return read(_x) },
    set x(v: number) { owrite(_x, v) },
    get y() { return read(_y) },
    set y(v: number) { owrite(_y, v) },
    set vs(vs: Vec2) { batch(() => {
      owrite(_x, vs.x), owrite(_y, vs.y)
     })
    },
    get vs() { return m_vs() }
  }
}


function make_array<A, B>(arr: Array<A>, map: (_: A) => B) {
  let _arr = createSignal(arr, { equals: false })

  let _ = createMemo(mapArray(_arr[0], map))

  return {
    get values() { return _() },
    get head() { return _()[0] },
    push(a: A) {
      write(_arr, _ => _.push(a))
    },
    enqueue(a: A) {
      write(_arr, _ => _.unshift(a))
    },
    dequeue() {
      let res
      write(_arr, _ => res = _.shift())
      return res
    },
    remove(a: A) {
      write(_arr, _ => {
        _.splice(_.indexOf(a), 1)
      })
    },
    clear() {
      owrite(_arr, [])
    }
  }
}


function hit_rectangle(x, y, w, h, a, b) {
  return x <= a && a <= x + w && y <= b && b <= y + h
}

type Rect = [number, number, number, number]
function in_rectangle(a: Rect, b: Rect) {

  let aleft = a[0],
    aright = a[0] + a[2],
    atop = a[1],
    abottom = a[1] + a[3]

  let bleft = b[0],
    bright = b[0] + b[2],
    btop = b[1],
    bbottom = b[1] + b[3]

  return !(bleft > aright || 
           bright < aleft || 
           btop > abottom ||
           bbottom < atop);
}




const make_id_gen = () => { let id = 0; return () => ++id }
const id_gen = make_id_gen()
const atom_id_gen = make_id_gen()


export type Point = string

export function point(x: number, y: number) {
    return `${x} ${y} ${id_gen()}`
}

export function point_xy(p: Point) {
    return p.split(' ').map(_ => parseFloat(_))
}

export const point_zero = point(0, 0)




