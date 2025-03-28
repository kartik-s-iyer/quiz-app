import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizContext from '../contexts/QuizContext';

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
        return <div className="container"><div className="card text-center">Loading stats...</div></div>;
    }

    if (!teamStats.length) {
        return <div className="container"><div className="card text-center">No stats available</div></div>;
    }

    return (
        <div className="container">
            <div className="card mb-4">
                <h1 className="text-center">Quiz Results</h1>

                {isWinner ? (
                    <div className="text-center mb-4">
                        <h2 className="winner">🏆 Winner: {winner.name} 🏆</h2>
                        <h3>Score: {winner.score} points</h3>
                    </div>
                ) : (
                    <div className="text-center mb-4">
                        <h2>It's a Tie!</h2>
                        <h3>Both teams scored {sortedTeams[0].score} points</h3>
                    </div>
                )}

                <div className="stats-container">
                    {teamStats.map(team => (
                        <div key={team.id} className="card mb-4">
                            <div className="card-header team-header">
                                <h3>{team.name}</h3>
                                <h3>Score: {team.score}</h3>
                            </div>
                            <div className="card-body">
                                <h4>Team Statistics</h4>
                                <table className="table">
                                    <tbody>
                                        <tr>
                                            <td>Total Questions Answered:</td>
                                            <td>{team.stats.totalAnswered || team.stats.total_answered || 0}</td>
                                        </tr>
                                        <tr>
                                            <td>Correct Answers:</td>
                                            <td>{team.stats.correctAnswers || team.stats.correct_answers || 0}</td>
                                        </tr>
                                        <tr>
                                            <td>Accuracy:</td>
                                            <td>{(team.stats.accuracy || 0).toFixed(1)}%</td>
                                        </tr>
                                        <tr>
                                            <td>Normal Round Points:</td>
                                            <td>{team.stats.normalPoints || team.stats.normal_points || 0}</td>
                                        </tr>
                                        <tr>
                                            <td>Bonus Round Points:</td>
                                            <td>{team.stats.bonusPoints || team.stats.bonus_points || 0}</td>
                                        </tr>
                                        <tr>
                                            <td>Lightning Round Points:</td>
                                            <td>{team.stats.lightningPoints || team.stats.lightning_points || 0}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <h4 className="mt-4">Player Statistics</h4>
                                <div className="stats-container">
                                    {team.players.map(player => (
                                        <div key={player.id} className="card">
                                            <div className="card-header">
                                                <h5>{player.name}</h5>
                                                <h5>Score: {player.score}</h5>
                                            </div>
                                            <div className="card-body">
                                                <table className="table">
                                                    <tbody>
                                                        <tr>
                                                            <td>Questions Answered:</td>
                                                            <td>{player.stats?.totalAnswered || player.stats?.total_answered || 0}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Correct Answers:</td>
                                                            <td>{player.stats?.correctAnswers || player.stats?.correct_answers || 0}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Accuracy:</td>
                                                            <td>{(player.stats?.accuracy || 0).toFixed(1)}%</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-4">
                    <button
                        onClick={handleNewQuiz}
                        className="btn btn-lg"
                    >
                        Start New Quiz
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizStats; 