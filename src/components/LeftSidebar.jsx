import {
    Box,
    Card,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

// ── Styled Components ─────────────────────────────────────────────────────────

const SidebarCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(2.5),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    height: '100%',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontSize: '0.85rem',
    color: theme.palette.secondary.main,
    marginBottom: theme.spacing(1.5),
}));

const InstructionCard = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.75),
    background: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.02)',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.75),
    transition: 'all 0.2s ease',
    '&:hover': {
        background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.04)',
    }
}));

// ── RuleItem ──────────────────────────────────────────────────────────────────

export function RuleItem({ id, label, satisfied, invalid }) {
    let icon = <RadioButtonUncheckedIcon color="disabled" fontSize="small" />;
    let textColor = 'text.secondary';

    if (satisfied) {
        icon = <CheckCircleIcon color="success" fontSize="small" sx={{ filter: 'drop-shadow(0 0 3px rgba(16, 185, 129, 0.4))' }} />;
        textColor = 'success.main';
    } else if (invalid) {
        icon = <CancelIcon color="error" fontSize="small" sx={{ filter: 'drop-shadow(0 0 3px rgba(239, 68, 68, 0.4))' }} />;
        textColor = 'error.main';
    }

    return (
        <ListItem id={id} disablePadding sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
                {icon}
            </ListItemIcon>
            <ListItemText
                primary={label}
                primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: satisfied || invalid ? 700 : 500,
                    color: textColor,
                    sx: { transition: 'color 0.2s ease' }
                }}
            />
        </ListItem>
    );
}

// ── LeftSidebar ───────────────────────────────────────────────────────────────

export default function LeftSidebar({ conflictData, queenMarker }) {
    const { rowSatisfied, colSatisfied, regSatisfied, touchSatisfied,
            hasRowConflict, hasColConflict, hasRegConflict, hasTouchConflict } = conflictData;

    const markerName = queenMarker === 'star' ? 'Star' : 'Queen';
    const markerNamePlural = queenMarker === 'star' ? 'Stars' : 'Queens';

    return (
        <SidebarCard className="sidebar sidebar-left" elevation={0} id="left-sidebar">
            <Box>
                <SectionTitle variant="subtitle2">
                    Puzzle Goals
                </SectionTitle>
                <List disablePadding>
                    <RuleItem id="rule-row" label={`One ${markerName} per row`} satisfied={rowSatisfied} invalid={hasRowConflict} />
                    <RuleItem id="rule-col" label={`One ${markerName} per column`} satisfied={colSatisfied} invalid={hasColConflict} />
                    <RuleItem id="rule-region" label={`One ${markerName} per region`} satisfied={regSatisfied} invalid={hasRegConflict} />
                    <RuleItem id="rule-touch" label={`No ${markerNamePlural} touch`} satisfied={touchSatisfied} invalid={hasTouchConflict} />
                </List>
            </Box>

            <Box>
                <SectionTitle variant="subtitle2">
                    How to Play
                </SectionTitle>
                <Stack spacing={1.5}>
                    <InstructionCard>
                        <Box>
                            <Chip label="Click Once" size="small" color="default" sx={{ fontWeight: 700, height: '20px', fontSize: '0.72rem' }} />
                        </Box>
                        <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                            Place an <strong>X</strong> marker in the cell.
                        </Typography>
                    </InstructionCard>

                    <InstructionCard>
                        <Box>
                            <Chip label="Click Twice" size="small" color="secondary" sx={{ fontWeight: 700, height: '20px', fontSize: '0.72rem' }} />
                        </Box>
                        <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                            Place a <strong style={{ color: 'var(--accent-gold)' }}>{markerName}</strong> in the cell.
                        </Typography>
                    </InstructionCard>

                    <InstructionCard>
                        <Box>
                            <Chip label="Click &amp; Drag" size="small" color="default" sx={{ fontWeight: 700, height: '20px', fontSize: '0.72rem' }} />
                        </Box>
                        <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                            Draw or erase <strong>X</strong> marks across cells.
                        </Typography>
                    </InstructionCard>
                </Stack>
            </Box>
        </SidebarCard>
    );
}
