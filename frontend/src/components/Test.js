import React from 'react';

export default function Test(props) {
    const { state, stateFunction } = props;

    function handleClick() {
        console.log(state);
        stateFunction(!state);
        console.log(state);

        setTimeout(() => console.log(state), 0);
    }

    return (
        <div>
            <button onClick={e => handleClick()}>Test Button</button>
        </div>
    )
}



// import React, { useState, useRef } from 'react';
// import useHistory from '../hooks/useHistory';

// function Test() {
//     const [subtitles, setSubtitles, undoSubtitle, redoSubtitle] = useHistory([]);
//     const [input, setInput] = useState('');
//     const [loading, setLoading] = useState(false);

//     const inputRef = useRef();

//     // Function to handle changes to multiple states together
//     function handleCombinedChange(e) {
//         // Simulate a combined change
//         setLoading(true);

//         const newArr = [...subtitles, e.target.value];
//         setSubtitles([
//             { lines: [e.target.value] },
//             { lines: [e.target.value] },
//             { lines: [e.target.value] },
//             { lines: [e.target.value] }
//         ]);

//         setTimeout(() => {
//             setLoading(false);
//             setTimeout(() => {
//                 inputRef.current.focus();
//                 inputRef.current.selectionStart = 999;
//                 inputRef.current.selectionEnd = 999;
//             }, 0);
//         }, 0);
//     }

//     function undo() {
//         undoSubtitle();
//     }

//     function redo() {
//         redoSubtitle();
//     }

//     console.log(`THIS SHOULD BE EQUAL TO WHAT'S INSIDE THE INPUT: ${subtitles[0]?.lines[0]}`);

//     return (
//         <div>
//             <div>
//                 <h1>Subtitle Editor</h1>
//                 <div>
//                     <label>Subtitle Text:</label>
//                     {!loading && <input
//                         ref={inputRef}
//                         type="text"
//                         value={subtitles[0]?.lines[0]}
//                         onChange={(e) => handleCombinedChange(e)}
//                     />}
//                 </div>
//                 <div>
//                     <button onClick={undo}>
//                         Undo
//                     </button>
//                     <button onClick={redo}>
//                         Redo
//                     </button>
//                 </div>
//                 <div>
//                     {JSON.stringify(subtitles)}
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Test;



// import React, { useState } from 'react';
// import { useHistory } from '../contexts/HistoryContext';
// import HistoryItem from '../models/HistoryItem';

// export default function Test() {
//     const { undoStack, redoStack, activeHistoryItem, addToUndoStack, undo, redo } = useHistory();

//     const [randomNumberA, setRandomNumberA] = useState(0);
//     const [randomNumberB, setRandomNumberB] = useState(100);

//     function getRandomNumber(min, max) {
//         return Math.floor(Math.random() * (max - min + 1)) + min;
//     }

//     function handleAction() {
//         addToUndoStack(new HistoryItem({
//             storedStates: [
//                 [randomNumberA, setRandomNumberA],
//                 [randomNumberB, setRandomNumberB]
//             ]
//         }));

//         setRandomNumberA(getRandomNumber(1, 99));
//         setRandomNumberB(getRandomNumber(101, 199));
//     }

//     return (
//         <div>
//             <br></br>
//             <div>
//                 <button onClick={e => undo()}>Undo</button>
//             </div>
//             <br></br>
//             <div>
//                 <button onClick={e => redo()}>Redo</button>
//             </div>
//             <br></br>
//             <div>
//                 <button onClick={e => handleAction()}>Press To Generate New Random Numbers</button>
//             </div>
//             <br></br>
//             <div>
//                 Random Number A: {randomNumberA}
//             </div>
//             <div>
//                 Random Number B: {randomNumberB}
//             </div>
//         </div>
//     )
// }
