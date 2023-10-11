import React, { useEffect, useRef } from "react";

// adds draggable expansion functionality to timeline items
function useExpander(id, dependencies, callback) {
    const isClicked = useRef(false);
    const callbackPrimed = useRef(false);
    const coords = useRef({
        startX: 0,
        lastX: 0,
        startWidth: 0,
        lastWidth: 0,
        startLeft: 0,
        lastLeft: 0
    });

    useEffect(() => {
        if (!id) return;

        const target = document.getElementById(id); // target needs to have position: absolute
        if (!target) return;

        const container = target.parentElement; // container needs to have position: relative
        if (!container) throw new Error('Target element must have a parent');

        target.addEventListener('mousedown', handleMouseDown);

        return () => {
            if (target) {
                target.removeEventListener('mousedown', handleMouseDown);
            }

            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleMouseMove);
        }

        function handleMouseDown(e) {
            isClicked.current = true;
            if (callback) callbackPrimed.current = true;

            const subtitleElement = target.parentElement.parentElement;

            coords.current.startX = e.clientX;
            coords.current.lastWidth = subtitleElement.offsetWidth;
            coords.current.startWidth = subtitleElement.offsetWidth;
            coords.current.startLeft = subtitleElement.offsetLeft;
            coords.current.lastLeft = subtitleElement.offsetLeft;

            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('mousemove', handleMouseMove);
        }

        function handleMouseUp(e) {
            isClicked.current = false;
            const subtitleElement = target.parentElement.parentElement;
            coords.current.lastX = subtitleElement.offsetWidth + subtitleElement.offsetLeft;

            if (callback && callbackPrimed.current === true) {
                callback({ coords: { ...coords.current } });
                callbackPrimed.current = false;
            }

            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleMouseMove);
        }

        function handleMouseMove(e) {
            if (!isClicked.current) return;

            const subtitleElement = target.parentElement.parentElement;
            const leftBoundary = subtitleElement.previousElementSibling.offsetLeft + subtitleElement.previousElementSibling.offsetWidth;
            const rightBoundary = subtitleElement.nextElementSibling.offsetLeft;

            if (id === 'left-timeline-expander') {
                const nextWidth = coords.current.startX - e.clientX + coords.current.startWidth;
                const nextLeft = e.clientX - coords.current.startX + coords.current.startLeft;

                if (leftBoundary < nextLeft && nextLeft < rightBoundary) {
                    subtitleElement.style.width = `${nextWidth}px`;
                    subtitleElement.style.left = `${nextLeft}px`;
                    coords.current.lastWidth = subtitleElement.offsetWidth;
                    coords.current.lastLeft = subtitleElement.offsetLeft;
                }
            } else if (id === 'right-timeline-expander') {
                const nextWidth = e.clientX - coords.current.startX + coords.current.startWidth;
                const currOffsetLeft = nextWidth + subtitleElement.offsetLeft;

                if (leftBoundary < currOffsetLeft && currOffsetLeft < rightBoundary) {
                    subtitleElement.style.width = `${nextWidth}px`;
                    coords.current.lastWidth = subtitleElement.offsetWidth;
                    coords.current.lastLeft = subtitleElement.offsetLeft;
                }
            }
        }
    }, [id, [...dependencies]]);
}

export default useExpander;
