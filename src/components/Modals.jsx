import React from 'react';
import { formatTime } from '../utils/helpers';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Switch,
    Slide,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// ── Styled Components ─────────────────────────────────────────────────────────

const ModalIcon = styled(Box)(({ theme }) => ({
    fontSize: '4.5rem',
    textAlign: 'center',
    animation: 'bounceIcon 2s infinite ease-in-out',
    marginBottom: theme.spacing(1),
    '@keyframes bounceIcon': {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-10px)' }
    }
}));

const StatBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    background: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.02)',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
    borderRadius: '12px',
    textAlign: 'center',
    flex: 1,
}));

const SettingsRow = styled(Box)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing(2),
        borderRadius: '16px',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}`,
        background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
        transition: 'all 0.2s ease',
        '&:hover': {
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
        }
    };
});

// ── VictoryModal ──────────────────────────────────────────────────────────────

export function VictoryModal({ n, secondsElapsed, newRecord, onMenu }) {
    return (
        <Dialog
            open={true}
            TransitionComponent={Transition}
            keepMounted
            id="victory-modal"
            PaperProps={{
                sx: { p: 2, textAlign: 'center', maxWidth: '420px', width: '90%' }
            }}
        >
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 3 }}>
                <ModalIcon>🏆</ModalIcon>
                <Typography variant="h4" color="secondary" sx={{ fontWeight: 800 }}>
                    Brilliant Victory!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    You have successfully placed all queens and solved the puzzle.
                </Typography>
                
                <Stack direction="row" spacing={2} width="100%" sx={{ my: 1 }}>
                    <StatBox>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                            Time
                        </Typography>
                        <Typography variant="h6" id="final-time" sx={{ fontWeight: 700, mt: 0.5 }}>
                            {formatTime(secondsElapsed)}
                        </Typography>
                    </StatBox>
                    <StatBox>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                            Grid Size
                        </Typography>
                        <Typography variant="h6" id="final-size" sx={{ fontWeight: 700, mt: 0.5 }}>
                            {n} × {n}
                        </Typography>
                    </StatBox>
                </Stack>

                {newRecord && (
                    <Typography
                        id="new-record-notice"
                        variant="h6"
                        color="secondary"
                        sx={{
                            fontWeight: 700,
                            animation: 'pulseGlow 1.5s infinite alternate',
                            '@keyframes pulseGlow': {
                                '0%': { transform: 'scale(0.98)', opacity: 0.8 },
                                '100%': { transform: 'scale(1.04)', opacity: 1 }
                            }
                        }}
                    >
                        ✨ New Personal Best! ✨
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
                <Button
                    id="btn-play-again"
                    variant="contained"
                    color="primary"
                    onClick={onMenu}
                    fullWidth
                    size="large"
                    sx={{ py: 1.5, fontWeight: 700 }}
                >
                    Menu
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ── StatsModal ────────────────────────────────────────────────────────────────

export function StatsModal({ stats, onClose, onResetProgress }) {
    const rows = Object.keys(stats).sort((a, b) => Number(a) - Number(b));

    return (
        <Dialog
            open={true}
            TransitionComponent={Transition}
            onClose={onClose}
            id="stats-modal"
            PaperProps={{
                sx: { p: 2, maxWidth: '600px', width: '92vw' }
            }}
        >
            <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1, color: 'secondary.main' }}>
                📊 Personal Stats
            </DialogTitle>
            <DialogContent sx={{ py: 1 }}>
                <Box id="stats-table-container">
                    {rows.length === 0 ? (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary" align="center">
                                No games completed yet.<br />Finish a puzzle to see your stats here.
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', background: 'transparent' }}>
                            <Table className="stats-table" size="medium">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Level</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Best Time</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Time</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Games</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map(size => {
                                        const stat = stats[size];
                                        const avg = Math.round(stat.total / stat.count);
                                        return (
                                            <TableRow key={size} hover>
                                                <TableCell sx={{ fontWeight: 700, color: 'secondary.main' }}>{size} × {size}</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>{formatTime(stat.best)}</TableCell>
                                                <TableCell sx={{ color: 'text.secondary' }}>{formatTime(avg)}</TableCell>
                                                <TableCell sx={{ color: 'text.secondary' }}>{stat.count}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
                <Button
                    id="btn-reset-stats"
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={onResetProgress}
                    sx={{ py: 1.2, fontWeight: 700 }}
                >
                    Reset Progress
                </Button>
                <Button
                    id="btn-close-stats"
                    variant="outlined"
                    color="inherit"
                    fullWidth
                    onClick={onClose}
                    sx={{ py: 1.2, fontWeight: 700 }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ── ConfirmResetModal ─────────────────────────────────────────────────────────

export function ConfirmResetModal({ onConfirm, onCancel }) {
    return (
        <Dialog
            open={true}
            TransitionComponent={Transition}
            id="confirm-reset-modal"
            PaperProps={{
                sx: { p: 2, textAlign: 'center', maxWidth: '420px', width: '90%' }
            }}
        >
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 3 }}>
                <WarningAmberRoundedIcon color="error" sx={{ fontSize: '4.5rem', filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.2))' }} />
                <Typography variant="h5" color="error" sx={{ fontWeight: 800 }}>
                    Reset All Progress?
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    This will permanently delete all your best times and saved games. This cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
                <Button
                    id="btn-cancel-reset"
                    variant="outlined"
                    color="inherit"
                    fullWidth
                    onClick={onCancel}
                    sx={{ py: 1.2, fontWeight: 700 }}
                >
                    Cancel
                </Button>
                <Button
                    id="btn-confirm-reset"
                    variant="contained"
                    color="error"
                    fullWidth
                    onClick={onConfirm}
                    sx={{ py: 1.2, fontWeight: 700 }}
                >
                    Yes, Reset
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ── SettingsModal ─────────────────────────────────────────────────────────────

export function SettingsModal({ isLightTheme, onToggleTheme, isAutoCrossEnabled, onToggleAutoCross, queenMarker, onChangeQueenMarker, onClose }) {
    return (
        <Dialog
            open={true}
            TransitionComponent={Transition}
            onClose={onClose}
            id="settings-modal"
            PaperProps={{
                sx: { p: 2, maxWidth: '420px', width: '90%' }
            }}
        >
            <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1, color: 'secondary.main' }}>
                ⚙️ Settings
            </DialogTitle>
            <DialogContent sx={{ py: 2 }}>
                <Stack spacing={2.5}>
                    <SettingsRow>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            {isLightTheme ? <LightModeIcon color="secondary" /> : <DarkModeIcon color="primary" />}
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                Light Theme
                            </Typography>
                        </Box>
                        <Switch
                            checked={isLightTheme}
                            onChange={onToggleTheme}
                            color="secondary"
                            inputProps={{ 'aria-label': 'Theme Toggle' }}
                        />
                    </SettingsRow>
                    
                    <SettingsRow>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <AutoFixHighIcon color="primary" />
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                Auto Cross
                            </Typography>
                        </Box>
                        <Switch
                            checked={isAutoCrossEnabled}
                            onChange={onToggleAutoCross}
                            color="primary"
                            inputProps={{ 'aria-label': 'Auto Cross Toggle' }}
                        />
                    </SettingsRow>

                    <SettingsRow>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <StarRoundedIcon color="secondary" />
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                Use Star Marker
                            </Typography>
                        </Box>
                        <Switch
                            id="queen-star-toggle"
                            checked={queenMarker === 'star'}
                            onChange={(e) => onChangeQueenMarker(e.target.checked ? 'star' : 'queen')}
                            color="secondary"
                            inputProps={{ 'aria-label': 'Star Marker Toggle' }}
                        />
                    </SettingsRow>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button
                    id="btn-close-settings"
                    variant="outlined"
                    color="inherit"
                    fullWidth
                    onClick={onClose}
                    sx={{ py: 1.2, fontWeight: 700 }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
