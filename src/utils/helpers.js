export const BEST_TIMES_KEY = 'queens_best_times';
export const SAVED_GAME_KEY = 'queens_saved_game';
export const THEME_KEY = 'queens_theme_pref';

export function formatTime(secs) {
    const mins = String(Math.floor(secs / 60)).padStart(2, '0');
    const remSecs = String(secs % 60).padStart(2, '0');
    return `${mins}:${remSecs}`;
}

export function loadStats() {
    try {
        const data = JSON.parse(localStorage.getItem(BEST_TIMES_KEY)) || {};
        for (const key in data) {
            const val = data[key];
            if (typeof val !== 'object' || val === null || val.best === undefined) {
                const num = Number(val) || 0;
                data[key] = { best: num, total: num, count: 1 };
            }
        }
        return data;
    } catch {
        return {};
    }
}

export function saveStats(stats) {
    localStorage.setItem(BEST_TIMES_KEY, JSON.stringify(stats));
}

export function loadSavedGame() {
    try {
        const raw = localStorage.getItem(SAVED_GAME_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (data?.n && data?.userState) return data;
    } catch {
        // ignore bad storage
    }
    return null;
}

export function persistGame(state) {
    localStorage.setItem(SAVED_GAME_KEY, JSON.stringify(state));
}

export function clearSavedGame() {
    localStorage.removeItem(SAVED_GAME_KEY);
}

export function copy2DArray(arr) {
    return arr.map(row => [...row]);
}
