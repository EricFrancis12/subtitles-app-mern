import React, { useEffect, useRef } from "react";

// Custom hook adds draggable elements functionality
function useDragger(id, callback) {
    const isClicked = useRef(false);
    const callbackPrimed = useRef(false);
    const coords = useRef({
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0
    });

    useEffect(() => {
        if (!id) return;

        const target = document.getElementById(id); // target needs to have position: absolute
        if (!target) throw new Error('Element with given id does not exist');

        const container = target.parentElement; // container needs to have position: relative
        if (!container) throw new Error('Target element must have a parent');

        target.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseUp);

        return () => {
            if (target) {
                target.removeEventListener('mousedown', handleMouseDown);
            }

            document.removeEventListener('mouseup', handleMouseUp);

            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
                container.removeEventListener('mouseleave', handleMouseUp);
            }
        }

        function handleMouseDown(e) {
            isClicked.current = true;
            if (callback) callbackPrimed.current = true;

            coords.current.startX = e.clientX;
            coords.current.startY = e.clientY;
        }

        function handleMouseUp(e) {
            isClicked.current = false;
            coords.current.lastX = target.offsetLeft;
            coords.current.lastY = target.offsetTop;

            if (callback && callbackPrimed.current === true) {
                callback({ coords: { ...coords.current } });
                callbackPrimed.current = false;
            }
        }

        function handleMouseMove(e) {
            if (!isClicked.current) return;

            const nextX = e.clientX - coords.current.startX + coords.current.lastX;
            const nextY = e.clientY - coords.current.startY + coords.current.lastY;

            target.style.left = `${nextX}px`;
            target.style.top = `${nextY}px`;
        }
    }, [id]);

}

export default useDragger;
