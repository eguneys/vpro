import { on, createSignal, createEffect, createMemo } from 'solid-js'
import { read, write, owrite } from './play'

export function make_trigger() {
  let _trigger = createSignal(false)

  createEffect(() => {
    if (read(_trigger)) {
      owrite(_trigger, false)
    }
  })

  return {
    get on() { return read(_trigger) },
    reset() { owrite(_trigger, true) }
  }
}

export function make_elapsed_r(update) {

  let t_reset = make_trigger()

  let m_value = createMemo((prev) => {
    let [dt, dt0] = update()
    return t_reset.on ? 0 : prev + dt
  }, 0)

  return {
    get value() { return m_value() },
    reset() { t_reset.reset() }
  }
}

export function make_elapsed(update) {
  return createMemo((prev) => {
    let [dt, dt0] = update()
    return prev + dt
  }, 0)
}

export function make_interval(update, t: number) {

  let _ = createMemo(on(make_elapsed(update), (e, e0) =>
                        e >= t && Math.floor(e0 / t) !== Math.floor(e / t)))

                        return createMemo((prev) => _() ? prev : prev + 1, 0)
}

export function make_run(update, t: number) {
  let _ = on(make_elapsed(update), e => e <= t)

  return createMemo(on(_, 
                       (_, _0, prev) => 
                       _ !== _0 ? (_ ? prev + 1 : -1) : 
                         !_ ? prev : prev + 1),
                       0)
}

export function make_flip<A>(update, t: number, _a: Accessor<A> = () => true, _b: Accessor<A> = () => false) {

  let a = typeof _a === 'function' ? _a : () => _a
  let b = typeof _b === 'function' ? _b : () => _b

  return createMemo(on(make_elapsed(update), e => e <= t ? a() : b()))
}

export function make_condition<A>(c: Accessor<boolean>, _a: Accessor<A> = () => true, _b: Accessor<A> = () => false) {

  return createMemo(on(c, v => v ? _a() : _b()))
}
