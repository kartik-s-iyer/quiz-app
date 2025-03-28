import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizContext from '../contexts/QuizContext';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Box,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Card,
    CardHeader,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const TeamSetup = () => {
    const navigate = useNavigate();
    const { teams, addPlayer, removePlayer, updateTeamName, questions, loadQuestions } = useContext(QuizContext);
    const [newPlayer, setNewPlayer] = useState({ teamId: 1, name: '' });
    const [error, setError] = useState('');

    // Check if we have questions loaded, if not load sample questions
    React.useEffect(() => {
        const loadSampleIfNeeded = async () => {
            if (!questions || questions.length === 0) {
                console.log("No questions found, loading sample data automatically");
                try {
                    await loadQuestions('sample');
                    console.log("Sample questions loaded in TeamSetup");
                } catch (err) {
                    console.error("Failed to load sample questions in TeamSetup:", err);
                    setError("Failed to load sample questions. Please return to setup page.");
                }
            }
        };

        loadSampleIfNeeded();
    }, [questions, loadQuestions]);

    const handleAddPlayer = (e) => {
        e.preventDefault();
        if (!newPlayer.name.trim()) {
            setError('Please enter a player name');
            return;
        }

        addPlayer(newPlayer.teamId, newPlayer.name);
        setNewPlayer({ ...newPlayer, name: '' });
        setError('');
    };

    const handleTeamNameChange = (teamId, newName) => {
        updateTeamName(teamId, newName);
    };

    const handleStartQuiz = () => {
        // Validate that both teams have at least one player
        if (teams[0].players.length === 0 || teams[1].players.length === 0) {
            setError('Each team must have at least one player');
            return;
        }

        navigate('/quiz');
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    Team Setup
                </Typography>

                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 3 }}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => navigate('/')}
                            >
                                Return to Setup
                            </Button>
                        }
                    >
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {teams.map(team => (
                        <Grid item xs={12} md={6} key={team.id}>
                            <Card variant="outlined">
                                <CardHeader
                                    title={
                                        <TextField
                                            fullWidth
                                            value={team.name}
                                            onChange={(e) => handleTeamNameChange(team.id, e.target.value)}
                                            variant="outlined"
                                            size="small"
                                        />
                                    }
                                />
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Players:
                                    </Typography>

                                    {team.players.length === 0 ? (
                                        <Typography color="text.secondary">
                                            No players added yet
                                        </Typography>
                                    ) : (
                                        <List>
                                            {team.players.map(player => (
                                                <ListItem key={player.id}>
                                                    <ListItemText primary={player.name} />
                                                    <ListItemSecondaryAction>
                                                        <IconButton
                                                            edge="end"
                                                            aria-label="delete"
                                                            onClick={() => removePlayer(team.id, player.id)}
                                                            color="error"
                                                            size="small"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </ListItemSecondaryAction>
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Box component="form" onSubmit={handleAddPlayer} sx={{ mt: 4 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel id="team-select-label">Team</InputLabel>
                                <Select
                                    labelId="team-select-label"
                                    id="team-select"
                                    value={newPlayer.teamId}
                                    onChange={(e) => setNewPlayer({ ...newPlayer, teamId: e.target.value })}
                                    label="Team"
                                >
                                    {teams.map(team => (
                                        <MenuItem key={team.id} value={team.id}>
                                            {team.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                id="player-name"
                                label="Player Name"
                                value={newPlayer.name}
                                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                            >
                                Add Player
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleStartQuiz}
                    >
                        Start Quiz
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default TeamSetup; 