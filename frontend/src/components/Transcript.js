import React, { useState, useRef } from 'react';
import Subtitle from '../models/Subtitle';

export default function Transcript(props) {
    const { subtitles, selectedSubtitle, handleSubtitleClick } = props;

    const [searchQuery, setSearchQuery] = useState('');

    function handleInput(e) {
        setSearchQuery(e.target.value);
    }

    return (
        <div>
            <div>
                <input onChange={e => handleInput(e)}></input>
            </div>
            <div className='d-flex flex-wrap m-4' style={{ maxWidth: '30vw' }}>
                {subtitles.map((subtitle, index) => {
                    if (subtitle.lines.join(' ').includes(searchQuery)) {
                        return (
                            <span key={index}
                                onClick={e => handleSubtitleClick(index, 1)}
                                style={{ cursor: 'default' }}
                                className={(selectedSubtitle === index ? 'selected-subtitle' : 'bg-secondary') + ' display-inline-block border border-black m-1 p-1 rounded'}
                                data-selectionscope='1'>
                                {subtitle.lines.map(line => Subtitle.parseLine(line).text).join(' ')}
                            </span>
                        )
                    } else {
                        return ''
                    }
                })}
            </div >
        </div>
    )
}
