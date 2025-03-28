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
    Divider
} from '@mui/material';
import { styled } from '@mui/system';

const CodeBlock = styled('pre')(({ theme }) => ({
    backgroundColor: '#f5f5f5',
    padding: '16px',
    borderRadius: '4px',
    overflow: 'auto',
    fontSize: '14px',
    border: '1px solid #e0e0e0'
}));

const QuizSetup = () => {
    const navigate = useNavigate();
    const { loadQuestions, isLoaded, loadError } = useContext(QuizContext);

    // Set a default path that uses an absolute path which might work better with the backend
    const [filePath, setFilePath] = useState('/Users/iyerkartikshridhar/Desktop/quiz-app/backend/quiz_files/my_quiz.json');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileSubmit = async (e) => {
        e.preventDefault();
        if (!filePath.trim()) {
            setError('Please enter a valid file path');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await loadQuestions(filePath);
            setLoading(false);
            console.log("Navigation to team-setup after file load");
            navigate('/team-setup');
        } catch (err) {
            setError(`Error loading questions: ${err.message}`);
            setLoading(false);
        }
    };

    const handleSampleDataClick = async () => {
        setLoading(true);
        setError('');
        console.log("Starting sample data load");

        try {
            console.log("Calling loadQuestions('sample')");
            await loadQuestions('sample');
            console.log("Sample data loaded successfully");
            setLoading(false);
            console.log("About to navigate to team-setup");
            navigate('/team-setup');
            console.log("Navigation called");
        } catch (err) {
            console.error("Error loading sample data:", err);
            setError(`Error loading sample questions: ${err.message}`);
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    Quiz Master Setup
                </Typography>

                <Box component="form" onSubmit={handleFileSubmit} sx={{ mt: 3 }}>
                    <TextField
                        fullWidth
                        id="filePath"
                        label="JSON File Path"
                        value={filePath}
                        onChange={(e) => setFilePath(e.target.value)}
                        margin="normal"
                        helperText="Enter the path to your JSON quiz file or use the sample data option below."
                        variant="outlined"
                    />

                    <Box sx={{ mt: 1, mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Tip:</strong> Create a folder called "quiz_files" in the backend directory and place your JSON file there.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            <strong>Example paths:</strong>
                        </Typography>
                        <List dense sx={{ pl: 2 }}>
                            <ListItem sx={{ py: 0 }}>
                                <ListItemText primary="./backend/quiz_files/my_quiz.json" />
                            </ListItem>
                            <ListItem sx={{ py: 0 }}>
                                <ListItemText primary="/absolute/path/to/your/quiz_file.json" />
                            </ListItem>
                        </List>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} sm={6}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Load Questions'}
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button
                                type="button"
                                variant="outlined"
                                color="secondary"
                                fullWidth
                                onClick={handleSampleDataClick}
                                disabled={loading}
                            >
                                Use Sample Data
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                        <strong>Note:</strong> We've created a sample quiz file for you at <code>backend/quiz_files/my_quiz.json</code> that you can use or modify.
                    </Typography>
                </Alert>

                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        JSON Format Example:
                    </Typography>
                    <CodeBlock>
                        {`{
  "questions": [
    {
      "id": 1,
      "text": "What is the capital of France?",
      "answer": "Paris",
      "type": "normal"
    },
    {
      "id": 2,
      "text": "Who painted the Mona Lisa?",
      "answer": "Leonardo da Vinci",
      "type": "normal"
    },
    // More normal questions...
    {
      "id": 4,
      "text": "BONUS THEME: Astronomy",
      "type": "bonus_theme"
    },
    {
      "id": 5,
      "text": "What is the closest planet to the Sun?",
      "answer": "Mercury",
      "type": "bonus"
    },
    // More bonus questions...
    {
      "id": 9,
      "text": "LIGHTNING ROUND: World Capitals",
      "type": "lightning_theme"
    },
    {
      "id": 10,
      "text": "Capital of Japan?",
      "answer": "Tokyo",
      "type": "lightning"
    }
    // More lightning questions...
  ]
}`}
                    </CodeBlock>
                </Box>
            </Paper>
        </Container>
    );
};

export default QuizSetup; 