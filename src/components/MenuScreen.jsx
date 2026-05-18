import { useState } from 'react';
import { formatTime, loadSavedGame } from '../utils/helpers';

const DIFFICULTIES = [
    { label: 'Easy',   size: 5  },
    { label: 'Medium', size: 7  },
    { label: 'Hard',   size: 9  },
    { label: 'Expert', size: 11 },
];

const CUSTOM_SIZES = [5,6,7,8,9,10,11,12,13,14,15];

// ── Sub-icons ─────────────────────────────────────────────────────────────────

const IconArrow = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);


const IconTrash = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
);

const IconSettings = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
);

const IconStats = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none">
        <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
);

const CrownLogo = ({ large }) => (
    <svg
        className={`crown-logo${large ? ' large-logo' : ''}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M2 19H22V21H2V19ZM3 5L5.5 13L9.5 7L12 15L14.5 7L18.5 13L21 5L19 17H5L3 5Z"
            fill="currentColor"
        />
    </svg>
);

// ── Custom Size Box ───────────────────────────────────────────────────────────

function CustomSizeBox({ stats, onStart }) {
    const [selectedSize, setSelectedSize] = useState(8);

    return (
        <div className="custom-size-box glass-panel">
            <div className="custom-header">
                <span className="diff-title">Custom Grid</span>
                <select
                    id="custom-size-select"
                    className="premium-select custom-dropdown"
                    value={selectedSize}
                    onChange={e => setSelectedSize(Number(e.target.value))}
                >
                    {CUSTOM_SIZES.map(s => (
                        <option key={s} value={s}>{s} × {s}</option>
                    ))}
                </select>
            </div>
            <div className="custom-actions">
                <span className="best-time-badge" id="best-time-custom">
                    {stats[selectedSize] !== undefined
                        ? `Best: ${formatTime(stats[selectedSize].best)}`
                        : 'Best: --:--'}
                </span>
                <button id="btn-play-custom" className="btn btn-primary" onClick={() => onStart(selectedSize)}>
                    Play Custom
                </button>
            </div>
        </div>
    );
}

// ── MenuScreen ────────────────────────────────────────────────────────────────

export default function MenuScreen({ stats, onStart, onContinue, onSettings, onResetProgress, onStats }) {
    const savedData = loadSavedGame();
    const hasUnfinishedGame = savedData && savedData.history && savedData.history.length > 0;

    return (
        <div id="menu-screen" className="menu-container glass-panel">
            <div className="menu-header">
                <CrownLogo large />
                <h1>Queens Grid Puzzle</h1>
                <p className="subtitle">Select a difficulty to start your mental challenge</p>
            </div>

            {hasUnfinishedGame && (
                <div id="resume-section" className="resume-wrapper" style={{ marginBottom: '1.5rem' }}>
                    <button id="btn-continue" className="btn btn-primary btn-resume" onClick={onContinue} style={{ width: '100%', padding: '1rem' }}>
                        <IconArrow />
                        <span style={{ fontSize: '1.2rem' }}>Continue Game</span>
                    </button>
                </div>
            )}

            <div className="difficulty-bars-list">
                {DIFFICULTIES.map(({ label, size }) => (
                    <button
                        key={size}
                        className="difficulty-bar glass-panel"
                        data-size={size}
                        onClick={() => onStart(size)}
                    >
                        <div className="diff-left">
                            <span className="diff-title text-gold">{label}</span>
                            <span className="diff-size">{size} × {size}</span>
                        </div>
                        <span className="best-time-badge" id={`best-time-${size}`}>
                            {stats[size] !== undefined ? formatTime(stats[size].best) : '--:--'}
                        </span>
                    </button>
                ))}
            </div>

            <CustomSizeBox stats={stats} onStart={onStart} />

            <div className="menu-footer" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button id="btn-menu-stats" className="btn btn-secondary" onClick={onStats}>
                    <IconStats />
                    Stats
                </button>
                <button id="btn-menu-settings" className="btn btn-secondary" onClick={onSettings}>
                    <IconSettings />
                    Settings
                </button>
                <button id="btn-reset-progress" className="btn btn-danger-outline" onClick={onResetProgress}>
                    <IconTrash />
                    Reset All Progress
                </button>
            </div>
        </div>
    );
}
