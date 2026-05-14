// Persistent Records & Storage Keys
const BEST_TIMES_KEY = 'queens_best_times';
const SAVED_GAME_KEY = 'queens_saved_game';

// Game Core State
let n = 5;
let solution = [];
let regions = [];
let userState = [];
let history = [];
let timerInterval = null;
let secondsElapsed = 0;
let isGameWon = false;
let isAutoCrossEnabled = false;
let isPaused = false;

// Interaction / Gesture State
let isPointerDown = false;
let dragMode = null; // "add_cross" or "remove_cross"
let dragStartKey = null;
let hasDraggedToNewCell = false;
let draggedCellsSet = new Set();

// Persistent State Storage Object
let bestTimes = JSON.parse(localStorage.getItem(BEST_TIMES_KEY)) || {};

// SVG Assets
const QUEEN_SVG = `<svg class="marker-queen" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 19H22V21H2V19ZM3 5L5.5 13L9.5 7L12 15L14.5 7L18.5 13L21 5L19 17H5L3 5Z"/>
</svg>`;
const CROSS_HTML = `<div class="marker-cross"></div>`;

// DOM Elements
const themeToggleBtn = document.getElementById('btn-theme-toggle');
const menuScreen = document.getElementById('menu-screen');
const gameplayScreen = document.getElementById('gameplay-screen');
const resumeSection = document.getElementById('resume-section');
const continueBtn = document.getElementById('btn-continue');
const difficultyBars = document.querySelectorAll('.difficulty-bar');
const customSelect = document.getElementById('custom-size-select');
const playCustomBtn = document.getElementById('btn-play-custom');
const menuBtn = document.getElementById('btn-menu');
const pauseBtn = document.getElementById('btn-pause');
const resetProgressBtn = document.getElementById('btn-reset-progress');

const boardElement = document.getElementById('game-board');
const newGameBtn = document.getElementById('btn-new-game');
const autoCrossToggleBtn = document.getElementById('auto-cross-toggle');
const undoBtn = document.getElementById('btn-undo');
const resetBtn = document.getElementById('btn-reset');
const queensCountEl = document.getElementById('queens-count');
const timerEl = document.getElementById('timer');
const victoryModal = document.getElementById('victory-modal');
const finalTimeEl = document.getElementById('final-time');
const finalSizeEl = document.getElementById('final-size');
const newRecordNotice = document.getElementById('new-record-notice');
const playAgainBtn = document.getElementById('btn-play-again');

// Rules UI Elements (left panel)
const ruleRowEl    = document.getElementById('rule-row');
const ruleColEl    = document.getElementById('rule-col');
const ruleRegionEl = document.getElementById('rule-region');
const ruleTouchEl  = document.getElementById('rule-touch');
// Rules UI Elements (right panel)
const ruleRowREl    = document.getElementById('rule-row-r');
const ruleColREl    = document.getElementById('rule-col-r');
const ruleRegionREl = document.getElementById('rule-region-r');
const ruleTouchREl  = document.getElementById('rule-touch-r');

// Format seconds as MM:SS string beautifully
function formatTime(secs) {
    const mins = String(Math.floor(secs / 60)).padStart(2, '0');
    const remSecs = String(secs % 60).padStart(2, '0');
    return `${mins}:${remSecs}`;
}

// Update Best Times UI markers across menu cards
function updateBestTimesDisplay() {
    [5, 7, 9, 11].forEach(size => {
        const badge = document.getElementById(`best-time-${size}`);
        if (badge) {
            badge.textContent = bestTimes[size] !== undefined ? formatTime(bestTimes[size]) : '--:--';
        }
    });

    const customBadge = document.getElementById('best-time-custom');
    if (customBadge && customSelect) {
        const currentCustomSize = customSelect.value;
        customBadge.textContent = bestTimes[currentCustomSize] !== undefined ? `Best: ${formatTime(bestTimes[currentCustomSize])}` : 'Best: --:--';
    }
}

// Save active game progress to local storage
function persistCurrentGame() {
    if (isGameWon) {
        localStorage.removeItem(SAVED_GAME_KEY);
        return;
    }
    const stateObj = {
        n, solution, regions, userState, history, secondsElapsed, isAutoCrossEnabled
    };
    localStorage.setItem(SAVED_GAME_KEY, JSON.stringify(stateObj));
}

// Check and manage Resume UI status
function checkSavedGameStatus() {
    const savedStr = localStorage.getItem(SAVED_GAME_KEY);
    if (savedStr) {
        try {
            const data = JSON.parse(savedStr);
            if (data && data.n && data.userState) {
                resumeSection.classList.remove('hidden');
                return;
            }
        } catch (e) {
            // fail silently on bad storage content
        }
    }
    resumeSection.classList.add('hidden');
}

// Transition helper controllers
function showMenuScreen() {
    gameplayScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    victoryModal.classList.add('hidden');
    checkSavedGameStatus();
    updateBestTimesDisplay();
    clearInterval(timerInterval); // pause live execution during main menu views
}

function showGameplayScreen() {
    menuScreen.classList.add('hidden');
    gameplayScreen.classList.remove('hidden');
}

// Algorithm 1: Generate Valid Queens Position
function generateQueenPositions(size) {
    while (true) {
        let perm = Array.from({length: size}, (_, i) => i);
        // Shuffle permutation
        for (let i = size - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [perm[i], perm[j]] = [perm[j], perm[i]];
        }
        
        let valid = true;
        // Check diagonal adjacency condition
        for (let i = 0; i < size - 1; i++) {
            if (Math.abs(perm[i] - perm[i+1]) <= 1) {
                valid = false;
                break;
            }
        }
        if (valid) return perm;
    }
}

// Algorithm 2: Region Growth
function generateRegions(size, queenSolution) {
    // Initialize grid with -1
    let grid = Array.from({length: size}, () => Array(size).fill(-1));
    
    // Assign each queen cell as the starting point for its region
    for (let c = 0; c < size; c++) {
        let r = queenSolution[c];
        grid[r][c] = c;
    }

    // Grow regions until full coverage
    while (true) {
        let regionNeighbors = Array.from({length: size}, () => []);
        
        // Find orthogonal unassigned neighbors for each region
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (grid[r][c] !== -1) {
                    let reg = grid[r][c];
                    const dirs = [[-1,0], [1,0], [0,-1], [0,1]];
                    for (let [dr, dc] of dirs) {
                        let nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === -1) {
                            // Only add unique cells
                            if (!regionNeighbors[reg].some(cell => cell.r === nr && cell.c === nc)) {
                                regionNeighbors[reg].push({r: nr, c: nc});
                            }
                        }
                    }
                }
            }
        }

        // Gather regions that can expand
        let activeRegions = [];
        for (let i = 0; i < size; i++) {
            if (regionNeighbors[i].length > 0) {
                activeRegions.push(i);
            }
        }

        if (activeRegions.length === 0) {
            // Check if any trapped unassigned cells remain and resolve them
            let unassignedLeft = false;
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    if (grid[r][c] === -1) {
                        unassignedLeft = true;
                        // Force assign to any assigned orthogonal neighbor
                        const dirs = [[-1,0], [1,0], [0,-1], [0,1]];
                        for (let [dr, dc] of dirs) {
                            let nr = r + dr, nc = c + dc;
                            if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] !== -1) {
                                grid[r][c] = grid[nr][nc];
                                break;
                            }
                        }
                    }
                }
            }
            if (!unassignedLeft) break;
        } else {
            // Choose a random expandable region
            let chosenReg = activeRegions[Math.floor(Math.random() * activeRegions.length)];
            let neighbors = regionNeighbors[chosenReg];
            // Choose a random neighboring cell to assign
            let chosenCell = neighbors[Math.floor(Math.random() * neighbors.length)];
            grid[chosenCell.r][chosenCell.c] = chosenReg;
        }
    }
    return grid;
}

// Initialize New Game Bundle
function initGame(targetSize) {
    n = targetSize !== undefined ? parseInt(targetSize, 10) : n;
    isGameWon = false;
    history = [];
    undoBtn.disabled = true;
    victoryModal.classList.add('hidden');
    newRecordNotice.classList.add('hidden');

    // Clean drag buffers
    isPointerDown = false;
    dragMode = null;
    dragStartKey = null;
    hasDraggedToNewCell = false;
    draggedCellsSet.clear();

    // Generate puzzle mapping
    solution = generateQueenPositions(n);
    regions = generateRegions(n, solution);
    
    // Allocate slot storage
    userState = Array.from({length: n}, () => Array(n).fill(""));

    // Reset runtime timers
    clearInterval(timerInterval);
    secondsElapsed = 0;
    updateTimerDisplay();
    startTimer();

    // Map output nodes
    renderBoard();
    validateAndRenderState();

    // Reset pause state
    isPaused = false;
    if (pauseBtn) {
        pauseBtn.dataset.paused = 'false';
        pauseBtn.title = 'Pause';
        pauseBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg> Pause`;
    }

    // Write persistent storage state
    persistCurrentGame();
}

// Resume Persistent Saved Data Function
function loadSavedGame() {
    const savedStr = localStorage.getItem(SAVED_GAME_KEY);
    if (!savedStr) return;
    try {
        const data = JSON.parse(savedStr);
        n = data.n;
        solution = data.solution;
        regions = data.regions;
        userState = data.userState;
        history = data.history || [];
        secondsElapsed = data.secondsElapsed || 0;
        isAutoCrossEnabled = !!data.isAutoCrossEnabled;
        isGameWon = false;

        // Propagate loaded attributes
        undoBtn.disabled = (history.length === 0);
        autoCrossToggleBtn.setAttribute('aria-checked', isAutoCrossEnabled);
        victoryModal.classList.add('hidden');
        newRecordNotice.classList.add('hidden');

        // Flush gestures
        isPointerDown = false;
        dragMode = null;
        dragStartKey = null;
        hasDraggedToNewCell = false;
        draggedCellsSet.clear();

        updateTimerDisplay();
        startTimer();

        renderBoard();
        validateAndRenderState();

        showGameplayScreen();
    } catch (e) {
        initGame(7);
        showGameplayScreen();
    }
}

// Timer setup
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!isGameWon && !isPaused) {
            secondsElapsed++;
            updateTimerDisplay();
            persistCurrentGame();
        }
    }, 1000);
}

// Deep copy 2D array
function copy2DArray(arr) {
    return arr.map(row => [...row]);
}

// Push to Undo History
function saveState() {
    history.push(copy2DArray(userState));
    undoBtn.disabled = false;
}

// Format Timer Output
function updateTimerDisplay() {
    timerEl.textContent = formatTime(secondsElapsed);
}

// Render the entire grid container structure
function renderBoard() {
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${n}, 1fr)`;

    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const cell = document.createElement('div');
            // Supporting fully scalable distinct colors mapped safely with % 16 modulo
            cell.className = `cell region-${regions[r][c] % 16}`;
            
            // Region boundary custom thick borders
            if (r === 0 || regions[r-1][c] !== regions[r][c]) cell.classList.add('border-top');
            if (r === n-1 || regions[r+1][c] !== regions[r][c]) cell.classList.add('border-bottom');
            if (c === 0 || regions[r][c-1] !== regions[r][c]) cell.classList.add('border-left');
            if (c === n-1 || regions[r][c+1] !== regions[r][c]) cell.classList.add('border-right');

            cell.dataset.r = r;
            cell.dataset.c = c;
            cell.id = `cell-${r}-${c}`;

            // Attach Pointer tracking for Drag / Tap Gestures
            cell.addEventListener('pointerdown', (e) => {
                if (isGameWon) return;
                
                isPointerDown = true;
                hasDraggedToNewCell = false;
                dragStartKey = `${r}-${c}`;
                draggedCellsSet.clear();

                // Check action classification based on origin state
                const currentState = userState[r][c];
                if (currentState === "") {
                    dragMode = "add_cross";
                } else if (currentState === "X") {
                    dragMode = "remove_cross";
                } else {
                    dragMode = null; // Do not mass cross if initiated directly from a Queen
                }

                // Preserve transaction history state
                saveState();
            });

            cell.addEventListener('pointerenter', (e) => {
                if (!isPointerDown || isGameWon || dragMode === null) return;
                
                const currentKey = `${r}-${c}`;
                if (currentKey !== dragStartKey) {
                    if (!hasDraggedToNewCell) {
                        hasDraggedToNewCell = true;
                        // Execute drag mode on origin cell first
                        const [sr, sc] = dragStartKey.split('-').map(Number);
                        applyDragToTarget(sr, sc);
                    }
                    applyDragToTarget(r, c);
                }
            });

            boardElement.appendChild(cell);
        }
    }
}

// Process drag mapping to target cell instantly
function applyDragToTarget(r, c) {
    const key = `${r}-${c}`;
    if (draggedCellsSet.has(key)) return;
    draggedCellsSet.add(key);

    if (dragMode === "add_cross" && userState[r][c] === "") {
        userState[r][c] = "X";
        validateAndRenderState();
    } else if (dragMode === "remove_cross" && userState[r][c] === "X") {
        userState[r][c] = "";
        validateAndRenderState();
    }
}

// Board level Touchmove handling for mobile viewports
boardElement.addEventListener('touchmove', (e) => {
    if (!isPointerDown || isGameWon || dragMode === null) return;
    e.preventDefault(); // Prevents webview panning while dragging logic elements

    const touch = e.touches[0];
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const cellEl = targetEl?.closest('.cell');
    if (cellEl) {
        const r = parseInt(cellEl.dataset.r, 10);
        const c = parseInt(cellEl.dataset.c, 10);
        const currentKey = `${r}-${c}`;
        if (currentKey !== dragStartKey) {
            if (!hasDraggedToNewCell) {
                hasDraggedToNewCell = true;
                const [sr, sc] = dragStartKey.split('-').map(Number);
                applyDragToTarget(sr, sc);
            }
            applyDragToTarget(r, c);
        }
    }
}, { passive: false });

// Finalize Gesture lifecycle globally
function handleGestureEnd() {
    if (isPointerDown) {
        if (!hasDraggedToNewCell && dragStartKey !== null) {
            // Recognized strictly as a direct single click/tap operation
            const [sr, sc] = dragStartKey.split('-').map(Number);
            progressSingleClickState(sr, sc);
        } else {
            // Drag gesture finished. Trigger mass validation
            if (isAutoCrossEnabled) {
                applyAutoCross();
            }
            validateAndRenderState();
        }

        // Clean buffers
        isPointerDown = false;
        dragStartKey = null;
        dragMode = null;
        draggedCellsSet.clear();
    }
}

window.addEventListener('pointerup', handleGestureEnd);
window.addEventListener('pointercancel', handleGestureEnd);
window.addEventListener('touchend', handleGestureEnd);

// Standard cycle progression for individual cell clicks
function progressSingleClickState(r, c) {
    const currentState = userState[r][c];
    if (currentState === "") {
        userState[r][c] = "X";
    } else if (currentState === "X") {
        userState[r][c] = "Q";
    } else if (currentState === "Q") {
        userState[r][c] = "";
    }

    if (isAutoCrossEnabled) {
        applyAutoCross();
    }
    validateAndRenderState();
}

// Auto Complete Helper: automatically maps X marks to row, col, region, and nearby spots
function applyAutoCross() {
    let queens = [];
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (userState[r][c] === "Q") {
                queens.push({r, c, reg: regions[r][c]});
            }
        }
    }

    queens.forEach(q => {
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (userState[r][c] === "") {
                    const isSameRow = (r === q.r);
                    const isSameCol = (c === q.c);
                    const isSameReg = (regions[r][c] === q.reg);
                    const isAdjacent = (Math.abs(r - q.r) <= 1 && Math.abs(c - q.c) <= 1);

                    if (isSameRow || isSameCol || isSameReg || isAdjacent) {
                        userState[r][c] = "X";
                    }
                }
            }
        }
    });
}

// Toggle listener setup
autoCrossToggleBtn.addEventListener('click', () => {
    isAutoCrossEnabled = !isAutoCrossEnabled;
    autoCrossToggleBtn.setAttribute('aria-checked', isAutoCrossEnabled);
    if (isAutoCrossEnabled && !isGameWon) {
        saveState();
        applyAutoCross();
        validateAndRenderState();
    }
    persistCurrentGame();
});

// Validate Board, Update Conflicts, Check Win Condition
function validateAndRenderState() {
    // 1. Gather Queens
    let queens = [];
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const cellEl = document.getElementById(`cell-${r}-${c}`);
            if (!cellEl) continue;

            cellEl.classList.remove('conflict');
            
            if (userState[r][c] === "X") {
                cellEl.innerHTML = CROSS_HTML;
            } else if (userState[r][c] === "Q") {
                cellEl.innerHTML = QUEEN_SVG;
                queens.push({r, c, reg: regions[r][c]});
            } else {
                cellEl.innerHTML = '';
            }
        }
    }

    // 2. Detect Conflicts
    let conflictCells = new Set();
    let rowCounts = Array(n).fill(0);
    let colCounts = Array(n).fill(0);
    let regCounts = Array(n).fill(0);

    queens.forEach(q => {
        rowCounts[q.r]++;
        colCounts[q.c]++;
        regCounts[q.reg]++;
    });

    let hasRowConflict = false;
    let hasColConflict = false;
    let hasRegConflict = false;
    let hasTouchConflict = false;

    // Check Row Conflicts
    queens.forEach(q => {
        if (rowCounts[q.r] > 1) {
            conflictCells.add(`${q.r}-${q.c}`);
            hasRowConflict = true;
        }
        if (colCounts[q.c] > 1) {
            conflictCells.add(`${q.r}-${q.c}`);
            hasColConflict = true;
        }
        if (regCounts[q.reg] > 1) {
            conflictCells.add(`${q.r}-${q.c}`);
            hasRegConflict = true;
        }
    });

    // Check Touch Conflicts (diagonally or orthogonally)
    for (let i = 0; i < queens.length; i++) {
        for (let j = i + 1; j < queens.length; j++) {
            const q1 = queens[i];
            const q2 = queens[j];
            if (Math.abs(q1.r - q2.r) <= 1 && Math.abs(q1.c - q2.c) <= 1) {
                conflictCells.add(`${q1.r}-${q1.c}`);
                conflictCells.add(`${q2.r}-${q2.c}`);
                hasTouchConflict = true;
            }
        }
    }

    // Apply visual conflict class
    conflictCells.forEach(key => {
        const [r, c] = key.split('-');
        document.getElementById(`cell-${r}-${c}`)?.classList.add('conflict');
    });

    // 3. Update Rule Checklist Displays (both sidebars)
    updateRuleStatus(ruleRowEl,    !hasRowConflict && rowCounts.every(cnt => cnt === 1), hasRowConflict);
    updateRuleStatus(ruleColEl,    !hasColConflict && colCounts.every(cnt => cnt === 1), hasColConflict);
    updateRuleStatus(ruleRegionEl, !hasRegConflict && regCounts.every(cnt => cnt === 1), hasRegConflict);
    updateRuleStatus(ruleTouchEl,  !hasTouchConflict && queens.length > 0, hasTouchConflict);
    updateRuleStatus(ruleRowREl,    !hasRowConflict && rowCounts.every(cnt => cnt === 1), hasRowConflict);
    updateRuleStatus(ruleColREl,    !hasColConflict && colCounts.every(cnt => cnt === 1), hasColConflict);
    updateRuleStatus(ruleRegionREl, !hasRegConflict && regCounts.every(cnt => cnt === 1), hasRegConflict);
    updateRuleStatus(ruleTouchREl,  !hasTouchConflict && queens.length > 0, hasTouchConflict);

    // Update Counter
    queensCountEl.textContent = `${queens.length} / ${n}`;

    // Store state progression bundle persistently
    persistCurrentGame();

    // 4. Check for Victory
    if (queens.length === n && conflictCells.size === 0) {
        const allSatisfied = rowCounts.every(c => c === 1) && 
                             colCounts.every(c => c === 1) && 
                             regCounts.every(c => c === 1);
        if (allSatisfied) {
            triggerVictory();
        }
    }
}

// Helper to update rule item CSS classes
function updateRuleStatus(element, isSatisfied, isInvalid) {
    if (!element) return;
    element.classList.remove('satisfied', 'invalid');
    if (isInvalid) {
        element.classList.add('invalid');
    } else if (isSatisfied) {
        element.classList.add('satisfied');
    }
}

// Handle Win
function triggerVictory() {
    isGameWon = true;
    clearInterval(timerInterval);
    localStorage.removeItem(SAVED_GAME_KEY); // wipe progress save bundle
    
    // Track Best Time record
    const prevBest = bestTimes[n];
    if (prevBest === undefined || secondsElapsed < prevBest) {
        bestTimes[n] = secondsElapsed;
        localStorage.setItem(BEST_TIMES_KEY, JSON.stringify(bestTimes));
        newRecordNotice.classList.remove('hidden');
    } else {
        newRecordNotice.classList.add('hidden');
    }

    // Show Modal
    finalTimeEl.textContent = timerEl.textContent;
    finalSizeEl.textContent = `${n} × ${n}`;
    victoryModal.classList.remove('hidden');
}

// UI Setup Menu Event Listeners
continueBtn.addEventListener('click', loadSavedGame);

difficultyBars.forEach(bar => {
    bar.addEventListener('click', () => {
        initGame(bar.dataset.size);
        showGameplayScreen();
    });
});

customSelect?.addEventListener('change', () => {
    updateBestTimesDisplay();
});

playCustomBtn.addEventListener('click', () => {
    initGame(customSelect.value);
    showGameplayScreen();
});

// Gameplay header trigger actions
menuBtn.addEventListener('click', () => {
    persistCurrentGame();
    showMenuScreen();
});

// Pause button
pauseBtn?.addEventListener('click', () => {
    if (isGameWon) return;
    isPaused = !isPaused;
    const paused = isPaused;
    pauseBtn.dataset.paused = paused ? 'true' : 'false';
    pauseBtn.title = paused ? 'Resume' : 'Pause';
    pauseBtn.innerHTML = paused
        ? `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polygon points="5 3 19 12 5 21 5 3"/></svg> Resume`
        : `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg> Pause`;
    const overlay = document.getElementById('pause-overlay');
    if (overlay) overlay.classList.toggle('hidden', !paused);
});

// Reset All Progress button (with confirmation modal)
resetProgressBtn?.addEventListener('click', () => {
    const confirmModal = document.getElementById('confirm-reset-modal');
    if (confirmModal) confirmModal.classList.remove('hidden');
});

document.getElementById('btn-confirm-reset')?.addEventListener('click', () => {
    localStorage.removeItem(BEST_TIMES_KEY);
    localStorage.removeItem(SAVED_GAME_KEY);
    bestTimes = {};
    updateBestTimesDisplay();
    document.getElementById('confirm-reset-modal')?.classList.add('hidden');
    initGame(5);
    showGameplayScreen();
});

document.getElementById('btn-cancel-reset')?.addEventListener('click', () => {
    document.getElementById('confirm-reset-modal')?.classList.add('hidden');
});

newGameBtn.addEventListener('click', () => {
    initGame(n);
});

playAgainBtn.addEventListener('click', () => {
    showMenuScreen();
});

resetBtn.addEventListener('click', () => {
    if (isGameWon) return;
    saveState();
    userState = Array.from({length: n}, () => Array(n).fill(""));
    validateAndRenderState();
});

undoBtn.addEventListener('click', () => {
    if (history.length === 0 || isGameWon) return;
    userState = history.pop();
    if (history.length === 0) undoBtn.disabled = true;
    validateAndRenderState();
});

// Theme Toggle Logic
const THEME_KEY = 'queens_theme_pref';
if (localStorage.getItem(THEME_KEY) === 'light') {
    document.body.classList.add('light-theme');
}

themeToggleBtn?.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
});

// Stats Modal
const statsBtn = document.getElementById('btn-stats');
const statsModal = document.getElementById('stats-modal');
const closeStatsBtn = document.getElementById('btn-close-stats');
const statsContainer = document.getElementById('stats-table-container');
const DIFFICULTY_NAMES = { 5: 'Easy (5\u00d75)', 7: 'Medium (7\u00d77)', 9: 'Hard (9\u00d79)', 11: 'Expert (11\u00d711)' };

function computeStats() {
    const rows = Object.keys(bestTimes).sort((a, b) => Number(a) - Number(b));
    if (rows.length === 0) {
        if (statsContainer) statsContainer.innerHTML = '<p class="stats-empty">No games completed yet.<br>Finish a puzzle to see your stats here.</p>';
        return;
    }
    let html = '<table class="stats-table"><thead><tr><th>Level</th><th>Best Time</th></tr></thead><tbody>';
    rows.forEach(size => {
        const label = DIFFICULTY_NAMES[size] || `Custom (${size}\u00d7${size})`;
        html += `<tr><td>${label}</td><td>${formatTime(bestTimes[size])}</td></tr>`;
    });
    html += '</tbody></table>';
    if (statsContainer) statsContainer.innerHTML = html;
}

statsBtn?.addEventListener('click', () => { computeStats(); statsModal?.classList.remove('hidden'); });
closeStatsBtn?.addEventListener('click', () => { statsModal?.classList.add('hidden'); });
statsModal?.addEventListener('click', (e) => { if (e.target === statsModal) statsModal.classList.add('hidden'); });


if (typeof ytgame !== 'undefined' && ytgame?.game?.firstFrameReady) {
    ytgame.game.firstFrameReady();
}

// Start directly on 5×5 gameplay – menu is just a menu, not a starting screen
initGame(5);
showGameplayScreen();

