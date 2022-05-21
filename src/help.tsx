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
      <Hello/>
      </div>)
}

const Hello = () => {
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

const RenameAndFillFiles = () => {
  return (<>
      <p> 
  These white boxes have a structure. 
      </p>
      <p>
      Change the word inside paranthesis by clicking on it.
      </p>
    <p>
      Just put only lowercase english letters.
    </p>
    <p>
     Change the initial word by clicking on it.
    </p>
    <p>
     Notice the wandering letters corresponds to <span class='atom'> file(X).</span> structure.
    </p>
   </>)
}

const PlayWithWhiteBoxes = () => {
  return (<>
      <p>
      Play with <span class='atom'>white boxes</span>.
      Hover on one's top left, as the orange dot appears.
      So you can drag them around.
      </p>
      <p>
      Notice on hover, there is a ghost box appear.
      Drag that ghost to duplicate one.
      </p>
      <p>
      Click on the orange dot that appears on top left as you hover,
      to delete an item.
      </p>
      </>)
}


