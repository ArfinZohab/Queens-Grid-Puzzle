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

// ── LeftSidebar ───────────────────────────────────────────────────────────────

export default function LeftSidebar({ conflictData }) {
    const { rowSatisfied, colSatisfied, regSatisfied, touchSatisfied,
            hasRowConflict, hasColConflict, hasRegConflict, hasTouchConflict } = conflictData;

    return (
        <aside className="sidebar sidebar-left glass-panel">
            <section className="rules-section">
                <h2>Puzzle Goals</h2>
                <RuleItem id="rule-row"    label="One Queen per row"    satisfied={rowSatisfied}   invalid={hasRowConflict} />
                <RuleItem id="rule-col"    label="One Queen per column" satisfied={colSatisfied}   invalid={hasColConflict} />
                <RuleItem id="rule-region" label="One Queen per region" satisfied={regSatisfied}   invalid={hasRegConflict} />
                <RuleItem id="rule-touch"  label="No Queens touch"      satisfied={touchSatisfied} invalid={hasTouchConflict} />
            </section>

            <section className="info-section">
                <h2>How to Play</h2>
                <ul className="instructions-list">
                    <li>
                        <span className="action-badge">Click Once</span>
                        <p>Place an <strong>X</strong> marker in the cell.</p>
                    </li>
                    <li>
                        <span className="action-badge">Click Twice</span>
                        <p>Place a <strong className="text-gold">Queen</strong> in the cell.</p>
                    </li>
                    <li>
                        <span className="action-badge">Click &amp; Drag</span>
                        <p>Draw or erase <strong>X</strong> marks across cells.</p>
                    </li>
                </ul>
            </section>
        </aside>
    );
}
