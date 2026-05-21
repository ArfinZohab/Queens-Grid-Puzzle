import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Box,
    Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import ReplayIcon from '@mui/icons-material/Replay';

// ── Styled Components ─────────────────────────────────────────────────────────

const CrownWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.secondary.main,
    marginRight: theme.spacing(1.5),
    '& svg': {
        width: '2.25rem',
        height: '2.25rem',
        filter: `drop-shadow(0 0 4px ${theme.palette.secondary.main}33)`,
        animation: 'crownPulse 3s infinite alternate',
    },
    '@keyframes crownPulse': {
        '0%': { transform: 'scale(1)', filter: `drop-shadow(0 0 4px ${theme.palette.secondary.main}33)` },
        '100%': { transform: 'scale(1.08)', filter: `drop-shadow(0 0 12px ${theme.palette.secondary.main}80)` },
    }
}));

const CrownLogo = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 19H22V21H2V19ZM3 5L5.5 13L9.5 7L12 15L14.5 7L18.5 13L21 5L19 17H5L3 5Z" />
    </svg>
);

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: theme.palette.mode === 'dark' 
        ? 'rgba(17, 24, 39, 0.7)' 
        : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(16px)',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
    borderRadius: '16px',
    boxShadow: theme.palette.mode === 'dark'
        ? '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
        : '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
    color: theme.palette.text.primary,
}));

// ── GameHeader ────────────────────────────────────────────────────────────────

export default function GameHeader({ onStats, onMenu, onNewGame, onSettings }) {
    return (
        <StyledAppBar position="static" elevation={0} id="game-header">
            <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, py: { xs: 1.5, sm: 1 } }}>
                <Box display="flex" alignItems="center">
                    <CrownWrapper>
                        <CrownLogo />
                    </CrownWrapper>
                    <Typography
                        variant="h5"
                        component="h1"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: '-0.5px',
                            background: theme => theme.palette.mode === 'light'
                                ? `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.text.secondary})`
                                : `linear-gradient(135deg, #ffffff, ${theme.palette.text.secondary})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Queens Grid
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                        id="btn-stats"
                        variant="outlined"
                        color="inherit"
                        title="Personal Stats"
                        onClick={onStats}
                        startIcon={<BarChartIcon />}
                        sx={{
                            px: { xs: 1.5, sm: 2 },
                            minWidth: { xs: 'auto', sm: '90px' },
                            '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } }
                        }}
                    >
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Stats</Box>
                    </Button>

                    <Button
                        id="btn-settings"
                        variant="outlined"
                        color="inherit"
                        title="Settings"
                        onClick={onSettings}
                        startIcon={<SettingsIcon />}
                        sx={{
                            px: { xs: 1.5, sm: 2 },
                            minWidth: { xs: 'auto', sm: '90px' },
                            '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } }
                        }}
                    >
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Settings</Box>
                    </Button>

                    <Button
                        id="btn-menu"
                        variant="outlined"
                        color="inherit"
                        title="Main Menu"
                        onClick={onMenu}
                        startIcon={<MenuIcon />}
                        sx={{
                            px: { xs: 1.5, sm: 2 },
                            minWidth: { xs: 'auto', sm: '90px' },
                            '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } }
                        }}
                    >
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Menu</Box>
                    </Button>

                    <Button
                        id="btn-new-game"
                        variant="contained"
                        color="primary"
                        title="Restart Puzzle"
                        onClick={onNewGame}
                        startIcon={<ReplayIcon />}
                        sx={{
                            px: { xs: 1.5, sm: 2.5 },
                            fontWeight: 700,
                            borderRadius: '12px',
                            '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } }
                        }}
                    >
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>New Game</Box>
                    </Button>
                </Stack>
            </Toolbar>
        </StyledAppBar>
    );
}
