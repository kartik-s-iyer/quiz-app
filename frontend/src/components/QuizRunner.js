import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizContext from '../contexts/QuizContext';
import {
    Container,
    Paper,
    Typography,
    Button,
    Grid,
    Box,
    Alert,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Divider,
    Chip,
    Stack,
    IconButton
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const QuizRunner = () => {
    const navigate = useNavigate();
    const {
        questions,
        teams,
        currentQuestionIndex,
        currentRound,
        bonusTeamId,
        recordAnswer,
        nextQuestion,
        loadQuestions
    } = useContext(QuizContext);

    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [answered, setAnswered] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [loadingAttempted, setLoadingAttempted] = useState(false);

    // Check if we have questions loaded, if not load sample questions
    useEffect(() => {
        const loadSampleIfNeeded = async () => {
            console.log("QuizRunner Effect - Current questions state:", questions);
            console.log("QuizRunner Effect - Current index:", currentQuestionIndex);

            if (!loadingAttempted && (!questions || questions.length === 0)) {
                setLoadingAttempted(true);
                setIsLoading(true);
                console.log("No questions found in QuizRunner, loading sample data automatically");
                try {
                    await loadQuestions('sample');
                    console.log("Sample questions loaded in QuizRunner");

                    // Give it a moment to update the state
                    setTimeout(() => {
                        console.log("After timeout - Current questions:", questions);
                        setIsLoading(false);
                    }, 1000); // Increased timeout to ensure state updates
                } catch (err) {
                    console.error("Failed to load sample questions in QuizRunner:", err);
                    setError("Failed to load sample questions. Try returning to the setup page.");
                    setIsLoading(false);
                }
            } else if (questions && questions.length > 0) {
                console.log("Questions already loaded:", questions.length);
                setIsLoading(false);
            }
        };

        loadSampleIfNeeded();
    }, [questions, loadQuestions, loadingAttempted]);

    // Timer functionality
    useEffect(() => {
        let timerId;

        if (timerRunning && timeLeft > 0) {
            timerId = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setTimerRunning(false);
        }

        return () => clearInterval(timerId);
    }, [timerRunning, timeLeft]);

    const startTimer = () => {
        setTimeLeft(30);
        setTimerRunning(true);
    };

    const stopTimer = () => {
        setTimerRunning(false);
    };

    const resetTimer = () => {
        setTimerRunning(false);
        setTimeLeft(30);
    };

    // Find which team is allowed to answer the bonus (if this is a bonus question)
    const eligibleTeam = bonusTeamId ? teams.find(team => team.id === bonusTeamId) : null;

    // Get current question safely with debugging
    console.log("About to calculate currentQuestion:");
    console.log(" - questions array:", questions);
    console.log(" - questions length:", questions ? questions.length : 0);
    console.log(" - currentQuestionIndex:", currentQuestionIndex);

    const currentQuestion = questions && questions.length > 0 && currentQuestionIndex < questions.length
        ? questions[currentQuestionIndex]
        : null;

    console.log("Calculated currentQuestion:", currentQuestion);

    const handleTeamSelect = (team) => {
        setSelectedTeam(team);
        setSelectedPlayer(null);
    };

    const handlePlayerSelect = (team, player) => {
        // When a player is clicked, select both the team and player
        setSelectedTeam(team);
        setSelectedPlayer(player);
    };

    const handleCorrectAnswer = async () => {
        if (selectedTeam && selectedPlayer) {
            await recordAnswer(
                selectedTeam.id,
                selectedPlayer.id,
                true,
                currentQuestionIndex,
                currentQuestion.type
            );
            setAnswered(true);
        }
    };

    const handleIncorrectAnswer = async () => {
        if (selectedTeam && selectedPlayer) {
            await recordAnswer(
                selectedTeam.id,
                selectedPlayer.id,
                false,
                currentQuestionIndex,
                currentQuestion.type
            );
            // For normal questions, we don't mark as answered yet to allow the other team to try
            // For lightning rounds, incorrect answers count as answered
            if (currentQuestion.type === 'lightning') {
                setAnswered(true);
            } else {
                // Just deselect the team/player to allow the other team to answer
                setSelectedTeam(null);
                setSelectedPlayer(null);
            }
        }
    };

    const handleNextQuestion = async () => {
        await nextQuestion();
        setShowAnswer(false);
        setSelectedTeam(null);
        setSelectedPlayer(null);
        setAnswered(false);
        resetTimer();
    };

    const handleSkipQuestion = () => {
        // Mark as answered without recording any points
        setAnswered(true);
    };

    const handleFinishQuiz = () => {
        navigate('/stats');
    };

    // Determine if we're in a special round
    const isBonus = currentQuestion && currentQuestion.type === 'bonus_theme';
    const isLightning = currentQuestion && currentQuestion.type === 'lightning_theme';
    const isBonusQuestion = currentQuestion && currentQuestion.type === 'bonus';
    const isLightningQuestion = currentQuestion && currentQuestion.type === 'lightning';

    if (isLoading) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 5, textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom>Loading Quiz...</Typography>
                    <CircularProgress sx={{ my: 3 }} />
                    <Typography>Please wait while we prepare your questions.</Typography>
                </Paper>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 5, textAlign: 'center' }}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                        <Typography variant="h5" component="div" gutterBottom>
                            Error Loading Quiz
                        </Typography>
                        <Typography>{error}</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={() => navigate('/')}
                        >
                            Return to Setup
                        </Button>
                    </Alert>
                </Paper>
            </Container>
        );
    }

    if (!questions || questions.length === 0 || !currentQuestion) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 5, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>No Questions Available</Typography>
                    <Typography paragraph>There seems to be an issue with the quiz questions.</Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/')}
                    >
                        Return to Setup
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" component="h2">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </Typography>
                        {isBonus && <Chip color="info" label="Bonus Round" sx={{ mt: 1 }} />}
                        {isLightning && <Chip color="warning" label="Lightning Round" sx={{ mt: 1 }} />}
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                        {(isBonus || isBonusQuestion) && eligibleTeam && (
                            <Alert severity="info" sx={{ display: 'inline-flex' }}>
                                Bonus Team: {eligibleTeam.name}
                            </Alert>
                        )}
                    </Grid>
                </Grid>

                <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                    <CardContent>
                        <Typography variant="h4" component="h3" align="center" gutterBottom>
                            {currentQuestion.text}
                        </Typography>
                        {showAnswer && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                <Typography variant="body1">
                                    <strong>Answer:</strong> {currentQuestion.answer}
                                </Typography>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {(isBonus || isBonusQuestion) && (
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {timeLeft}
                        </Typography>
                        <Stack direction="row" spacing={1} justifyContent="center">
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<PlayArrowIcon />}
                                onClick={startTimer}
                                disabled={timerRunning}
                            >
                                Start Timer
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<PauseIcon />}
                                onClick={stopTimer}
                                disabled={!timerRunning}
                            >
                                Pause Timer
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                startIcon={<RestartAltIcon />}
                                onClick={resetTimer}
                            >
                                Reset Timer
                            </Button>
                        </Stack>
                    </Box>
                )}

                <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
                    Click directly on a player's name to select them for answering. Use "Skip Question" if no one answers.
                </Alert>

                <Grid container spacing={3}>
                    {teams.map(team => (
                        <Grid
                            item
                            xs={12}
                            md={6}
                            key={team.id}
                            sx={{
                                opacity: (isBonusQuestion && eligibleTeam && team.id !== eligibleTeam.id) ? 0.5 : 1,
                                pointerEvents: (isBonusQuestion && eligibleTeam && team.id !== eligibleTeam.id) ? 'none' : 'auto'
                            }}
                        >
                            <Card
                                variant="outlined"
                                sx={{
                                    cursor: 'pointer',
                                    borderColor: selectedTeam?.id === team.id ? 'primary.main' : 'divider',
                                    borderWidth: selectedTeam?.id === team.id ? 2 : 1,
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                    }
                                }}
                                onClick={() => handleTeamSelect(team)}
                            >
                                <CardHeader
                                    title={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6">{team.name}</Typography>
                                            <Typography variant="h6">Score: {team.score}</Typography>
                                        </Box>
                                    }
                                />
                                <Divider />
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Click on a player to select:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                        {team.players.map(player => (
                                            <Card
                                                key={player.id}
                                                variant="outlined"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePlayerSelect(team, player);
                                                }}
                                                sx={{
                                                    cursor: 'pointer',
                                                    p: 1.5,
                                                    minWidth: 120,
                                                    flex: '1 0 120px',
                                                    backgroundColor: selectedPlayer?.id === player.id && selectedTeam?.id === team.id ? 'primary.lighter' : 'background.paper',
                                                    borderColor: selectedPlayer?.id === player.id && selectedTeam?.id === team.id ? 'primary.main' : 'divider',
                                                    boxShadow: selectedPlayer?.id === player.id && selectedTeam?.id === team.id ? 2 : 0,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        backgroundColor: selectedPlayer?.id === player.id && selectedTeam?.id === team.id ? 'primary.lighter' : 'action.hover',
                                                    }
                                                }}
                                            >
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                    {player.name}
                                                </Typography>
                                                <Typography variant="body2">
                                                    Points: {player.score}
                                                </Typography>
                                            </Card>
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{
                    mt: 4,
                    pt: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={showAnswer ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        onClick={() => setShowAnswer(!showAnswer)}
                    >
                        {showAnswer ? 'Hide Answer' : 'Show Answer'}
                    </Button>

                    <Box>
                        {selectedTeam && selectedPlayer && !answered && (
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckCircleIcon />}
                                    onClick={handleCorrectAnswer}
                                >
                                    Correct (+5)
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<CancelIcon />}
                                    onClick={handleIncorrectAnswer}
                                >
                                    Incorrect {isLightningQuestion ? '(-5)' : '(0)'}
                                </Button>
                            </Stack>
                        )}
                    </Box>

                    <Box>
                        {(currentQuestionIndex < questions.length - 1) ? (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNextQuestion}
                                disabled={!answered && !isBonus && !isLightning}
                            >
                                Next Question
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleFinishQuiz}
                            >
                                Finish Quiz
                            </Button>
                        )}

                        {/* Add Skip button for questions no one answers */}
                        {!answered && !isBonus && !isLightning && (
                            <Button
                                variant="outlined"
                                color="secondary"
                                startIcon={<SkipNextIcon />}
                                onClick={handleSkipQuestion}
                                sx={{ ml: 1 }}
                            >
                                Skip Question
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default QuizRunner;