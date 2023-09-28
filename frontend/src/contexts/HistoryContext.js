import React, { useState, useContext } from 'react';

const HistoryContext = React.createContext();

export function useHistory() {
    return useContext(HistoryContext);
}

export function HistoryProvider({ children }) {
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [activeHistoryItem, setActiveHistoryItem] = useState(null);

    function addToUndoStack(historyItem) {
        setActiveHistoryItem(historyItem);

        if (activeHistoryItem != null) {
            setUndoStack([...undoStack, activeHistoryItem]);
        }

        setRedoStack([]);
    }

    function undo() {
        if (undoStack.length === 0) return null;

        const newUndoStack = [...undoStack];
        const historyItem = newUndoStack.pop();
        setUndoStack([...newUndoStack]);
        setRedoStack([...redoStack, activeHistoryItem]);
        setActiveHistoryItem(historyItem);

        historyItem.storedStates.forEach(item => {
            const [state, setState] = item;
            setState(state);
        });

        return historyItem;
    }

    function redo() {
        if (redoStack.length === 0) return null;

        const newRedoStack = [...redoStack];
        const historyItem = newRedoStack.pop();
        setUndoStack([...undoStack, activeHistoryItem]);
        setRedoStack([...newRedoStack]);
        setActiveHistoryItem(historyItem);

        historyItem.storedStates.forEach(item => {
            const [state, setState] = item;
            setState(state);
        });

        return historyItem;
    }

    function resetStacks() {
        setUndoStack([]);
        setRedoStack([]);
        setActiveHistoryItem(null);
    }

    const value = {
        undoStack,
        setUndoStack,
        redoStack,
        setRedoStack,
        activeHistoryItem,
        setActiveHistoryItem,
        addToUndoStack,
        resetStacks,
        undo,
        redo,
    };

    return (
        <HistoryContext.Provider value={value}>
            {children}
        </HistoryContext.Provider>
    )
}
