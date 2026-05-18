// ── SVG Icons ─────────────────────────────────────────────────────────────────

const IconStats = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const IconMenu = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
        <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
);

const IconNewGame = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
        <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
);

const IconSettings = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
);

const CrownLogo = () => (
    <svg className="crown-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M2 19H22V21H2V19ZM3 5L5.5 13L9.5 7L12 15L14.5 7L18.5 13L21 5L19 17H5L3 5Z"
            fill="currentColor"
        />
    </svg>
);

// ── GameHeader ────────────────────────────────────────────────────────────────

export default function GameHeader({ onStats, onMenu, onNewGame, onSettings }) {
    return (
        <header className="glass-panel">
            <div className="header-content">
                <div className="logo-area">
                    <CrownLogo />
                    <h1>Queens Grid</h1>
                </div>
                <nav className="controls-nav">
                    <button id="btn-stats" className="btn btn-secondary" title="Personal Stats" onClick={onStats}>
                        <IconStats />
                        Stats
                    </button>
                    <button id="btn-settings" className="btn btn-secondary" onClick={onSettings}>
                        <IconSettings />
                        Settings
                    </button>
                    <button id="btn-menu" className="btn btn-secondary" onClick={onMenu}>
                        <IconMenu />
                        Menu
                    </button>
                    <button id="btn-new-game" className="btn btn-primary" onClick={onNewGame}>
                        <IconNewGame />
                        New Game
                    </button>
                </nav>
            </div>
        </header>
    );
}
