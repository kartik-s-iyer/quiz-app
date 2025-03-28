import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const QuizContext = createContext();
const API_URL = 'http://localhost:5001/api';

// Local sample quiz data for fallback
const SAMPLE_QUIZ_DATA = {
    "questions": [
        {
            "id": 1,
            "text": "What is the capital of France?",
            "answer": "Paris",
            "type": "normal"
        },
        {
            "id": 2,
            "text": "Who wrote 'Romeo and Juliet'?",
            "answer": "William Shakespeare",
            "type": "normal"
        },
        {
            "id": 3,
            "text": "What is the chemical symbol for gold?",
            "answer": "Au",
            "type": "normal"
        },
        {
            "id": 4,
            "text": "BONUS THEME: Solar System",
            "type": "bonus_theme"
        },
        {
            "id": 5,
            "text": "What is the largest planet in our solar system?",
            "answer": "Jupiter",
            "type": "bonus"
        }
    ]
};

export const QuizProvider = ({ children }) => {
    // Quiz data state
    const [questions, setQuestions] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState(null);

    // Teams state
    const [teams, setTeams] = useState([
        { id: 1, name: 'Team A', players: [], score: 0 },
        { id: 2, name: 'Team B', players: [], score: 0 }
    ]);

    // Quiz runtime state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentRound, setCurrentRound] = useState('normal'); // 'normal', 'bonus', 'lightning'
    const [answerHistory, setAnswerHistory] = useState([]);
    const [bonusTeamId, setBonusTeamId] = useState(null);

    // Fetch current quiz state from backend
    const fetchQuizState = async () => {
        try {
            console.log("Fetching quiz state from backend...");
            const response = await axios.get(`${API_URL}/quiz/current`);
            const data = response.data;
            console.log("Received quiz state:", data);

            setCurrentQuestionIndex(data.current_question_index);
            setCurrentRound(data.current_round);
            setBonusTeamId(data.bonus_team_id);
            setTeams(data.teams);

            // Make sure we have questions loaded
            if (data.current_question && (!questions || questions.length === 0)) {
                console.log("Setting questions from quiz state");
                // Only set questions if we don't already have them
                setQuestions(data.questions || []);
            }
        } catch (error) {
            console.error('Error fetching quiz state:', error);
        }
    };

    // Add a player to a team
    const addPlayer = async (teamId, playerName) => {
        try {
            const response = await axios.post(`${API_URL}/teams/${teamId}/players`, {
                name: playerName
            });

            // Update local state with the new player
            setTeams(teams.map(team => {
                if (team.id === teamId) {
                    return {
                        ...team,
                        players: [...team.players, response.data.player]
                    };
                }
                return team;
            }));
        } catch (error) {
            console.error('Error adding player:', error);
        }
    };

    // Remove a player from a team
    const removePlayer = async (teamId, playerId) => {
        try {
            await axios.delete(`${API_URL}/teams/${teamId}/players/${playerId}`);

            // Update local state by removing the player
            setTeams(teams.map(team => {
                if (team.id === teamId) {
                    return {
                        ...team,
                        players: team.players.filter(player => player.id !== playerId)
                    };
                }
                return team;
            }));
        } catch (error) {
            console.error('Error removing player:', error);
        }
    };

    // Update team name
    const updateTeamName = async (teamId, newName) => {
        try {
            const response = await axios.patch(`${API_URL}/teams/${teamId}`, {
                name: newName
            });

            // Update local state with the new team name
            setTeams(teams.map(team => {
                if (team.id === teamId) {
                    return { ...team, name: newName };
                }
                return team;
            }));
        } catch (error) {
            console.error('Error updating team name:', error);
        }
    };

    // Load quiz questions from a file
    const loadQuestions = async (filePath) => {
        let questions = [];
        try {
            console.log("Loading questions from path:", filePath);
            setIsLoaded(false);
            setLoadError(null);

            try {
                // Try to load from API
                const result = await axios.post(`${API_URL}/load-questions`, { filePath });
                console.log("API response:", result.data);

                if (!result.data.questions || result.data.questions.length === 0) {
                    throw new Error("No questions received from API");
                }

                questions = result.data.questions;
            } catch (error) {
                console.error("API error:", error.message);

                // Fallback to sample data if applicable
                if (filePath === 'sample') {
                    console.log("Using local sample data as fallback");
                    questions = SAMPLE_QUIZ_DATA.questions;
                } else {
                    throw error; // Re-throw if not trying to load sample data
                }
            }

            if (questions && questions.length > 0) {
                console.log(`Successfully loaded ${questions.length} questions`);
                setQuestions(questions);

                // Wait a moment for state to update before fetching quiz state
                setTimeout(() => {
                    fetchQuizState();
                }, 300);

                return questions;
            } else {
                throw new Error("No questions available");
            }
        } catch (error) {
            console.error("Error loading questions:", error);
            setLoadError('Failed to load questions: ' + (error.message || "Unknown error"));
            setIsLoaded(true);
            throw error;
        } finally {
            setIsLoaded(true);
        }
    };

    // Record an answer to a question
    const recordAnswer = async (teamId, playerId, isCorrect, questionIndex, roundType) => {
        try {
            const response = await axios.post(`${API_URL}/quiz/answer`, {
                team_id: teamId,
                player_id: playerId,
                is_correct: isCorrect
            });

            // Update local state with the backend's response
            const updatedTeam = response.data.updated_team;
            const answerRecord = response.data.recorded_answer;

            setTeams(teams.map(team => team.id === updatedTeam.id ? updatedTeam : team));
            setAnswerHistory([...answerHistory, answerRecord]);

            // If this is a bonus-determining question, update the bonus team ID
            if (isCorrect && (questionIndex + 1) % 4 === 0) {
                setBonusTeamId(teamId);
            }
        } catch (error) {
            console.error('Error recording answer:', error);
        }
    };

    // Move to the next question
    const nextQuestion = async () => {
        try {
            const response = await axios.post(`${API_URL}/quiz/next`);

            if (response.data.success) {
                setCurrentQuestionIndex(response.data.current_question_index);
                setCurrentRound(response.data.current_round);
                await fetchQuizState(); // Refresh the entire quiz state
            }
        } catch (error) {
            console.error('Error moving to next question:', error);
        }
    };

    // Get quiz statistics
    const getQuizStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/quiz/stats`);
            return response.data.stats;
        } catch (error) {
            console.error('Error getting quiz stats:', error);
            // Fallback to calculating stats locally if the API fails
            return teams;
        }
    };

    // Reset quiz
    const resetQuiz = async () => {
        try {
            const response = await axios.post(`${API_URL}/quiz/reset`);

            if (response.data.success) {
                setCurrentQuestionIndex(0);
                setCurrentRound('normal');
                setAnswerHistory([]);
                setBonusTeamId(null);

                // Reset local team scores
                setTeams(teams.map(team => ({
                    ...team,
                    score: 0,
                    players: team.players.map(player => ({ ...player, score: 0 }))
                })));

                await fetchQuizState(); // Refresh the entire quiz state
            }
        } catch (error) {
            console.error('Error resetting quiz:', error);
        }
    };

    // Fetch the initial quiz state when the component mounts
    useEffect(() => {
        fetchQuizState();
        // No dependency array as we only want to run this once when the component mounts
    }, []);

    return (
        <QuizContext.Provider value={{
            questions,
            teams,
            currentQuestionIndex,
            currentRound,
            bonusTeamId,
            answerHistory,
            isLoaded,
            loadError,
            loadQuestions,
            addPlayer,
            removePlayer,
            updateTeamName,
            recordAnswer,
            nextQuestion,
            getQuizStats,
            resetQuiz
        }}>
            {children}
        </QuizContext.Provider>
    );
};

export default QuizContext; 