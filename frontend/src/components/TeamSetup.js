import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizContext from '../contexts/QuizContext';

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
        <div className="container">
            <div className="card">
                <h1 className="text-center">Team Setup</h1>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                        <div className="mt-2">
                            <button
                                className="btn btn-outline-danger"
                                onClick={() => navigate('/')}
                            >
                                Return to Setup
                            </button>
                        </div>
                    </div>
                )}

                <div className="row">
                    {teams.map(team => (
                        <div key={team.id} className="col-md-6 team">
                            <div className="card">
                                <div className="card-header team-header">
                                    <input
                                        type="text"
                                        value={team.name}
                                        onChange={(e) => handleTeamNameChange(team.id, e.target.value)}
                                        className="form-control"
                                    />
                                </div>

                                <div className="card-body">
                                    <h5>Players:</h5>
                                    {team.players.length === 0 ? (
                                        <p>No players added yet</p>
                                    ) : (
                                        <ul className="list-group">
                                            {team.players.map(player => (
                                                <li key={player.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                    {player.name}
                                                    <button
                                                        onClick={() => removePlayer(team.id, player.id)}
                                                        className="btn btn-sm btn-danger"
                                                    >
                                                        Remove
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <form onSubmit={handleAddPlayer}>
                        <div className="row">
                            <div className="col-md-4">
                                <select
                                    value={newPlayer.teamId}
                                    onChange={(e) => setNewPlayer({ ...newPlayer, teamId: parseInt(e.target.value) })}
                                    className="form-control"
                                >
                                    {teams.map(team => (
                                        <option key={team.id} value={team.id}>
                                            {team.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6">
                                <input
                                    type="text"
                                    value={newPlayer.name}
                                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                                    placeholder="Enter player name"
                                    className="form-control"
                                />
                            </div>

                            <div className="col-md-2">
                                <button type="submit" className="btn">
                                    Add Player
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="text-center mt-4">
                    <button
                        onClick={handleStartQuiz}
                        className="btn btn-lg"
                    >
                        Start Quiz
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamSetup; 