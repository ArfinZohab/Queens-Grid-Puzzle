import { useEffect, useMemo } from 'react';
import { useGameState } from './hooks/useGameState';
import MenuScreen from './components/MenuScreen';
import GameplayScreen from './components/GameplayScreen';
import { VictoryModal, StatsModal, ConfirmResetModal, SettingsModal } from './components/Modals';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
    const game = useGameState();

    // Bootstrap: start a 5×5 game immediately on mount
    useEffect(() => {
        game.initGame(5);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // YouTube Playables SDK hook
    useEffect(() => {
        if (typeof ytgame !== 'undefined' && ytgame?.game?.firstFrameReady) {
            ytgame.game.firstFrameReady();
        }
    }, []);

    const theme = useMemo(() => {
        return getTheme(game.isLightTheme ? 'light' : 'dark');
    }, [game.isLightTheme]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="app-container">
                {game.screen === 'menu' ? (
                    <MenuScreen
                        stats={game.stats}
                        onStart={game.startGame}
                        onContinue={game.continueGame}
                        onSettings={() => game.setShowSettings(true)}
                        onStats={() => game.setShowStats(true)}
                        onResetProgress={() => game.setShowConfirmReset(true)}
                    />
                ) : (
                    <GameplayScreen
                        n={game.n}
                        regions={game.regions}
                        userState={game.userState}
                        conflictData={game.conflictData}
                        isAutoCrossEnabled={game.isAutoCrossEnabled}
                        isPaused={game.isPaused}
                        canUndo={game.history.length > 0 && !game.isGameWon}
                        secondsElapsed={game.secondsElapsed}
                        queenMarker={game.queenMarker}
                        onStats={() => game.setShowStats(true)}
                        onMenu={game.goToMenu}
                        onNewGame={() => game.initGame(game.n)}
                        onSettings={() => game.setShowSettings(true)}
                        onToggleAutoCross={game.toggleAutoCross}
                        onTogglePause={game.togglePause}
                        onUndo={game.undo}
                        onClear={game.clearBoard}
                        onCellPointerDown={game.handleCellPointerDown}
                        onCellPointerEnter={game.processDragMove}
                        onGestureEnd={game.handleGestureEnd}
                    />
                )}
            </div>

            {/* Modals rendered outside the screen flow so they overlay everything */}
            {game.showVictory && (
                <VictoryModal
                    n={game.n}
                    secondsElapsed={game.secondsElapsed}
                    newRecord={game.newRecord}
                    onMenu={() => { game.setShowVictory(false); game.goToMenu(); }}
                />
            )}

            {game.showStats && (
                <StatsModal
                    stats={game.stats}
                    onClose={() => game.setShowStats(false)}
                    onResetProgress={() => {
                        game.setShowStats(false);
                        game.setShowConfirmReset(true);
                    }}
                />
            )}

            {game.showConfirmReset && (
                <ConfirmResetModal
                    onConfirm={game.resetAllProgress}
                    onCancel={() => game.setShowConfirmReset(false)}
                />
            )}

            {game.showSettings && (
                <SettingsModal
                    isLightTheme={game.isLightTheme}
                    onToggleTheme={() => game.setIsLightTheme(v => !v)}
                    isAutoCrossEnabled={game.isAutoCrossEnabled}
                    onToggleAutoCross={game.toggleAutoCross}
                    queenMarker={game.queenMarker}
                    onChangeQueenMarker={game.setQueenMarker}
                    onClose={() => game.setShowSettings(false)}
                />
            )}
        </ThemeProvider>
    );
}
