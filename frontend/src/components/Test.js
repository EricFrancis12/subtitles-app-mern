import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useVideoUpload } from '../contexts/VideoUploadContext';

export default function Test() {
    const [loaded, setLoaded] = useState(false);
    const ffmpegRef = useRef(new FFmpeg());
    const videoRef = useRef(null);
    const messageRef = useRef(null);

    const { videoFile } = useVideoUpload();

    useEffect(() => {
        load();
    }, [videoFile]);

    async function load() {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd'
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on('log', ({ message }) => {
            messageRef.current.innerHTML = message;
            console.log(message);
        });
        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        setLoaded(true);
        setTimeout(() => console.log(ffmpegRef.current), 0);
    }

    async function transcode() {
        const videoURL = URL.createObjectURL(videoFile);

        const ffmpeg = ffmpegRef.current;
        await ffmpeg.writeFile('input.mp4', await fetchFile(videoURL));
        await ffmpeg.exec(['-i', 'input.mp4', 'output.mp4']);
        const data = await ffmpeg.readFile('output.mp4');
        videoRef.current.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    }

    return (
        loaded
            ? (
                <>
                    <video ref={videoRef} controls></video><br />
                    <button onClick={transcode}>Transcode</button>
                    <p ref={messageRef}></p>
                    <p>Open Developer Tools (Ctrl+Shift+I) to View Logs</p>
                </>
            )
            : (
                <button onClick={load}>Load ffmpeg-core (~31 MB)</button>
            )
    );
}



// import React from 'react';

// export default function Test(props) {
//     const { state, stateFunction } = props;

//     function handleClick() {
//         console.log(state);
//         stateFunction(!state);
//         console.log(state);

//         setTimeout(() => console.log(state), 0);
//     }

//     return (
//         <div>
//             <button onClick={e => handleClick()}>Test Button</button>
//         </div>
//     )
// }



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
