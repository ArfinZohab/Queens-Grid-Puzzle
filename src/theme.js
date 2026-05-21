import { createTheme } from '@mui/material/styles';

const basePalette = {
    typography: {
        fontFamily: "'Outfit', sans-serif",
        h1: {
            fontWeight: 800,
            letterSpacing: '-0.025em',
        },
        h2: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h4: {
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h5: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '12px',
        },
    },
    shape: {
        borderRadius: 16,
    },
};

export const getTheme = (mode) => {
    const isDark = mode === 'dark';

    return createTheme({
        ...basePalette,
        palette: {
            mode,
            primary: {
                main: isDark ? '#90caf9' : '#4f46e5',
                dark: isDark ? '#42a5f5' : '#3730a3',
                light: isDark ? '#e3f2fd' : '#818cf8',
            },
            secondary: {
                main: isDark ? '#fbbf24' : '#b45309',
                light: isDark ? '#fcd34d' : '#d97706',
            },
            error: {
                main: isDark ? '#ef4444' : '#dc2626',
            },
            success: {
                main: isDark ? '#10b981' : '#059669',
            },
            background: {
                default: isDark ? '#121212' : '#f5f5f5',
                paper: isDark ? '#1e1e1e' : '#ffffff',
            },
            text: {
                primary: isDark ? '#f1f5f9' : '#0f172a',
                secondary: isDark ? '#94a3b8' : '#475569',
            },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        transition: 'background-color 0.3s ease, color 0.3s ease',
                        backgroundColor: isDark ? '#121212' : '#f5f5f5',
                        fontFamily: "'Outfit', sans-serif",
                        backgroundImage: isDark
                            ? 'none'
                            : 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(99, 102, 241, 0.05), rgba(255, 255, 255, 0))',
                        backgroundAttachment: 'fixed',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: '12px',
                        padding: '10px 24px',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: 'none',
                        },
                        '&:active': {
                            transform: 'scale(0.98)',
                        },
                    },
                    containedPrimary: {
                        background: isDark
                            ? '#90caf9'
                            : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                        border: 'none',
                        color: isDark ? '#0f172a' : '#ffffff',
                        '&:hover': {
                            background: isDark ? '#42a5f5' : undefined,
                            boxShadow: 'none',
                        },
                    },
                    outlined: {
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                        color: isDark ? '#f1f5f9' : 'inherit',
                        '&:hover': {
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        background: isDark 
                            ? '#1e1e1e' 
                            : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: isDark ? 'none' : 'blur(16px)',
                        border: isDark 
                            ? '1px solid rgba(255, 255, 255, 0.08)' 
                            : '1px solid rgba(0, 0, 0, 0.06)',
                        boxShadow: isDark
                            ? '0 2px 8px rgba(0, 0, 0, 0.4)'
                            : '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                        borderRadius: '16px',
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        background: isDark 
                            ? '#1e1e1e' 
                            : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: isDark ? 'none' : 'blur(20px)',
                        border: isDark 
                            ? '1px solid rgba(255, 255, 255, 0.12)' 
                            : '1px solid rgba(0, 0, 0, 0.08)',
                        boxShadow: isDark
                            ? '0 16px 32px rgba(0, 0, 0, 0.5)'
                            : '0 24px 48px rgba(0, 0, 0, 0.15)',
                        borderRadius: '20px',
                    },
                },
            },
        },
    });
};
