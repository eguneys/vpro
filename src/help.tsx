import { createEffect } from 'solid-js'

export const Disclaimer = (props) => {
  return (<>
      <p>
      This is an interactive tutorial on telling the machine how to play chess, using the logic language Prolog.
      </p>
      <p>
      Please use a laptop or a desktop on a fullscreen, and disable any browser plugins that intercepts your keyboard for this page.
      </p>
      </>)
}


export const Help = (props) => {

  return (<div class="overlay help">
    <Dynamic session={props.help} component={sessions[props.help.session - 1]}/>
      </div>)
}


const Right2Up2Down2 = (props) => {
  return (<>
    <div class="long">
      <p>

      How can we state the fact that "right2 of a is c", "b is d", "c is e", "d is f", "e is g", "f is h". That is two rights of a file. We can enumerate all of the facts and write them manually, or spot the pattern: "Two rights of X is, as we imagine there is a file Z where right of X is Z and right of Z is Y".
    </p>
    <p>
    Try to state this fact, using the comma operator as "logical and".
    </p>
    <p>
     For extra practice, state <span class="atom">left2(X-Y)</span>, <span class="atom">up2(X-Y)</span> and <span class="atom">down2(X-Y)</span> facts. Get comfortable for the next challenge where we answer the fact that "righter to a to h is the list [b,c,d,e,f,g]".
    </p>
    </div>
    </>)
}

const LeftWhenRightAnd = () => {
  return (<>
    <div class="long">
    <p>

    Let\'s tell machine "left of b is a" using the fact that "right of a is b".
    Because for all the facts that "right of X is Y" it is also a fact that "left of Y is X".
    </p>

    <p>
    <span class="atom"> left(X-Y) :- right(Y-X). </span>
    </p>

    <p>
      Notice you can still state <span class="atom"> left(b-a). </span> manually for all files and machine will correspond the same.
    </p>


    <p>
    <small>
      If you use a variable that is not a file, like <span class="atom">left(apple, x).</span>, it is still a fact, but machine won\'t correspond, because it also checks for a fact that X and Y are files, and "left of X is Y" to correspond. Just an implicit extra rule. Like this: <span class="atom"> show_arrow(X, Y) :- left(X, Y), file(X), file(Y).</span> . To define the fact to show an arrow, three other facts are stated by a logical "and" clause, (by a comma), meaning that "show an arrow from X to Y when left of X is Y and X is a file and Y is a file".
    </small>
    </p>


    <p>
    <small>
     If you want to practice, same concepts apply to 8 ranks, being they have up and down. So define the facts <span class="atom">rank(1)</span> thru 8. and <span class="atom">up(1-2)</span> and <span class="atom">down(X-Y)</span> in terms of up.
    </small>
    </p>
    </div>

    </>)
}

const RightOfFiles = () => {
  return (<>
<div class="short">
  <p>
   This gives order to files, because machine can answer "right of a is b".
  </p>
  <p>
   State all the facts for each file that has a right file neighbor.
   Notice "h" doesn't have a right file neighbor, so we don't state anything for right of "h".
  </p>
</div>
      </>)
}

const PairedWordsXVariable = () => {
  return (<>
<div class="long">
    <p>
     A <span class="atom">file(X)</span> structure just floats around.
     </p>
     <p>
     Notice the <span class="atom">right(X-Y)</span> structure. A dash pairs two words, and fits in place of one word inside paranthesis.
    </p>
    <p>
     Machine can answer the blank, if we put an uppercase word in place of left or right side of a pair.
    </p>
    <p>
     Write some structures with paired words. Then ask a question by writing an uppercase word in place of one of the pairs.
    </p>

    <p>
      For example, if there is a <span class="atom"> right(a-b) </span> , and we ask for <span class="atom"> right(X-b) </span>, it answers <span class="atom"> X = b </span> .
    </p>

</div>
      </>)
}

const EightFilesAndOpenConsole = () => {
  return (<>
<p>
   A chess board has 8 files and 8 ranks that are placed horizontally and vertically.
  </p> 
<p>
   State all files a, b, c, d, e, f, g, h. So machine can answer "a is a file", or enumerate all files.
</p>

<small>
  If you like, <button>click here</button> to open up a text area so you can just write these structures.
</small>
   
<p>
  If you want, you can skip to the solution by clicking the button below.
</p>
    </>)
}

const RenameAndFillFiles = (props) => {
  return (<>
      <Paragraph> 
  These white boxes have a structure. 
      </Paragraph>
      <Paragraph completed={props.session.completed(1)}>
      Change the word inside paranthesis by clicking on it.
      </Paragraph>
    <Paragraph>
      Just put only lowercase english letters.
    </Paragraph>
    <Paragraph>
     Change the initial word "file" by clicking on it.
    </Paragraph>
    <Paragraph>
     Notice the wandering letters corresponds to <span class='atom'> file(X).</span> structure.
    </Paragraph>
   </>)
}

const PlayWithWhiteBoxes = (props) => {
  return (<>
      <Paragraph completed={props.session.completed(1)}>
      Play with <span class='atom'>white boxes</span>.
      Hover on one's top left, as the orange dot appears.
      So you can drag them around.
      </Paragraph>
      <Paragraph completed={props.session.completed(2)}>
      Notice on hover, there is a ghost box appear.
      Drag that ghost to duplicate one.
      </Paragraph>
      <Paragraph completed={props.session.completed(3)}>
      Click on the orange dot that appears on top left as you hover,
      to delete a box.
      </Paragraph>
      </>)
}

const Paragraph = (props) => {
  let klass = () => [props.completed ? 'completed' : '']
  return (<p class={klass()}>
   {props.children}
      </p>)
}

const sessions = [
  PlayWithWhiteBoxes,
  RenameAndFillFiles,
  EightFilesAndOpenConsole,
  PairedWordsXVariable,
  RightOfFiles,
  LeftWhenRightAnd,
  Right2Up2Down2
]


