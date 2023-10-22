import React, { useState, useRef } from "react";

function useHistoryState(initialState, options = {}) {
    const { deepCopy = false, maxLength = 20 } = options;

    const undoStack = useRef([]);
    const redoStack = useRef([]);

    const [state, _setState] = useState(initialState);

    function setState(newState) {
        redoStack.current = [];

        if (deepCopy === true) newState = structuredClone(newState);

        const currentState = structuredClone(state);
        undoStack.current.push(currentState);
        if (undoStack.current.length > maxLength) undoStack.current.shift();

        _setState(newState);

        console.log(structuredClone(undoStack.current));

        return newState;
    }

    function undoState() {
        if (undoStack.current.length <= 1) return null;

        const historyState = structuredClone(undoStack.current.pop());

        const currentState = structuredClone(state);
        redoStack.current.push(currentState);

        _setState(historyState);

        console.log(structuredClone(undoStack.current));

        return historyState;
    }

    function redoState() {
        if (redoStack.current.length === 0) return null;

        const historyState = structuredClone(redoStack.current.pop());

        const currentState = structuredClone(state);
        undoStack.current.push(currentState);

        _setState(historyState);

        console.log(structuredClone(undoStack.current));

        return historyState;
    }

    return [
        state,
        setState,
        undoState,
        redoState
    ];
}

export default useHistoryState;
