import { useEffect, useRef } from 'react';
import { CELL_QUEEN, CELL_CROSS, CELL_AUTO } from '../hooks/useGameState';
import { Box, Card, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import PauseIcon from '@mui/icons-material/Pause';

const QUEEN_SVG = (
    <svg className="marker-queen" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 19H22V21H2V19ZM3 5L5.5 13L9.5 7L12 15L14.5 7L18.5 13L21 5L19 17H5L3 5Z" />
    </svg>
);

const STAR_SVG = (
    <svg className="marker-queen" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
);

// ── Styled Components ─────────────────────────────────────────────────────────

const BoardWrapperCard = styled(Card)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    maxWidth: 'min(520px, 85vmin)',
    margin: '0 auto',
    padding: theme.spacing(2),
    borderRadius: '20px',
    boxShadow: theme.palette.mode === 'dark'
        ? '0 16px 40px rgba(0, 0, 0, 0.4)'
        : '0 16px 40px rgba(31, 38, 135, 0.08)',
    overflow: 'hidden',
}));

const GridBoard = styled(Box)(({ theme }) => ({
    display: 'grid',
    gap: 0,
    width: '100%',
    aspectRatio: '1',
    userSelect: 'none',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    border: `4px solid #000`,
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#000',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
}));

const StyledCell = styled('div', {
    shouldForwardProp: (prop) => prop !== 'region' && prop !== 'isConflict',
})(({ theme, region, isConflict }) => ({
    width: '100%',
    height: '100%',
    aspectRatio: '1',
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'filter 0.2s ease',
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
    backgroundColor: `var(--region-${region % 16})`,
    
    // Region boundary lines
    '&.border-top': { borderTop: `2px solid rgba(0,0,0,0.7) !important` },
    '&.border-bottom': { borderBottom: `2px solid rgba(0,0,0,0.7) !important` },
    '&.border-left': { borderLeft: `2px solid rgba(0,0,0,0.7) !important` },
    '&.border-right': { borderRight: `2px solid rgba(0,0,0,0.7) !important` },

    '&::after': {
        content: "''",
        position: 'absolute',
        inset: 0,
        background: 'transparent',
        transition: 'background-color 0.15s ease',
        pointerEvents: 'none',
    },
    '&:hover::after': {
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
    },
    
    '&:empty:hover': {
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' stroke='${encodeURIComponent(
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)'
        )}' stroke-width='2.5' stroke-linecap='round' fill='none'%3E%3Cline x1='6' y1='6' x2='18' y2='18'/%3E%3Cline x1='6' y1='18' x2='18' y2='6'/%3E%3C/svg%3E")`,
        backgroundSize: '40%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    },

    // Conflicts & animations
    ...(isConflict && {
        animation: 'conflictShake 0.4s ease infinite alternate',
        '&::before': {
            content: "''",
            position: 'absolute',
            inset: '2px',
            border: `3px solid ${theme.palette.error.main}`,
            borderRadius: '6px',
            pointerEvents: 'none',
            zIndex: 10,
            animation: 'pulseDanger 1s infinite alternate',
        },
    }),
}));

const PauseOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    inset: 0,
    background: theme.palette.mode === 'dark' 
        ? 'rgba(18, 18, 18, 0.92)' 
        : 'rgba(245, 245, 245, 0.92)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    transition: 'all 0.3s ease',
}));

// ── GameBoard ────────────────────────────────────────────────────────────────

export default function GameBoard({
    n, regions, userState, conflictData,
    isPaused, queenMarker, onTogglePause,
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
            const borderClass = borders.length ? ` ${borders.join(' ')}` : '';

            let content = null;
            if (state === CELL_CROSS || state === CELL_AUTO) {
                content = <div className="marker-cross" />;
            } else if (state === CELL_QUEEN) {
                content = queenMarker === 'star' ? STAR_SVG : QUEEN_SVG;
            }

            cells.push(
                <StyledCell
                    key={key}
                    id={`cell-${r}-${c}`}
                    className={`cell${borderClass}`}
                    region={reg}
                    isConflict={isConflict}
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
                </StyledCell>
            );
        }
    }

    return (
        <Box component="section" className="board-area" sx={{ display: 'block', width: '100%', minHeight: 'min(560px, 78vmin)', position: 'relative' }}>
            <BoardWrapperCard>
                <GridBoard
                    id="game-board"
                    ref={boardRef}
                    style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
                >
                    {cells}
                </GridBoard>

                {isPaused && (
                    <PauseOverlay id="pause-overlay">
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <PauseIcon sx={{ fontSize: '4rem', color: 'primary.main', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }} />
                            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
                                Game Paused
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={onTogglePause}
                                sx={{ px: 4, py: 1.2, fontWeight: 700 }}
                            >
                                Resume
                            </Button>
                        </Box>
                    </PauseOverlay>
                )}
            </BoardWrapperCard>
        </Box>
    );
}
