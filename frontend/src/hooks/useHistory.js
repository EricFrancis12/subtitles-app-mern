import React, { useState } from "react";

// Custom hook for managing undo/redo history
function useHistory(initialState) {
    const [state, setState] = useState(initialState);
    const [history, setHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    function test() {
        setTimeout(() => {
            // console.log({
            //     history,
            //     state,
            //     redoStack
            // });
        }, 0);
    }

    const addToHistory = (newState) => {

        const _newState = newState.map(subtitle => {
            return {
                ...subtitle,
                lines: [...subtitle.lines]
            };
        });

        setHistory([...history, _newState]);
        setRedoStack([]); // Clear redo stack
        setState(_newState);

        test();
    };

    const undo = () => {
        if (history.length > 0) {
            const newHistory = [...history];
            const previousState = newHistory.pop();

            const _previousState = previousState.map(subtitle => {
                return {
                    ...subtitle,
                    lines: [...subtitle.lines]
                };
            });

            const _newState = state.map(subtitle => {
                return {
                    ...subtitle,
                    lines: [...subtitle.lines]
                };
            });

            setHistory(newHistory);
            setRedoStack([...redoStack, _newState]);
            setState(_previousState);
        }

        test();
    }

    const redo = () => {
        if (redoStack.length > 0) {
            const newRedoStack = [...redoStack];
            const nextState = newRedoStack.pop();

            setRedoStack(newRedoStack);
            setHistory([...history, state]);
            setState(nextState);
        }

        test();
    }

    return [state, addToHistory, undo, redo];
}

export default useHistory;
