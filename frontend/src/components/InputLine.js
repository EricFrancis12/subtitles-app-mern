import React, { useEffect, useRef } from 'react';

export const INPUT_LINE_CLASS = 'INPUT_LINE_CLASS';

export default function InputLine(props) {
    const { value, onChange, index, line, cursorPosition, selected } = props;
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
            style={{
                display: 'block',
                cursor: selected ? 'unset' : 'default',
            }}
            className={INPUT_LINE_CLASS}
            data-index={index} data-line={line} data-cursorposition={position}>
        </input>
    )
}
