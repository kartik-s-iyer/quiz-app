import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizContext from '../contexts/QuizContext';
import {
    Container,
    Paper,
    Typography,
    Button,
    Grid,
    Box,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    CircularProgress,
    Stack
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const QuizStats = () => {
    const navigate = useNavigate();
    const { getQuizStats, resetQuiz, answerHistory, questions, loadQuestions } = useContext(QuizContext);
    const [teamStats, setTeamStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load quiz data if needed
    useEffect(() => {
        const loadQuizDataIfNeeded = async () => {
            if (!questions || questions.length === 0) {
                console.log("No questions found in QuizStats, loading sample data automatically");
                try {
                    await loadQuestions('sample');
                    console.log("Sample questions loaded in QuizStats");
                } catch (err) {
                    console.error("Failed to load sample questions in QuizStats:", err);
                    setError("Failed to load quiz data. Please return to setup page.");
                }
            }
        };

        loadQuizDataIfNeeded();
    }, [questions, loadQuestions]);

    // Load stats when component mounts
    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            const stats = await getQuizStats();
            setTeamStats(stats);
            setLoading(false);
        };

        loadStats();
    }, [getQuizStats]);

    // Sort teams by score (highest first)
    const sortedTeams = [...teamStats].sort((a, b) => b.score - a.score);
    const winner = sortedTeams[0];
    const isWinner = winner && sortedTeams[1] && winner.score > sortedTeams[1].score;

    const handleNewQuiz = () => {
        resetQuiz();
        navigate('/');
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography variant="h5">Loading stats...</Typography>
                </Paper>
            </Container>
        );
    }

    if (!teamStats.length) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h5">No stats available</Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h3" component="h1" align="center" gutterBottom>
                    Quiz Results
                </Typography>

                {isWinner ? (
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1
                        }}>
                            <EmojiEventsIcon
                                color="warning"
                                sx={{ fontSize: 40, mr: 1 }}
                            />
                            <Typography variant="h4" component="h2" color="primary">
                                Winner: {winner.name}
                            </Typography>
                            <EmojiEventsIcon
                                color="warning"
                                sx={{ fontSize: 40, ml: 1 }}
                            />
                        </Box>
                        <Typography variant="h5">
                            Score: {winner.score} points
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" component="h2">
                            It's a Tie!
                        </Typography>
                        <Typography variant="h5">
                            Both teams scored {sortedTeams[0].score} points
                        </Typography>
                    </Box>
                )}

                <Grid container spacing={4}>
                    {teamStats.map(team => (
                        <Grid item xs={12} key={team.id}>
                            <Card variant="outlined">
                                <CardHeader
                                    title={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h5">{team.name}</Typography>
                                            <Typography variant="h5">Score: {team.score}</Typography>
                                        </Box>
                                    }
                                    sx={{ bgcolor: 'background.paper' }}
                                />
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Team Statistics
                                    </Typography>

                                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
                                        <Table>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                        Total Questions Answered:
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {team.stats.totalAnswered || team.stats.total_answered || 0}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                        Correct Answers:
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {team.stats.correctAnswers || team.stats.correct_answers || 0}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                        Accuracy:
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {(team.stats.accuracy || 0).toFixed(1)}%
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                        Normal Round Points:
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {team.stats.normalPoints || team.stats.normal_points || 0}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                        Bonus Round Points:
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {team.stats.bonusPoints || team.stats.bonus_points || 0}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                        Lightning Round Points:
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {team.stats.lightningPoints || team.stats.lightning_points || 0}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                                        Player Statistics
                                    </Typography>

                                    <Grid container spacing={3}>
                                        {team.players.map(player => (
                                            <Grid item xs={12} sm={6} md={4} key={player.id}>
                                                <Card variant="outlined">
                                                    <CardHeader
                                                        title={
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography variant="subtitle1">{player.name}</Typography>
                                                                <Typography variant="subtitle1">Score: {player.score}</Typography>
                                                            </Box>
                                                        }
                                                        sx={{ bgcolor: 'background.paper' }}
                                                    />
                                                    <CardContent>
                                                        <TableContainer>
                                                            <Table size="small">
                                                                <TableBody>
                                                                    <TableRow>
                                                                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                                            Questions Answered:
                                                                        </TableCell>
                                                                        <TableCell align="right">
                                                                            {player.stats?.totalAnswered || player.stats?.total_answered || 0}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                    <TableRow>
                                                                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                                            Correct Answers:
                                                                        </TableCell>
                                                                        <TableCell align="right">
                                                                            {player.stats?.correctAnswers || player.stats?.correct_answers || 0}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                    <TableRow>
                                                                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                                                            Accuracy:
                                                                        </TableCell>
                                                                        <TableCell align="right">
                                                                            {(player.stats?.accuracy || 0).toFixed(1)}%
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </TableBody>
                                                            </Table>
                                                        </TableContainer>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<RestartAltIcon />}
                        onClick={handleNewQuiz}
                    >
                        Start New Quiz
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default QuizStats; 