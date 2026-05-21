import GameHeader from './GameHeader';
import LeftSidebar from './LeftSidebar';
import GameBoard from './GameBoard';
import RightSidebar from './RightSidebar';

export default function GameplayScreen({
    n, regions, userState, conflictData,
    isAutoCrossEnabled, isPaused, canUndo, secondsElapsed,
    queenMarker,
    onStats, onMenu, onNewGame, onSettings,
    onToggleAutoCross, onTogglePause, onUndo, onClear,
    onCellPointerDown, onCellPointerEnter, onGestureEnd,
}) {
    const queensPlaced = conflictData.queens.length;

    return (
        <div id="gameplay-screen" className="gameplay-container">
            <GameHeader onStats={onStats} onMenu={onMenu} onNewGame={onNewGame} onSettings={onSettings} />

            <main className="main-content">
                <LeftSidebar conflictData={conflictData} queenMarker={queenMarker} />

                <GameBoard
                    n={n}
                    regions={regions}
                    userState={userState}
                    conflictData={conflictData}
                    isPaused={isPaused}
                    queenMarker={queenMarker}
                    onTogglePause={onTogglePause}
                    onCellPointerDown={onCellPointerDown}
                    onCellPointerEnter={onCellPointerEnter}
                    onGestureEnd={onGestureEnd}
                />

                <RightSidebar
                    n={n}
                    queens={queensPlaced}
                    secondsElapsed={secondsElapsed}
                    isAutoCrossEnabled={isAutoCrossEnabled}
                    isPaused={isPaused}
                    canUndo={canUndo}
                    conflictData={conflictData}
                    queenMarker={queenMarker}
                    onToggleAutoCross={onToggleAutoCross}
                    onTogglePause={onTogglePause}
                    onUndo={onUndo}
                    onClear={onClear}
                />
            </main>
        </div>
    );
}
