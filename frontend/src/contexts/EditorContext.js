import React, { useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import defaultEditorSettings from '../config/defaultEditorSettings.json';

const EditorContext = React.createContext();

export function useEditor() {
    return useContext(EditorContext);
}

export function EditorProvider({ children }) {
    const { clientUser } = useAuth();

    const [editorSettings, setEditorSettings] = useState(clientUser.defaultEditorSettings || { ...defaultEditorSettings });

    function applyEditorSettingsGlobally() {
        
    }

    const value = {
        editorSettings,
        setEditorSettings,
        applyEditorSettingsGlobally
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    )
}
