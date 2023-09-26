import React, { useState, useContext } from 'react';

const HistoryContext = React.createContext();

export function useHistory() {
    return useContext(HistoryContext);
}

export function HistoryProvider({ children }) {
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    function addToUndoStack(historyItem) {
        setUndoStack([...undoStack, historyItem]);
        setRedoStack([]);
    }

    function undo() {
        const newUndoStack = [...undoStack];
        const historyItem = newUndoStack.pop();
        setUndoStack([...newUndoStack]);
        setRedoStack([...redoStack, historyItem]);

        historyItem.storedStates.forEach(item => {
            const [state, setState] = item;
            setState(state);
        });

        return historyItem;
    }

    function redo() {
        const newRedoStack = [...redoStack];
        const historyItem = newRedoStack.pop();
        setUndoStack([...undoStack, historyItem]);
        setRedoStack([...newRedoStack]);

        historyItem.storedStates.forEach(item => {
            const [state, setState] = item;
            setState(state);
        });

        return historyItem;
    }

    const value = {
        undoStack,
        setUndoStack,
        redoStack,
        setRedoStack,
        addToUndoStack,
        undo,
        redo
    };

    return (
        <HistoryContext.Provider value={value}>
            {children}
        </HistoryContext.Provider>
    )
}
