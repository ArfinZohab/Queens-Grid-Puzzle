import { formatTime } from '../utils/helpers';

// ── VictoryModal ──────────────────────────────────────────────────────────────

export function VictoryModal({ n, secondsElapsed, newRecord, onMenu }) {
    return (
        <div id="victory-modal" className="modal-overlay">
            <div className="modal-content glass-panel premium-modal">
                <div className="trophy-icon">🏆</div>
                <h2>Brilliant Victory!</h2>
                <p>You have successfully placed all queens and solved the puzzle.</p>
                <div className="final-stats">
                    <div>Time: <strong id="final-time">{formatTime(secondsElapsed)}</strong></div>
                    <div>Grid Size: <strong id="final-size">{n} × {n}</strong></div>
                </div>
                {newRecord && (
                    <div className="best-time-notice mb-3 text-gold" id="new-record-notice">
                        ✨ New Personal Best! ✨
                    </div>
                )}
                <button id="btn-play-again" className="btn btn-primary btn-large" onClick={onMenu}>
                    Menu
                </button>
            </div>
        </div>
    );
}

// ── StatsModal ────────────────────────────────────────────────────────────────

export function StatsModal({ stats, onClose, onResetProgress }) {
    const rows = Object.keys(stats).sort((a, b) => Number(a) - Number(b));

    return (
        <div id="stats-modal" className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-content glass-panel premium-modal stats-modal-content" style={{ maxWidth: '600px' }}>
                <h2 style={{ color: 'var(--accent-gold)' }}>📊 Personal Stats</h2>
                <div id="stats-table-container" className="stats-table-wrapper">
                    {rows.length === 0 ? (
                        <p className="stats-empty">No games completed yet.<br />Finish a puzzle to see your stats here.</p>
                    ) : (
                        <table className="stats-table">
                            <thead>
                                <tr><th>Level</th><th>Best Time</th><th>Avg Time</th><th>Games</th></tr>
                            </thead>
                            <tbody>
                                {rows.map(size => {
                                    const stat = stats[size];
                                    const avg = Math.round(stat.total / stat.count);
                                    return (
                                        <tr key={size}>
                                            <td>{size} × {size}</td>
                                            <td>{formatTime(stat.best)}</td>
                                            <td>{formatTime(avg)}</td>
                                            <td>{stat.count}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button id="btn-reset-stats" className="btn btn-danger-outline btn-large" style={{ flex: 1 }} onClick={onResetProgress}>
                        Reset Progress
                    </button>
                    <button id="btn-close-stats" className="btn btn-secondary btn-large" style={{ flex: 1 }} onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── ConfirmResetModal ─────────────────────────────────────────────────────────

export function ConfirmResetModal({ onConfirm, onCancel }) {
    return (
        <div id="confirm-reset-modal" className="modal-overlay">
            <div className="modal-content glass-panel premium-modal">
                <div className="trophy-icon" style={{ fontSize: '3rem' }}>⚠️</div>
                <h2 style={{ color: 'var(--danger)' }}>Reset All Progress?</h2>
                <p>This will permanently delete all your best times and saved games. This cannot be undone.</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button id="btn-cancel-reset" className="btn btn-secondary btn-large" style={{ flex: 1 }} onClick={onCancel}>
                        Cancel
                    </button>
                    <button id="btn-confirm-reset" className="btn btn-large" style={{ flex: 1, background: 'var(--danger)', color: '#fff' }} onClick={onConfirm}>
                        Yes, Reset
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── SettingsModal ─────────────────────────────────────────────────────────────

export function SettingsModal({ isLightTheme, onToggleTheme, isAutoCrossEnabled, onToggleAutoCross, onClose }) {
    return (
        <div id="settings-modal" className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-content glass-panel premium-modal" style={{ gap: '1.5rem' }}>
                <h2 style={{ color: 'var(--accent-gold)' }}>⚙️ Settings</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', textAlign: 'left' }}>
                    <div className="difficulty-bar" style={{ cursor: 'default' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>Light Theme</span>
                        <div className="toggle-wrapper">
                            <button
                                className="btn-toggle"
                                role="switch"
                                aria-checked={String(isLightTheme)}
                                onClick={onToggleTheme}
                            >
                                <span className="toggle-thumb" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="difficulty-bar" style={{ cursor: 'default' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>Auto Cross</span>
                        <div className="toggle-wrapper">
                            <button
                                className="btn-toggle"
                                role="switch"
                                aria-checked={String(isAutoCrossEnabled)}
                                onClick={onToggleAutoCross}
                            >
                                <span className="toggle-thumb" />
                            </button>
                        </div>
                    </div>
                </div>

                <button id="btn-close-settings" className="btn btn-secondary btn-large" style={{ marginTop: '0.5rem', width: '100%' }} onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}

