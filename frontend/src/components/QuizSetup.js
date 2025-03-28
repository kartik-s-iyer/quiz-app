import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizContext from '../contexts/QuizContext';

const QuizSetup = () => {
    const navigate = useNavigate();
    const { loadQuestions, isLoaded, loadError } = useContext(QuizContext);
    const [filePath, setFilePath] = useState('');
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
        <div className="container">
            <div className="card">
                <h1 className="text-center">Quiz Master Setup</h1>

                <form onSubmit={handleFileSubmit}>
                    <div className="form-group">
                        <label htmlFor="filePath">JSON File Path:</label>
                        <input
                            type="text"
                            id="filePath"
                            value={filePath}
                            onChange={(e) => setFilePath(e.target.value)}
                            className="form-control"
                            placeholder="Enter path to your quiz JSON file"
                        />
                        <small className="form-text text-muted">
                            Enter the path to your JSON quiz file or use the sample data option below.
                        </small>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}
                    {loadError && <div className="alert alert-danger">{loadError}</div>}

                    <div className="d-flex justify-content-between mt-4">
                        <button
                            type="submit"
                            className="btn"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Load Questions'}
                        </button>

                        <button
                            type="button"
                            onClick={handleSampleDataClick}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            Use Sample Data
                        </button>
                    </div>
                </form>

                <div className="mt-4">
                    <h3>JSON Format Example:</h3>
                    <pre className="bg-light p-3 border rounded">
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
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default QuizSetup; 