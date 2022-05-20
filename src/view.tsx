import { on, createEffect, createMemo, createSignal, onMount } from 'solid-js'
import { Game, make_position } from './game'
import { loop, Vec2 } from 'soli2d'
import Mouse from './mouse'

import { read, owrite, DragDecay } from './play'


const App = () => {

  let game = new Game()

  return (<vpro>
    <Grid game={game} atoms={game.atoms}/>
      </vpro>)

}


const Grid = (props) => {


   let _drag_select_decay = createSignal()

   let _drag_decay = createSignal()
   let $grid

   let m_drag_decay = createMemo(() => read(_drag_decay))
   let m_drag_select_decay = createMemo(() => read(_drag_select_decay))

   let _update = createSignal([16, 16], { equals: false })
   let update = createMemo(() => read(_update))

   onMount(() => {
    let mouse = new Mouse($grid).init()

    loop((dt, dt0) => {
      mouse.update(dt, dt0)

      owrite(_update, [dt, dt0])

      let { drag } = mouse

      if (drag && !drag.move0) {
        let res = props.atoms.find(_ => _.on(...drag.start))
        
        if (res) {
        owrite(_drag_decay, new DragDecay(drag, res.pos.vs, res))
        } else {
         owrite(_drag_select_decay, new DragDecay(drag, Vec2.make(...drag.start), make_position(0, 0)))
        }
      }
        })
      })

  // TODO abstract
  createEffect(() => {
    let decay = m_drag_decay()
    if (decay) {
      createEffect(on(update, (dt, dt0) => {
          
         decay.target.pos.vs = decay.move
         
         if (decay.drop) {
           owrite(_drag_decay, undefined)
         }
       }))
    }
    })

  createEffect(() => {
    let decay = m_drag_select_decay()

    if (decay) {


      createEffect(on(update, (dt, dt0) => {
    
      decay.target.vs = decay.translate.clone

      if (decay.drop) {
      props.atoms.forEach(_ => _.selected = false)
      props.atoms
      .filter(_ => _.in_rect(decay.start, decay.target.vs))
      .forEach(_ => _.selected = true)
       owrite(_drag_select_decay, undefined)
      }
      }))
    }

      })


  const select_box_style = (start: Vec2, w: number, h: number) => ({
    transform: `translate(${start.x}px, ${start.y}px)`,
    width: `${w}px`,
    height: `${h}px`
    })

  return (<grid ref={$grid}>
      <For each={props.atoms}>{ atom =>
        <Atom atom={atom}/>
      }</For>
      <Show when={m_drag_select_decay()}>{ decay =>
      <div class="selection" style={select_box_style(decay.start, decay.target.x, decay.target.y)}/>
      }</Show>
      </grid>)
}

const Atom = (props) => {

  let style = () => ({
    transform: `translate(${props.atom.x}px, ${props.atom.y}px)`
  })

  let klass = () => ['handle',
      props.atom.selected ? 'selected' :''
  ]

  return (<atom class={klass().join(' ')} style={style()}>
      {props.atom.name}
      </atom>)
}

export default App
