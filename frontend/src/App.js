import React from 'react';
import { Routes, Route } from 'react-router-dom';
import QuizSetup from './components/QuizSetup';
import TeamSetup from './components/TeamSetup';
import QuizRunner from './components/QuizRunner';
import QuizStats from './components/QuizStats';
import { QuizProvider } from './contexts/QuizContext';
import { ThemeProvider, createTheme, CssBaseline, responsiveFontSizes } from '@mui/material';

// Create a custom theme
let theme = createTheme({
    palette: {
        primary: {
            main: '#4CAF50',
            light: '#81C784',
            dark: '#388E3C',
            contrastText: '#fff',
            lighter: 'rgba(76, 175, 80, 0.12)', // Custom shade for selected items
        },
        secondary: {
            main: '#6A1B9A',
            light: '#9C27B0',
            dark: '#4A148C',
            contrastText: '#fff',
        },
        error: {
            main: '#f44336',
            light: '#e57373',
            dark: '#d32f2f',
        },
        warning: {
            main: '#ff9800',
            light: '#ffb74d',
            dark: '#f57c00',
        },
        info: {
            main: '#2196f3',
            light: '#64b5f6',
            dark: '#1976d2',
        },
        success: {
            main: '#4caf50',
            light: '#81c784',
            dark: '#388e3c',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
        divider: 'rgba(0, 0, 0, 0.12)',
        text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
            disabled: 'rgba(0, 0, 0, 0.38)',
        },
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontSize: '2.5rem',
            fontWeight: 600,
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 600,
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 600,
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 600,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: 'none',
                    textTransform: 'none',
                    padding: '8px 16px',
                    '&:hover': {
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                    },
                },
                contained: {
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
                },
                outlinedPrimary: {
                    borderColor: '#4CAF50',
                    '&:hover': {
                        backgroundColor: 'rgba(76, 175, 80, 0.08)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
                },
                elevation1: {
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                },
                elevation2: {
                    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.12)',
                },
                elevation3: {
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.14)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    overflow: 'visible',
                },
            },
        },
        MuiCardHeader: {
            styleOverrides: {
                root: {
                    padding: '16px 24px',
                },
            },
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: '16px 24px 24px',
                    '&:last-child': {
                        paddingBottom: 24,
                    },
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                    },
                },
            },
        },
    },
});

// Apply responsive font sizes
theme = responsiveFontSizes(theme);

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <QuizProvider>
                <Routes>
                    <Route path="/" element={<QuizSetup />} />
                    <Route path="/team-setup" element={<TeamSetup />} />
                    <Route path="/quiz" element={<QuizRunner />} />
                    <Route path="/stats" element={<QuizStats />} />
                </Routes>
            </QuizProvider>
        </ThemeProvider>
    );
}

export default App; 