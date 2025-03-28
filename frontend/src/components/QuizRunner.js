import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizContext from '../contexts/QuizContext';

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
            <div className="container">
                <div className="card text-center p-5">
                    <h2>Loading Quiz...</h2>
                    <p>Please wait while we prepare your questions.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="card text-center p-5">
                    <div className="alert alert-danger">
                        <h3>Error Loading Quiz</h3>
                        <p>{error}</p>
                        <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
                            Return to Setup
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!questions || questions.length === 0 || !currentQuestion) {
        return (
            <div className="container">
                <div className="card text-center p-5">
                    <h3>No Questions Available</h3>
                    <p>There seems to be an issue with the quiz questions.</p>
                    <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
                        Return to Setup
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card">
                <div className="row mb-4">
                    <div className="col-md-6">
                        <h2>Question {currentQuestionIndex + 1} of {questions.length}</h2>
                        {isBonus && <div className="alert alert-info">Bonus Round</div>}
                        {isLightning && <div className="alert alert-warning">Lightning Round</div>}
                    </div>
                    <div className="col-md-6 text-right">
                        {(isBonus || isBonusQuestion) && eligibleTeam && (
                            <div className="alert alert-info">
                                Bonus Team: {eligibleTeam.name}
                            </div>
                        )}
                    </div>
                </div>

                <div className="question card">
                    <h3>{currentQuestion.text}</h3>
                    {showAnswer && (
                        <div className="answer alert alert-success mt-3">
                            <strong>Answer:</strong> {currentQuestion.answer}
                        </div>
                    )}
                </div>

                {(isBonus || isBonusQuestion) && (
                    <div className="timer-controls text-center my-3">
                        <div className="timer">{timeLeft}</div>
                        <div className="btn-group">
                            <button
                                className="btn"
                                onClick={startTimer}
                                disabled={timerRunning}
                            >
                                Start Timer
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={stopTimer}
                                disabled={!timerRunning}
                            >
                                Pause Timer
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={resetTimer}
                            >
                                Reset Timer
                            </button>
                        </div>
                    </div>
                )}

                <div className="row">
                    <div className="col-12 mb-3">
                        <div className="alert alert-info" role="alert">
                            <i className="fa fa-info-circle mr-2"></i>
                            Click directly on a player's name to select them for answering. Use "Skip Question" if no one answers.
                        </div>
                    </div>
                    {teams.map(team => (
                        <div
                            key={team.id}
                            className="col-md-6"
                            style={{
                                opacity:
                                    (isBonusQuestion && eligibleTeam && team.id !== eligibleTeam.id) ? 0.5 : 1,
                                pointerEvents:
                                    (isBonusQuestion && eligibleTeam && team.id !== eligibleTeam.id) ? 'none' : 'auto'
                            }}
                        >
                            <div
                                className={`card team ${selectedTeam?.id === team.id ? 'border-primary' : ''}`}
                                onClick={() => handleTeamSelect(team)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="card-header team-header">
                                    <h4>{team.name}</h4>
                                    <h4>Score: {team.score}</h4>
                                </div>
                                <div className="card-body">
                                    <h5>Click on a player to select:</h5>
                                    <div className="player-list">
                                        {team.players.map(player => (
                                            <div
                                                key={player.id}
                                                className={`player-card ${selectedPlayer?.id === player.id && selectedTeam?.id === team.id ? 'selected' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePlayerSelect(team, player);
                                                }}
                                                style={{
                                                    cursor: 'pointer',
                                                    padding: '10px',
                                                    margin: '5px 0',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '5px',
                                                    backgroundColor: selectedPlayer?.id === player.id && selectedTeam?.id === team.id ? '#e6f7ff' : '#fff',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: selectedPlayer?.id === player.id && selectedTeam?.id === team.id ? '0 0 5px rgba(0,123,255,0.5)' : 'none'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = selectedPlayer?.id === player.id && selectedTeam?.id === team.id ? '#e6f7ff' : '#f8f9fa'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = selectedPlayer?.id === player.id && selectedTeam?.id === team.id ? '#e6f7ff' : '#fff'}
                                            >
                                                <div><strong>{player.name}</strong></div>
                                                <div>Points: {player.score}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="controls mt-4 d-flex justify-content-between">
                    <div>
                        <button
                            className="btn"
                            onClick={() => setShowAnswer(!showAnswer)}
                        >
                            {showAnswer ? 'Hide Answer' : 'Show Answer'}
                        </button>
                    </div>

                    <div>
                        {selectedTeam && selectedPlayer && !answered && (
                            <>
                                <button
                                    className="btn"
                                    onClick={handleCorrectAnswer}
                                >
                                    Correct (+5)
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleIncorrectAnswer}
                                >
                                    Incorrect {isLightningQuestion ? '(-5)' : '(0)'}
                                </button>
                            </>
                        )}
                    </div>

                    <div>
                        {(currentQuestionIndex < questions.length - 1) ? (
                            <button
                                className="btn"
                                onClick={handleNextQuestion}
                                disabled={!answered && !isBonus && !isLightning}
                            >
                                Next Question
                            </button>
                        ) : (
                            <button
                                className="btn"
                                onClick={handleFinishQuiz}
                            >
                                Finish Quiz
                            </button>
                        )}

                        {/* Add Skip button for questions no one answers */}
                        {!answered && !isBonus && !isLightning && (
                            <button
                                className="btn btn-outline-secondary ml-2"
                                onClick={handleSkipQuestion}
                                style={{ marginLeft: '10px' }}
                            >
                                Skip Question
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizRunner;