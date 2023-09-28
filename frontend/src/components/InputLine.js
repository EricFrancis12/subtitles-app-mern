import React, { useEffect, useRef } from 'react';
import { isEmpty } from '../utils/utils';

export default function InputLine(props) {
    const { value, onChange, index, line, cursorPosition } = props;
    const { index: cursorIndex, line: cursorLine, position } = cursorPosition;

    const inputRef = useRef(null);

    useEffect(() => {
        if (cursorIndex === index && cursorLine === line) {
            inputRef.current.focus();
            inputRef.current.selectionStart = position || 0;
            inputRef.current.selectionEnd = position || 0;
        }
    }, [cursorPosition]);

    return (
        <input type='text'
            value={value}
            ref={inputRef}
            onChange={e => onChange(e)}
            data-index={index} data-line={line} data-cursorposition={position}>
        </input>
    )
}
