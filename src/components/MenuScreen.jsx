import { useState } from 'react';
import { formatTime, loadSavedGame } from '../utils/helpers';
import {
    Container,
    Box,
    Card,
    Typography,
    Button,
    ButtonBase,
    Select,
    MenuItem,
    FormControl,
    Stack,
    Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const DIFFICULTIES = [
    { label: 'Easy',   size: 5  },
    { label: 'Medium', size: 7  },
    { label: 'Hard',   size: 9  },
    { label: 'Expert', size: 11 },
];

const CUSTOM_SIZES = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

// ── Styled Components ─────────────────────────────────────────────────────────

const MenuCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(3.5),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    maxWidth: '480px',
    margin: 'auto',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2.5),
        gap: theme.spacing(2),
    },
}));

const CrownWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.palette.secondary.main,
    marginBottom: theme.spacing(1),
    '& svg': {
        width: '4.5rem',
        height: '4.5rem',
        filter: `drop-shadow(0 0 8px ${theme.palette.secondary.main}4d)`,
        animation: 'crownPulse 3s infinite alternate',
    },
    '@keyframes crownPulse': {
        '0%': { transform: 'scale(1)', filter: `drop-shadow(0 0 4px ${theme.palette.secondary.main}33)` },
        '100%': { transform: 'scale(1.08)', filter: `drop-shadow(0 0 16px ${theme.palette.secondary.main}b3)` },
    }
}));

const CrownLogo = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 19H22V21H2V19ZM3 5L5.5 13L9.5 7L12 15L14.5 7L18.5 13L21 5L19 17H5L3 5Z" />
    </svg>
);

const ResumeButton = styled(Button)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        padding: '12px',
        fontSize: '1rem',
        borderRadius: '12px',
        background: isDark
            ? theme.palette.primary.main
            : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
        boxShadow: isDark ? 'none' : `0 6px 16px rgba(99, 102, 241, 0.25)`,
        color: isDark ? '#0f172a' : '#fff',
        animation: isDark ? 'none' : 'pulseGlow 2s infinite alternate',
        '&:hover': {
            background: isDark
                ? theme.palette.primary.dark
                : `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
            boxShadow: 'none',
        },
        '@keyframes pulseGlow': {
            '0%': { boxShadow: `0 4px 10px rgba(99, 102, 241, 0.15)` },
            '100%': { boxShadow: `0 6px 20px rgba(99, 102, 241, 0.45)` },
        }
    };
});

const DifficultyButton = styled(ButtonBase)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '12px 20px',
        borderRadius: '12px',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
        background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.5)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: theme.palette.secondary.main,
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(180, 83, 9, 0.04)',
            boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 6px 16px rgba(0, 0, 0, 0.03)',
        },
    };
});

const CustomSizeContainer = styled(Box)(({ theme }) => {
    const isDark = theme.palette.mode === 'dark';
    return {
        padding: theme.spacing(2.5),
        background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
        borderRadius: '12px',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'}`,
    };
});

// ── MenuScreen ────────────────────────────────────────────────────────────────

export default function MenuScreen({ stats, onStart, onContinue, onSettings, onResetProgress, onStats }) {
    const [selectedSize, setSelectedSize] = useState(8);
    const savedData = loadSavedGame();
    const hasUnfinishedGame = savedData && savedData.history && savedData.history.length > 0;

    return (
        <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', minHeight: '90vh' }}>
            <MenuCard id="menu-screen">
                <Box textAlign="center" sx={{ mb: 1 }}>
                    <CrownWrapper>
                        <CrownLogo />
                    </CrownWrapper>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
                        Queens Grid Puzzle
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Select a difficulty to start your mental challenge
                    </Typography>
                </Box>

                {hasUnfinishedGame && (
                    <ResumeButton
                        id="btn-continue"
                        variant="contained"
                        fullWidth
                        onClick={onContinue}
                        startIcon={<ArrowForwardIcon sx={{ fontSize: '1.4rem' }} />}
                    >
                        Continue Saved Game
                    </ResumeButton>
                )}

                <Stack spacing={2} sx={{ width: '100%' }}>
                    {DIFFICULTIES.map(({ label, size }) => (
                        <DifficultyButton
                            key={size}
                            data-size={size}
                            onClick={() => onStart(size)}
                            id={`diff-btn-${size}`}
                        >
                            <Box display="flex" alignItems="center" gap={2}>
                                <Typography variant="h6" color="secondary" sx={{ fontWeight: 700 }}>
                                    {label}
                                </Typography>
                                <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
                                    {size} × {size}
                                </Typography>
                            </Box>
                            <Chip
                                id={`best-time-${size}`}
                                label={
                                    stats[size] !== undefined
                                        ? `Best: ${formatTime(stats[size].best)}`
                                        : 'Best: --:--'
                                }
                                size="small"
                                color={stats[size] !== undefined ? 'secondary' : 'default'}
                                variant={stats[size] !== undefined ? 'filled' : 'outlined'}
                                sx={{ fontWeight: 600, px: 0.5 }}
                            />
                        </DifficultyButton>
                    ))}
                </Stack>

                <CustomSizeContainer>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Custom Grid
                        </Typography>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                id="custom-size-select"
                                value={selectedSize}
                                onChange={e => setSelectedSize(Number(e.target.value))}
                                sx={{ borderRadius: '10px', fontWeight: 600 }}
                            >
                                {CUSTOM_SIZES.map(s => (
                                    <MenuItem key={s} value={s}>{s} × {s}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Chip
                            id="best-time-custom"
                            label={
                                stats[selectedSize] !== undefined
                                    ? `Best: ${formatTime(stats[selectedSize].best)}`
                                    : 'Best: --:--'
                            }
                            color={stats[selectedSize] !== undefined ? 'secondary' : 'default'}
                            variant={stats[selectedSize] !== undefined ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 600 }}
                        />
                        <Button
                            id="btn-play-custom"
                            variant="contained"
                            color="primary"
                            startIcon={<PlayArrowIcon />}
                            onClick={() => onStart(selectedSize)}
                            sx={{ borderRadius: '10px', fontWeight: 700 }}
                        >
                            Play Custom
                        </Button>
                    </Box>
                </CustomSizeContainer>

                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 3 }}>
                    <GridFooter
                        onStats={onStats}
                        onSettings={onSettings}
                        onResetProgress={onResetProgress}
                    />
                </Box>
            </MenuCard>
        </Container>
    );
}

function GridFooter({ onStats, onSettings, onResetProgress }) {
    return (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" width="100%">
            <Button
                id="btn-menu-stats"
                variant="outlined"
                color="inherit"
                startIcon={<BarChartIcon />}
                onClick={onStats}
                sx={{ flex: 1 }}
            >
                Stats
            </Button>
            <Button
                id="btn-menu-settings"
                variant="outlined"
                color="inherit"
                startIcon={<SettingsIcon />}
                onClick={onSettings}
                sx={{ flex: 1 }}
            >
                Settings
            </Button>
            <Button
                id="btn-reset-progress"
                variant="outlined"
                color="error"
                startIcon={<DeleteForeverIcon />}
                onClick={onResetProgress}
                sx={{ flex: 1 }}
            >
                Reset Progress
            </Button>
        </Stack>
    );
}
