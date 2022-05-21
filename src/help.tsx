
export const Help = (props) => {
  return (<div class="overlay help">
      <RenameAndFillFiles/>
      </div>)
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


