import { useCallback, useEffect, useRef, useState } from 'react';
import { generateUniquePuzzle } from '../utils/puzzleGenerator';
import {
    BEST_TIMES_KEY, THEME_KEY,
    copy2DArray, clearSavedGame, formatTime,
    loadStats, loadSavedGame, persistGame, saveStats,
} from '../utils/helpers';

export const CELL_EMPTY = '';
export const CELL_CROSS = 'X';
export const CELL_AUTO  = 'A';
export const CELL_QUEEN = 'Q';

const DRAG_ADD    = 'add_cross';
const DRAG_REMOVE = 'remove_cross';

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function applyAutoCrossLogic(state, regions, n, enabled) {
    const next = copy2DArray(state);
    const queens = [];
    for (let r = 0; r < n; r++)
        for (let c = 0; c < n; c++) {
            if (next[r][c] === CELL_AUTO) next[r][c] = CELL_EMPTY;
            else if (next[r][c] === CELL_QUEEN) queens.push({ r, c, reg: regions[r][c] });
        }
    if (!enabled || queens.length === 0) return next;
    for (let r = 0; r < n; r++)
        for (let c = 0; c < n; c++)
            if (next[r][c] === CELL_EMPTY) {
                const reg = regions[r][c];
                if (queens.some(q => r === q.r || c === q.c || reg === q.reg ||
                    (Math.abs(r - q.r) <= 1 && Math.abs(c - q.c) <= 1)))
                    next[r][c] = CELL_AUTO;
            }
    return next;
}

function computeConflicts(userState, regions, n) {
    const queens = [], rowC = Array(n).fill(0), colC = Array(n).fill(0), regC = Array(n).fill(0);
    for (let r = 0; r < n; r++)
        for (let c = 0; c < n; c++)
            if (userState[r]?.[c] === CELL_QUEEN) {
                const reg = regions[r]?.[c] ?? 0;
                queens.push({ r, c, reg }); rowC[r]++; colC[c]++; regC[reg]++;
            }
    const set = new Set();
    let hasRow = false, hasCol = false, hasReg = false, hasTouch = false;
    queens.forEach(q => {
        if (rowC[q.r] > 1) { set.add(`${q.r}-${q.c}`); hasRow = true; }
        if (colC[q.c] > 1) { set.add(`${q.r}-${q.c}`); hasCol = true; }
        if (regC[q.reg] > 1) { set.add(`${q.r}-${q.c}`); hasReg = true; }
    });
    for (let i = 0; i < queens.length; i++)
        for (let j = i + 1; j < queens.length; j++) {
            const a = queens[i], b = queens[j];
            if (Math.abs(a.r-b.r) <= 1 && Math.abs(a.c-b.c) <= 1) {
                set.add(`${a.r}-${a.c}`); set.add(`${b.r}-${b.c}`); hasTouch = true;
            }
        }
    return {
        queens, conflictSet: set, rowCounts: rowC, colCounts: colC, regCounts: regC,
        hasRowConflict: hasRow, hasColConflict: hasCol, hasRegConflict: hasReg, hasTouchConflict: hasTouch,
        rowSatisfied: rowC.every(v => v === 1), colSatisfied: colC.every(v => v === 1),
        regSatisfied: regC.every(v => v === 1), touchSatisfied: !hasTouch && queens.length > 0,
    };
}

function isVictory(cd, n) {
    return cd.queens.length === n && cd.conflictSet.size === 0 &&
        cd.rowSatisfied && cd.colSatisfied && cd.regSatisfied;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGameState() {
    const [screen, setScreen] = useState('gameplay');
    const [showVictory, setShowVictory]         = useState(false);
    const [showStats, setShowStats]             = useState(false);
    const [showConfirmReset, setShowConfirmReset] = useState(false);
    const [showSettings, setShowSettings]         = useState(false);
    const [isLightTheme, setIsLightTheme]       = useState(() => localStorage.getItem(THEME_KEY) === 'light');
    const [queenMarker, setQueenMarker]         = useState(() => localStorage.getItem('queens_marker_pref') || 'queen');

    const [n, setN]                         = useState(5);
    const [solution, setSolution]           = useState([]);
    const [regions, setRegions]             = useState([]);
    const [userState, setUserState]         = useState([]);
    const [history, setHistory]             = useState([]);
    const [isGameWon, setIsGameWon]         = useState(false);
    const [isAutoCrossEnabled, setIsAutoCrossEnabled] = useState(false);
    const [isPaused, setIsPaused]           = useState(false);
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [stats, setStats]                 = useState(() => loadStats());
    const [newRecord, setNewRecord]         = useState(false);

    // Refs that follow latest state values — safe to read inside callbacks
    const regionsRef   = useRef(regions);
    const nRef         = useRef(n);
    const autoRef      = useRef(isAutoCrossEnabled);
    const wonRef       = useRef(isGameWon);
    const secsRef      = useRef(secondsElapsed);
    const stateRef     = useRef(userState);
    const historyRef   = useRef(history);
    const solutionRef  = useRef(solution);
    const statsRef     = useRef(stats);

    useEffect(() => { regionsRef.current  = regions; },          [regions]);
    useEffect(() => { nRef.current        = n; },                [n]);
    useEffect(() => { autoRef.current     = isAutoCrossEnabled; },[isAutoCrossEnabled]);
    useEffect(() => { wonRef.current      = isGameWon; },        [isGameWon]);
    useEffect(() => { secsRef.current     = secondsElapsed; },   [secondsElapsed]);
    useEffect(() => { stateRef.current    = userState; },        [userState]);
    useEffect(() => { historyRef.current  = history; },          [history]);
    useEffect(() => { solutionRef.current = solution; },         [solution]);
    useEffect(() => { statsRef.current    = stats; },            [stats]);

    // Drag state (refs only — no re-renders needed)
    const isDownRef      = useRef(false);
    const dragModeRef    = useRef(null);
    const startKeyRef    = useRef(null);
    const hasDraggedRef  = useRef(false);
    const dragCellsRef   = useRef(new Set());

    // Timer
    const timerRef = useRef(null);
    const startTimer = useCallback(() => {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            if (!wonRef.current && !isPaused) setSecondsElapsed(s => s + 1);
        }, 1000);
    }, [isPaused]);
    const stopTimer = () => clearInterval(timerRef.current);

    useEffect(() => {
        if (isPaused || isGameWon) stopTimer();
        else if (screen === 'gameplay') startTimer();
        return stopTimer;
    }, [isPaused, isGameWon, screen]);

    // Theme sync
    useEffect(() => {
        document.body.classList.toggle('light-theme', isLightTheme);
        localStorage.setItem(THEME_KEY, isLightTheme ? 'light' : 'dark');
    }, [isLightTheme]);

    // Marker preference sync
    useEffect(() => {
        localStorage.setItem('queens_marker_pref', queenMarker);
    }, [queenMarker]);

    // ── Victory ───────────────────────────────────────────────────────────────
    function triggerVictory() {
        stopTimer();
        setIsGameWon(true);
        clearSavedGame();
        const secs = secsRef.current;
        const size = nRef.current;
        const prev = statsRef.current[size] || { best: Infinity, total: 0, count: 0 };
        const isNew = secs < prev.best;
        const updated = {
            ...statsRef.current,
            [size]: {
                best: isNew ? secs : prev.best,
                total: prev.total + secs,
                count: prev.count + 1
            }
        };
        setStats(updated); saveStats(updated);
        setNewRecord(isNew);
        setShowVictory(true);
    }

    // ── Finalize state after any mutation ─────────────────────────────────────
    function finalizeState(nextState, currentRegions, currentN, currentAuto, currentSecs) {
        const withAuto = applyAutoCrossLogic(nextState, currentRegions, currentN, currentAuto);
        setUserState(withAuto);
        const cd = computeConflicts(withAuto, currentRegions, currentN);
        if (isVictory(cd, currentN)) {
            setTimeout(triggerVictory, 0);
        } else {
            persistGame({ n: currentN, solution: solutionRef.current, regions: currentRegions, userState: withAuto, history: historyRef.current, secondsElapsed: currentSecs, isAutoCrossEnabled: currentAuto });
        }
        return withAuto;
    }

    // ── Init / Load ───────────────────────────────────────────────────────────
    function initGame(targetSize) {
        const size = parseInt(targetSize, 10);
        const puzzle = generateUniquePuzzle(size);
        const blank = Array.from({ length: size }, () => Array(size).fill(CELL_EMPTY));
        setN(size); setSolution(puzzle.solution); setRegions(puzzle.regions);
        setUserState(blank); setHistory([]); setIsGameWon(false);
        setIsPaused(false); setShowVictory(false); setNewRecord(false); setSecondsElapsed(0);
        isDownRef.current = false; dragModeRef.current = null; startKeyRef.current = null;
        hasDraggedRef.current = false; dragCellsRef.current.clear();
        nRef.current = size; regionsRef.current = puzzle.regions;
        solutionRef.current = puzzle.solution; stateRef.current = blank;
        historyRef.current = []; secsRef.current = 0;
        persistGame({ n: size, solution: puzzle.solution, regions: puzzle.regions, userState: blank, history: [], secondsElapsed: 0, isAutoCrossEnabled: autoRef.current });
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setSecondsElapsed(s => s + 1), 1000);
    }

    function continueGame() {
        const data = loadSavedGame();
        if (!data) { initGame(7); setScreen('gameplay'); return; }
        try {
            setN(data.n); setSolution(data.solution); setRegions(data.regions);
            setUserState(data.userState); setHistory(data.history || []);
            setSecondsElapsed(data.secondsElapsed || 0);
            setIsAutoCrossEnabled(!!data.isAutoCrossEnabled);
            setIsGameWon(false); setIsPaused(false); setShowVictory(false); setNewRecord(false);
            nRef.current = data.n; regionsRef.current = data.regions;
            solutionRef.current = data.solution; stateRef.current = data.userState;
            historyRef.current = data.history || []; secsRef.current = data.secondsElapsed || 0;
            autoRef.current = !!data.isAutoCrossEnabled;
            isDownRef.current = false; dragModeRef.current = null; startKeyRef.current = null;
            hasDraggedRef.current = false; dragCellsRef.current.clear();
            clearInterval(timerRef.current);
            timerRef.current = setInterval(() => setSecondsElapsed(s => s + 1), 1000);
        } catch { initGame(7); }
        setScreen('gameplay');
    }

    // ── Cell interactions ─────────────────────────────────────────────────────
    const handleCellPointerDown = useCallback((r, c) => {
        if (wonRef.current) return;
        isDownRef.current = true; hasDraggedRef.current = false;
        startKeyRef.current = `${r}-${c}`; dragCellsRef.current.clear();
        const cur = stateRef.current[r]?.[c];
        if (cur === CELL_EMPTY || cur === CELL_AUTO) dragModeRef.current = DRAG_ADD;
        else if (cur === CELL_CROSS) dragModeRef.current = DRAG_REMOVE;
        else dragModeRef.current = null;
        setHistory(h => { const next = [...h, copy2DArray(stateRef.current)]; historyRef.current = next; return next; });
    }, []);

    function applyDragCellLogic(state, r, c, mode) {
        const cur = state[r][c];
        if (mode === DRAG_ADD && (cur === CELL_EMPTY || cur === CELL_AUTO)) {
            const n2 = copy2DArray(state); n2[r][c] = CELL_CROSS; return n2;
        }
        if (mode === DRAG_REMOVE && (cur === CELL_CROSS || cur === CELL_AUTO)) {
            const n2 = copy2DArray(state); n2[r][c] = CELL_EMPTY; return n2;
        }
        return state;
    }

    const processDragMove = useCallback((r, c) => {
        if (!isDownRef.current || wonRef.current || dragModeRef.current === null) return;
        const key = `${r}-${c}`;
        if (key === startKeyRef.current) return;
        if (dragCellsRef.current.has(key)) return;

        const isFirstDrag = !hasDraggedRef.current;
        if (isFirstDrag) {
            hasDraggedRef.current = true;
            dragCellsRef.current.add(startKeyRef.current);
        }
        dragCellsRef.current.add(key);

        setUserState(prev => {
            let next = prev;
            if (isFirstDrag) {
                const [sr, sc] = startKeyRef.current.split('-').map(Number);
                next = applyDragCellLogic(next, sr, sc, dragModeRef.current);
            }
            return applyDragCellLogic(next, r, c, dragModeRef.current);
        });
    }, []);

    const handleGestureEnd = useCallback(() => {
        if (!isDownRef.current) return;
        const currentN = nRef.current, currentRegions = regionsRef.current;
        const currentAuto = autoRef.current, currentSecs = secsRef.current;

        if (!hasDraggedRef.current && startKeyRef.current) {
            const [r, c] = startKeyRef.current.split('-').map(Number);
            setUserState(prev => {
                const next = copy2DArray(prev);
                const cur = next[r][c];
                if (cur === CELL_EMPTY) next[r][c] = CELL_CROSS;
                else if (cur === CELL_CROSS || cur === CELL_AUTO) next[r][c] = CELL_QUEEN;
                else if (cur === CELL_QUEEN) next[r][c] = CELL_EMPTY;
                finalizeState(next, currentRegions, currentN, currentAuto, currentSecs);
                return applyAutoCrossLogic(next, currentRegions, currentN, currentAuto);
            });
        } else {
            setUserState(prev => {
                finalizeState(prev, currentRegions, currentN, currentAuto, currentSecs);
                return applyAutoCrossLogic(prev, currentRegions, currentN, currentAuto);
            });
        }

        isDownRef.current = false; startKeyRef.current = null;
        dragModeRef.current = null; dragCellsRef.current.clear();
    }, []);

    // ── Actions ───────────────────────────────────────────────────────────────
    function toggleAutoCross() {
        if (wonRef.current) return;
        setHistory(h => { const next = [...h, copy2DArray(stateRef.current)]; historyRef.current = next; return next; });
        const next = !autoRef.current;
        setIsAutoCrossEnabled(next); autoRef.current = next;
        setUserState(prev => {
            const updated = applyAutoCrossLogic(prev, regionsRef.current, nRef.current, next);
            persistGame({ n: nRef.current, solution: solutionRef.current, regions: regionsRef.current, userState: updated, history: historyRef.current, secondsElapsed: secsRef.current, isAutoCrossEnabled: next });
            return updated;
        });
    }

    function togglePause() { if (!wonRef.current) setIsPaused(p => !p); }

    function undo() {
        if (historyRef.current.length === 0 || wonRef.current) return;
        setHistory(h => {
            const prev = h[h.length - 1];
            historyRef.current = h.slice(0, -1);
            setUserState(prev); stateRef.current = prev;
            return historyRef.current;
        });
    }

    function clearBoard() {
        if (wonRef.current) return;
        setHistory(h => { const next = [...h, copy2DArray(stateRef.current)]; historyRef.current = next; return next; });
        const blank = Array.from({ length: nRef.current }, () => Array(nRef.current).fill(CELL_EMPTY));
        setUserState(blank); stateRef.current = blank;
    }

    function resetAllProgress() {
        localStorage.removeItem(BEST_TIMES_KEY); clearSavedGame();
        setStats({}); setShowConfirmReset(false);
        initGame(5); setScreen('gameplay');
    }

    function abandonGame() {
        clearSavedGame();
        setHistory([]); historyRef.current = [];
        setSecondsElapsed(0); secsRef.current = 0;
        const blank = Array.from({ length: nRef.current }, () => Array(nRef.current).fill(CELL_EMPTY));
        setUserState(blank); stateRef.current = blank;
    }

    function goToMenu() {
        if (!wonRef.current) {
            persistGame({ n: nRef.current, solution: solutionRef.current, regions: regionsRef.current, userState: stateRef.current, history: historyRef.current, secondsElapsed: secsRef.current, isAutoCrossEnabled: autoRef.current });
        }
        stopTimer(); setScreen('menu');
    }

    function startGame(size) { initGame(size); setScreen('gameplay'); }

    // ── Derived conflict data ─────────────────────────────────────────────────
    const conflictData = computeConflicts(userState, regions, n);

    return {
        screen, setScreen, showVictory, setShowVictory, showStats, setShowStats,
        showConfirmReset, setShowConfirmReset, showSettings, setShowSettings, isLightTheme, setIsLightTheme,
        queenMarker, setQueenMarker,
        n, solution, regions, userState, history, isGameWon, isAutoCrossEnabled,
        isPaused, secondsElapsed, stats, newRecord, conflictData,
        initGame, startGame, continueGame, abandonGame, goToMenu, resetAllProgress,
        toggleAutoCross, togglePause, undo, clearBoard,
        handleCellPointerDown, processDragMove, handleGestureEnd,
    };
}
