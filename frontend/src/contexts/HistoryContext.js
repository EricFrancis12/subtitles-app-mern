import React, { useRef, useContext } from 'react';

const HistoryContext = React.createContext();

export function useHistory() {
    return useContext(HistoryContext);
}

export function HistoryProvider({ children }) {
    const MAX_HISTORY_ITEMS = 20;

    const undoStack = useRef([]);
    const redoStack = useRef([]);

    function addToHistory(historyItem) {
        redoStack.current = [];

        undoStack.current.push(historyItem);
        if (undoStack.current.length > MAX_HISTORY_ITEMS) undoStack.current.shift();

        return undoStack.current;
    }

    function undo() {
        if (undoStack.current.length === 0) return null;

        const historyItem = undoStack.current.pop();
        redoStack.current.push(historyItem);

        return historyItem;
    }

    function redo() {
        if (redoStack.current.length === 0) return null;

        const historyItem = redoStack.current.pop();
        undoStack.current.push(historyItem);

        return historyItem;
    }

    const value = {
        addToHistory,
        undo,
        redo
    };

    return (
        <HistoryContext.Provider value={value}>
            {children}
        </HistoryContext.Provider>
    )
}
