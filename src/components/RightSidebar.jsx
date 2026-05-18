import { formatTime } from '../utils/helpers';

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const IconPause = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
        <rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" />
    </svg>
);

const IconResume = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);

const IconUndo = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
        <path d="M3 10h10a5 5 0 0 1 5 5v0a5 5 0 0 1-5 5H7" /><polyline points="7 6 3 10 7 14" />
    </svg>
);

const IconClear = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

// ── RuleItem ──────────────────────────────────────────────────────────────────

function RuleItem({ id, label, satisfied, invalid }) {
    const cls = `rule-item${satisfied ? ' satisfied' : ''}${invalid ? ' invalid' : ''}`;
    return (
        <div className={cls} id={id}>
            <span className="status-indicator" />
            <span>{label}</span>
        </div>
    );
}

// ── RightSidebar ──────────────────────────────────────────────────────────────

export default function RightSidebar({
    n, queens, secondsElapsed,
    isAutoCrossEnabled, isPaused, canUndo,
    conflictData,
    onToggleAutoCross, onTogglePause, onUndo, onClear,
}) {
    const { rowSatisfied, colSatisfied, regSatisfied, touchSatisfied,
            hasRowConflict, hasColConflict, hasRegConflict, hasTouchConflict } = conflictData;

    return (
        <aside className="sidebar sidebar-right glass-panel">
            <section className="game-stats">
                <div className="stat-box">
                    <span className="stat-label">Queens</span>
                    <span className="stat-value" id="queens-count">{queens} / {n}</span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">Time</span>
                    <span className="stat-value" id="timer">{formatTime(secondsElapsed)}</span>
                </div>
            </section>

            <div className="action-buttons sidebar-actions">
                <div className="toggle-wrapper action-toggle">
                    <label htmlFor="auto-cross-toggle-sidebar" className="toggle-label" style={{ cursor: 'pointer' }}>
                        Auto Cross
                    </label>
                    <button
                        id="auto-cross-toggle-sidebar"
                        className="btn-toggle"
                        role="switch"
                        aria-checked={String(isAutoCrossEnabled)}
                        onClick={onToggleAutoCross}
                    >
                        <span className="toggle-thumb" />
                    </button>
                </div>

                <button
                    id="btn-pause"
                    className="btn btn-secondary"
                    title={isPaused ? 'Resume' : 'Pause'}
                    data-paused={String(isPaused)}
                    onClick={onTogglePause}
                >
                    {isPaused ? <IconResume /> : <IconPause />}
                    {isPaused ? 'Resume' : 'Pause'}
                </button>

                <button id="btn-undo" className="btn btn-secondary" disabled={!canUndo} onClick={onUndo}>
                    <IconUndo />
                    Undo
                </button>

                <button id="btn-reset" className="btn btn-secondary" onClick={onClear}>
                    <IconClear />
                    Clear
                </button>
            </div>

            <section className="rules-section rules-right">
                <h2>Status</h2>
                <RuleItem id="rule-row-r"    label="Rows"        satisfied={rowSatisfied}   invalid={hasRowConflict} />
                <RuleItem id="rule-col-r"    label="Columns"     satisfied={colSatisfied}   invalid={hasColConflict} />
                <RuleItem id="rule-region-r" label="Regions"     satisfied={regSatisfied}   invalid={hasRegConflict} />
                <RuleItem id="rule-touch-r"  label="No touching" satisfied={touchSatisfied} invalid={hasTouchConflict} />
            </section>
        </aside>
    );
}
