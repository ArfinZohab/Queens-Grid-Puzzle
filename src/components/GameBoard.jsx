import { useEffect, useRef } from 'react';
import { CELL_QUEEN, CELL_CROSS, CELL_AUTO, CELL_EMPTY } from '../hooks/useGameState';

const QUEEN_SVG = (
    <svg className="marker-queen" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 19H22V21H2V19ZM3 5L5.5 13L9.5 7L12 15L14.5 7L18.5 13L21 5L19 17H5L3 5Z" />
    </svg>
);

function Cell({ r, c, state, region, n, isConflict, onPointerDown, onPointerEnter }) {
    const regionClass = `region-${region % 16}`;
    const conflictClass = isConflict ? ' conflict' : '';

    // Region border classes
    const borderTop    = r === 0   ? 'border-top'    : '';
    const borderBottom = r === n-1 ? 'border-bottom' : '';
    const borderLeft   = c === 0   ? 'border-left'   : '';
    const borderRight  = c === n-1 ? 'border-right'  : '';
    // Note: actual region boundary borders are computed in GameBoard and passed via data-attrs

    let content = null;
    if (state === CELL_CROSS || state === CELL_AUTO) {
        content = <div className="marker-cross" />;
    } else if (state === CELL_QUEEN) {
        content = QUEEN_SVG;
    }

    return (
        <div
            id={`cell-${r}-${c}`}
            className={`cell ${regionClass}${conflictClass}`}
            data-r={r}
            data-c={c}
            onPointerDown={(e) => {
                try {
                    if (e.target.hasPointerCapture(e.pointerId)) {
                        e.target.releasePointerCapture(e.pointerId);
                    }
                } catch (err) {}
                onPointerDown(r, c);
            }}
            onPointerEnter={() => onPointerEnter(r, c)}
        >
            {content}
        </div>
    );
}

export default function GameBoard({
    n, regions, userState, conflictData,
    isPaused, onTogglePause,
    onCellPointerDown, onCellPointerEnter, onGestureEnd,
}) {
    const boardRef = useRef(null);
    const { conflictSet } = conflictData;

    // Attach global pointer-up / touch-end listeners
    useEffect(() => {
        window.addEventListener('pointerup', onGestureEnd);
        window.addEventListener('pointercancel', onGestureEnd);
        window.addEventListener('touchend', onGestureEnd);
        return () => {
            window.removeEventListener('pointerup', onGestureEnd);
            window.removeEventListener('pointercancel', onGestureEnd);
            window.removeEventListener('touchend', onGestureEnd);
        };
    }, [onGestureEnd]);

    // Pointer-move for drag tracking (handles touch and mouse)
    useEffect(() => {
        const board = boardRef.current;
        if (!board) return;

        const handlePointerMove = (e) => {
            // For mouse events, e.buttons === 1 means primary button is pressed.
            // For touch events, e.buttons might be 0 but e.type is touchmove.
            if (e.type.startsWith('mouse') && e.buttons !== 1) return;
            if (e.type.startsWith('pointer') && e.pointerType === 'mouse' && e.buttons !== 1) return;
            
            // Prevent scrolling when dragging on touch devices
            if (e.type === 'touchmove') e.preventDefault();

            let clientX, clientY;
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            const el = document.elementFromPoint(clientX, clientY);
            const cellEl = el?.closest('.cell');
            if (cellEl) {
                const r = parseInt(cellEl.dataset.r, 10);
                const c = parseInt(cellEl.dataset.c, 10);
                onCellPointerEnter(r, c);
            }
        };

        board.addEventListener('touchmove', handlePointerMove, { passive: false });
        board.addEventListener('pointermove', handlePointerMove, { passive: false });
        return () => {
            board.removeEventListener('touchmove', handlePointerMove);
            board.removeEventListener('pointermove', handlePointerMove);
        };
    }, [onCellPointerEnter]);

    if (!regions.length || !userState.length) return null;

    const cells = [];
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const reg = regions[r][c];

            // Compute region border classes
            const borders = [];
            if (r === 0 || regions[r-1][c] !== reg) borders.push('border-top');
            if (r === n-1 || regions[r+1][c] !== reg) borders.push('border-bottom');
            if (c === 0 || regions[r][c-1] !== reg) borders.push('border-left');
            if (c === n-1 || regions[r][c+1] !== reg) borders.push('border-right');

            const key = `${r}-${c}`;
            const isConflict = conflictSet.has(key);
            const state = userState[r][c];
            const regionClass = `region-${reg % 16}`;
            const conflictClass = isConflict ? ' conflict' : '';
            const borderClass = borders.length ? ` ${borders.join(' ')}` : '';

            let content = null;
            if (state === CELL_CROSS || state === CELL_AUTO) {
                content = <div className="marker-cross" />;
            } else if (state === CELL_QUEEN) {
                content = QUEEN_SVG;
            }

            cells.push(
                <div
                    key={key}
                    id={`cell-${r}-${c}`}
                    className={`cell ${regionClass}${conflictClass}${borderClass}`}
                    data-r={r}
                    data-c={c}
                    onPointerDown={(e) => {
                        try {
                            if (e.target.hasPointerCapture(e.pointerId)) {
                                e.target.releasePointerCapture(e.pointerId);
                            }
                        } catch (err) {}
                        onCellPointerDown(r, c);
                    }}
                    onPointerEnter={() => onCellPointerEnter(r, c)}
                >
                    {content}
                </div>
            );
        }
    }

    return (
        <section className="board-area">
            <div className="board-wrapper glass-panel">
                <div
                    id="game-board"
                    className="grid-board"
                    ref={boardRef}
                    style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
                >
                    {cells}
                </div>

                {isPaused && (
                    <div id="pause-overlay" className="pause-overlay">
                        <div className="pause-content">
                            <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none">
                                <rect x="6" y="5" width="4" height="14" />
                                <rect x="14" y="5" width="4" height="14" />
                            </svg>
                            <p>Game Paused</p>
                            <button className="btn btn-primary" onClick={onTogglePause}>Resume</button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
