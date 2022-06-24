import { on, createEffect, createMemo, createSignal, onMount } from 'solid-js'
import { Game, make_position } from './game'
import { loop, Vec2 } from 'soli2d'
import Mouse from './mouse'
import { make_wander } from './rigid'

import { read, owrite, DragDecay } from './play'

import { Help } from './help'
import { Pro } from './pro'

import OVim from 'ovim'
import VChessboard from 'vchessboard'
import VChessreplay from 'vchessreplay'

import { Hello } from './hello'



const App = () => {

  let hello = new Hello()


  return (<>
    <div class='vlist'>
    <For each={hello.hellos}>{ hello =>
      <div class='vlist-item'>
        <VChessBoard pieses={hello.board}/>
        <VChessReplay moves={hello.moves} on_hover={hello.on_hover}/>
      </div>
    }</For>
    </div>
    </>)
}





const VChessReplay = props => {
  let $vreplay
  onMount(() => {
    let api = VChessreplay($vreplay, { on_hover(path) { props.on_hover?.(path) } })
    api.moves = props.moves
    })

 return (<div class='vreplay-wrap' ref={$vreplay}></div>)
}




const VChessBoard = props => {
  let $vboard
  onMount(() => {
    let api = VChessboard($vboard)
    api.pieses = props.pieses
    })

 return (<div class='vchess-wrap' ref={$vboard}></div>)
}

const VList = props => {
  return (<div class='vlist'>
    <h2> {pro.list.name} </h2>
      <ol>
        <For each={pro.list.pieses}>{ pieses =>
          <li><VChessBoard moves={pieses.m_moves} pieses={pieses.m_fen}/></li>
        }</For>
      </ol>
    </div>)
}

const OldProStuff = () => {

  let pro = new Pro()
  let $vcode,
      $vboard,
      $vreplay

  onMount(() => {
   pro.ovim = OVim($vcode, { content: pro.content, on_command(command, content) { pro.on_command(command, content)}}) 

   pro.oboard = VChessboard($vboard)

   pro.oreplay = VChessreplay($vreplay)
    pro.on_mount()
   })

  return (<>
      <div class='v-wrap'>
        <div class='vpro'>
          <div ref={$vcode} class='v-code'></div>
          <div ref={$vboard} class='v-board'></div>
          <div ref={$vreplay} class='v-replay'></div>
        </div>
      </div>
    </>)
}

const VPro = () => {

  let game = new Game()

  return (<vpro>
    <Grid game={game} atoms={game.atoms}/>
    <Files game={game}/>
    <Flash game={game} flash={game.flash} />
    <Help game={game} help={game.help}/>
  </vpro>)

}

const Files = (props) => {

  const style = (x, y) => ({
    transform: `translate(${x}px, ${y}px)`
     })


  return (<div class="overlay files">
      <For each={props.game.files}>{ file =>
      <FloatAround update={props.game.m_update}>{ (x, y) =>
        <span style={style(x, y)} class="file">{file}</span>
      }</FloatAround>
      }</For>
      </div>)
}

const FloatAround = (props) => {
  
  let w_wander = make_wander(Vec2.make(50, 50), {
  mass: 1000,
  air_friction: 0.8,
  max_speed: 1,
  max_force: 0.1 
 })

 let vs = createMemo(on(props.update, ([dt, dt0]) => {
    w_wander.update(dt, dt0)
    return Vec2.make(w_wander.x, w_wander.y)
    }))

  return createMemo(() => props.children(vs().x, vs().y))
}

const Flash = (props) => {

  return (<Show when={props.flash}>{ value =>
    <div class="flash"> {value} </div>
      }</Show>)
  
}


const Grid = (props) => {


   let _drag_select_decay = createSignal()

   let _drag_decay = createSignal()
   let $grid

   let m_drag_decay = createMemo(() => read(_drag_decay))
   let m_drag_select_decay = createMemo(() => read(_drag_select_decay))

   let _update = createSignal([16, 16], { equals: false })
   let update = createMemo(() => read(_update))


   let _hover_atom = createSignal()
   let m_hover_atom = createMemo(() => read(_hover_atom))


   // TODO abstract
   createEffect(on(m_hover_atom, (value, prev) => {
      if (value && !prev) {
       value.hovering = true
       }
       if (!value && prev) {
       prev.hovering = false
       }
       if (value && prev) {
       prev.hovering = false
       }
       }))


   createEffect(on(m_drag_decay, (value, prev) => {
     if (value && !prev) {
       value.target.dragging = true
       }
       if (!value && prev) {
       prev.target.dragging = false
       }
    }))


   onMount(() => {
    let mouse = new Mouse($grid).init()

    loop((dt, dt0) => {
      mouse.update(dt, dt0)

      owrite(_update, [dt, dt0])

      let { click, hover, drag } = mouse


      if (click) {
      props.atoms.forEach(_ => {
          if (_.on_close(...click)) {
            _.dispose()
          }
          if (!_.on_full(...click)) { 
          _.editing = false
          }
          })
      }


      if (hover) {
        let res = props.atoms.find(_ => _.on(...hover))
        if (res) {
          owrite(_hover_atom, res)
        } else {
          owrite(_hover_atom, undefined)
        }
      } else {
          owrite(_hover_atom, undefined)
      }

      if (drag && !!drag.move0) {
      let inject_drag = props.atoms.find(_ => _.on_inject_drag())

       if (inject_drag) {
        owrite(_drag_decay, new DragDecay(drag, inject_drag.pos.vs, inject_drag, true))
       }
      }

      if (drag && !drag.move0) {


        let ghost = props.atoms.find(_ => _.on_ghost(...drag.start))

        if (ghost) {
          props.game.dup_atom(ghost)
          return
        }

        let res = props.atoms.find(_ => _.on(...drag.start))
        if (res) {
        owrite(_drag_decay, new DragDecay(drag, res.pos.vs, res))
        } else {
         owrite(_drag_select_decay, new DragDecay(drag, Vec2.make(...drag.start), make_position(0, 0)))
        }
      }
        })
      })

  createEffect(() => {
    let decay = m_drag_decay()
    if (decay) {
      createEffect(on(update, (dt, dt0) => {
          
         decay.target.pos.vs = decay.move
         
         if (decay.drop) {
           props.game.interaction_drag_box()
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

  const grid_style = () => ({
      "font-size": "2em"
  })

  const select_box_style = (start: Vec2, w: number, h: number) => ({
    transform: `translate(${start.x}px, ${start.y}px)`,
    width: `${w}px`,
    height: `${h}px`
    })

  return (<grid ref={$grid} style={grid_style()}>
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
      props.atom.dragging ? 'dragging' :'',
      props.atom.selected ? 'selected' :''
  ]

  return (<atom ref={_ => setTimeout(() => props.atom.$_ = _) } class={klass().join(' ')} style={style()}>
<div class="wrap">
      
      <Show when={props.atom.editing === "name"}
       fallback={
       <span class="name" onClick={_ => props.atom.editing = props.atom.allow_edit}>{props.atom.name}</span>
       }>
       <FocusInput onKeyUp={(_, value) => props.atom.editing_name(_.keyCode, value) }/>
       </Show>(
      <Show when={props.atom.editing === "value"}
       fallback={
       <span class="value" onClick={_ => props.atom.editing = "value"}>{props.atom.value}</span>
       }>
       <FocusInput onKeyUp={(_, value) => props.atom.editing_value(_.keyCode, value) }/>
       </Show>
      )
</div>
      <span class="target"/>
      <Show when={props.atom.show_ghost}>
        <span ref={_ => setTimeout(() => props.atom.$ghost = _)} class="ghost">{props.atom.name}</span>
      </Show>
      </atom>)
}

const FocusInput = (props) => {
let $ref
  onMount(() => {

$ref.focus()
      })
  return (<input ref={$ref} type="text" onKeyUp={_ => props.onKeyUp(_, $ref.value)}/>)
}

export default App
