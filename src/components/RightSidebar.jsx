import { formatTime } from '../utils/helpers';
import {
    Box,
    Card,
    Typography,
    Stack,
    Button,
    Switch,
    FormControlLabel,
    List,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import UndoIcon from '@mui/icons-material/Undo';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { RuleItem } from './LeftSidebar';

// ── Styled Components ─────────────────────────────────────────────────────────

const SidebarCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(2.5),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    height: '100%',
}));

const StatPanel = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5),
    background: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.02)',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
    borderRadius: '12px',
    textAlign: 'center',
    flex: 1,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontSize: '0.85rem',
    color: theme.palette.secondary.main,
    marginBottom: theme.spacing(1.5),
}));

const ToggleContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    background: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.01)',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'}`,
    borderRadius: '12px',
}));

// ── RightSidebar ──────────────────────────────────────────────────────────────

export default function RightSidebar({
    n, queens, secondsElapsed,
    isAutoCrossEnabled, isPaused, canUndo,
    conflictData,
    queenMarker,
    onToggleAutoCross, onTogglePause, onUndo, onClear,
}) {
    const { rowSatisfied, colSatisfied, regSatisfied, touchSatisfied,
            hasRowConflict, hasColConflict, hasRegConflict, hasTouchConflict } = conflictData;

    return (
        <SidebarCard className="sidebar sidebar-right" elevation={0} id="right-sidebar">
            <Stack direction="row" spacing={1.5} width="100%">
                <StatPanel>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                        {queenMarker === 'star' ? 'Stars' : 'Queens'}
                    </Typography>
                    <Typography variant="h5" id="queens-count" sx={{ fontWeight: 800, mt: 0.5 }}>
                        {queens} / {n}
                    </Typography>
                </StatPanel>
                <StatPanel>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                        Time
                    </Typography>
                    <Typography variant="h5" id="timer" sx={{ fontWeight: 800, mt: 0.5, fontFamily: 'monospace' }}>
                        {formatTime(secondsElapsed)}
                    </Typography>
                </StatPanel>
            </Stack>

            <Stack spacing={1.5} width="100%">
                <ToggleContainer>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        Auto Cross
                    </Typography>
                    <Switch
                        id="auto-cross-toggle-sidebar"
                        checked={isAutoCrossEnabled}
                        onChange={onToggleAutoCross}
                        color="primary"
                        size="small"
                        inputProps={{ 'aria-label': 'Auto Cross Toggle' }}
                    />
                </ToggleContainer>

                <Button
                    id="btn-pause"
                    variant="outlined"
                    color={isPaused ? 'primary' : 'inherit'}
                    startIcon={isPaused ? <PlayArrowIcon /> : <PauseIcon />}
                    onClick={onTogglePause}
                    fullWidth
                    sx={{ py: 1.2 }}
                >
                    {isPaused ? 'Resume' : 'Pause'}
                </Button>

                <Button
                    id="btn-undo"
                    variant="outlined"
                    color="inherit"
                    disabled={!canUndo}
                    startIcon={<UndoIcon />}
                    onClick={onUndo}
                    fullWidth
                    sx={{ py: 1.2 }}
                >
                    Undo
                </Button>

                <Button
                    id="btn-reset"
                    variant="outlined"
                    color="error"
                    startIcon={<RestartAltIcon />}
                    onClick={onClear}
                    fullWidth
                    sx={{ py: 1.2 }}
                >
                    Clear Board
                </Button>
            </Stack>

            <Box>
                <SectionTitle variant="subtitle2">
                    Status
                </SectionTitle>
                <List disablePadding>
                    <RuleItem id="rule-row-r" label="Rows" satisfied={rowSatisfied} invalid={hasRowConflict} />
                    <RuleItem id="rule-col-r" label="Columns" satisfied={colSatisfied} invalid={hasColConflict} />
                    <RuleItem id="rule-region-r" label="Regions" satisfied={regSatisfied} invalid={hasRegConflict} />
                    <RuleItem id="rule-touch-r" label="No touching" satisfied={touchSatisfied} invalid={hasTouchConflict} />
                </List>
            </Box>
        </SidebarCard>
    );
}
