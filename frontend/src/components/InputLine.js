import React, { useEffect, useRef } from 'react';
import { isEmpty } from '../utils/utils';

export default function InputLine(props) {
    const { defaultValue, onChange, onFocus, index, line, cursorPosition } = props;

    const inputRef = useRef(null);

    useEffect(() => {
        if (!isEmpty(cursorPosition)) {
            inputRef.current.focus();
            inputRef.current.selectionStart = cursorPosition || 0;
            inputRef.current.selectionEnd = cursorPosition || 0;
        }
    }, []);

    return (
        <input type='text' defaultValue={defaultValue}
            ref={inputRef}
            onChange={e => onChange(e)}
            onFocus={e => onFocus(e)}
            data-index={index} data-line={line} data-cursorposition={cursorPosition}>
        </input>
    )
}
