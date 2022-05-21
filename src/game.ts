import { ticks } from './shared'
import { on, createResource, batch, createEffect, createSignal, createMemo, mapArray } from 'solid-js'
import { read, write, owrite } from './play'
import { loop, Vec2 } from 'soli2d'
import { create_delayed, make_elapsed_r, make_interval } from './make_util'
import tau from './tau'
import base0 from './pls/base0.pl'
import session0 from './pls/session0.pl'
import session1 from './pls/session1.pl'

export type OAtom = string
export type OPair = Array<Atom|OPair>

function fact(name: string, value: string) {
  return `${name} ${value}`
}

function refetch(resource: Resource) {
  let [_, { refetch }] = resource
  refetch()
}

let _pq = pqueue()

export class Game {

  get atoms() {
    return this.m_atoms().slice(0).sort((a, b) => a.dragging ? (b.dragging ? 0 : 1) : (b.dragging ? -1 : 0))
  }

  get selected_atoms() {
    return this.atoms.filter(_ => _.selected)
  }


  get flash() {
    return this.m_flash()
  }


  get files() {
    return this.m_files()
  }


  async dup_atom(atom: AtomView) {
    let _r = atom.ghost_rectangle
    this._atom_pos_hint = make_position(_r[0], _r[1])
    await _pq(tau.one(`add_${atom.name}(${atom.value}).`))
    refetch(this.r_files)
  }

  async dispose_atom(atom: AtomView) {
    let res = await _pq(tau.one(`remove_${atom.name}(${atom.value}).`))
    refetch(this.r_files)
  }

  constructor() {
    

    let _update = createSignal([16, 16], { equals: false })
    loop((dt, dt0) => { owrite(_update, [dt, dt0]) })

    let m_update = () => read(_update)

    this.m_update = m_update

    let r_consult = createResource([base0, session1].join('\n'), _pq(_ => tau.consult(_)))
    let r_counter = createResource("counter(X).", _pq(_ => tau.one(_)))
    let r_time = createResource("time(X).", _pq(_ => tau.one(_)))


    createEffect(on(r_counter[0], () => {
      createEffect(on(make_interval(m_update, ticks.seconds), async (value, prev) => {
        if (!prev) { return }
        await _pq(_ => tau.one("tick."))
        refetch(r_time)
        refetch(r_counter)
      }))
    }))


    let r_files = createResource("file(X).", _pq(_ => tau.all(_)))
    let m_files = createMemo(() => {
      let res = read(r_files)

      if (res) {
        return res.X.map(file => fact("file", file))
      }
      return []
    })

    this.r_files = r_files
    this.m_files = createMemo(() => m_files().map(_ => _.split(' ')[1]))

    let m_time = createMemo(() => {
      let res = read(r_time)
      if (res === true) {
      } else if (res) {
        return res.X.map(time => fact("time", time))
      }
      return []
    })


    let m_counter = createMemo(() => {
      let res = read(r_counter)
      if (res === true) {
      } else if (res) {
        return res.X.map(counter => fact("counter", counter))
      }
      return []
    })


    this.m_flash = createMemo(() => {
      let res = read(r_counter)
      if (res === true) {
      } else if (res) {
        return res.X[0]
      }
    })

    let m_atoms = createMemo(() => {
      return [...m_files()]
      return [...m_counter(), ...m_time()]
    })

    this.m_atoms = createMemo(mapArray(m_atoms, _ => make_atom(this, _)))
  }

}

function make_log(log: string) {

  return {
    get value() { return log }
  }
}


function make_atom(game: Game, atom: Atom) {

  let [name, value] = atom.split(' ')
  let _name = createSignal(name)
  let _value = createSignal(value)
  let _dragging = createSignal(false)
  let _hovering = createSignal(false)
  let _editing = createSignal()

  let pos = game._atom_pos_hint || make_position(10, 10)


  let _inject_drag = createSignal(game._atom_pos_hint)


  let _$ = createSignal()
  let _$_ghost = createSignal()


  let m_rectangle = createMemo(() => [pos.x, pos.y, 30, 30])
  let m_close_rectangle = createMemo(() => [pos.x, pos.y, 10, 10])

  let m_size = createMemo(() => read(_$)?.getBoundingClientRect())

  let m_full_rectangle = createMemo(() => {
    let rect = m_size()
    if (rect) {
      return [pos.x, pos.y, rect.width, rect.height]
    } else {
      return [pos.x, pos.y, 0, 0]
    }
  })

  let m_ghost_rectangle = createMemo(() => {
    let _ = read(_$_ghost)
    if (_) {
      let rect = _.getBoundingClientRect()
      return [rect.left, rect.top, rect.width, rect.height]
    } else {
      return [0, 0, 0, 0]
    }
  })

  let _selected = createSignal(false)


  let m_dragging = createMemo(() => read(_dragging))
  let m_hovering = createMemo(() => read(_hovering))
  let m_delayed_hovering = create_delayed(m_hovering, () => (m_dragging() || m_hovering()) ? 0: ticks.half + ticks.lengths)
  let m_show_ghost = createMemo(() => !m_dragging() && m_delayed_hovering())


  return {
    set $ghost(ref: HTMLElement) { owrite(_$_ghost, ref) },
    set $_(ref: HTMLElement) { owrite(_$, ref) },
    get key() { return atom_key },
    get name() { return read(_name) },
    get value() { return read(_value) },
    get x() { return pos.x },
    get y() { return pos.y },
    on_close(x: number, y: number) {
      return hit_rectangle(...m_close_rectangle(), x, y)
    },
    on_full(x: number, y: number) {
      return hit_rectangle(...m_full_rectangle(), x, y)
    },
    on(x: number, y: number) {
      return hit_rectangle(...m_rectangle(), x, y)
    },
    on_ghost(x: number, y: number) {
      if (m_show_ghost()) {
        return hit_rectangle(...m_ghost_rectangle(), x, y)
      }
    },
    on_inject_drag() {
      let res = read(_inject_drag)
      if (res) {
        owrite(_inject_drag, false)
      }
      return res
    },
    get ghost_rectangle() {
      return m_ghost_rectangle()
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
    pos,
    get dragging() {
      return read(_dragging)
    },
    set dragging(value: boolean) {
      return owrite(_dragging, value)
    },
    get hovering() {
      return read(_hovering)
    },
    set hovering(value: boolean) {
      return owrite(_hovering, value)
    },
    get editing() {
      return read(_editing)
    },
    set editing(value: boolean) {
      return owrite(_editing, value)
    },
    get show_ghost() {
      return m_show_ghost()
    },

    editing_name(code: number, value: string) {
      if (code === 13) {
        owrite(_value, value)
        this.editing = false
      }
    },
    dispose() {
      game.dispose_atom(this)
    }
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
      owrite(_x, _ => lerp(_, vs.x)), owrite(_y, _ => lerp(_, vs.y))
     })
    },
    get vs() { return m_vs() },
    get clone() {
      return make_position(read(_x), read(_y))
    }
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


function lerp(a: number, b: number) {
  return a + (b - a) * 0.5
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

