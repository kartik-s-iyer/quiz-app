# Quiz Master App

A comprehensive quiz hosting application for managing quiz nights. This application allows the quizmaster to load questions, manage teams, track scores, and view statistics.

## Features

- Input quiz questions via JSON file or use sample data
- Set up two teams with any number of players
- Track player-specific scores and performances
- Handle special rounds:
  - Bonus rounds (every 4th question) - only answered by the team that answered the previous toss-up question
  - Lightning rounds (every 8th question) - quick-fire themed questions with penalties for wrong answers
- Display detailed statistics at the end of the quiz for both teams and individual players

## Technical Stack

- **Frontend**: React.js
- **Backend**: Python (Flask)
- **Data Storage**: JSON

## Getting Started

### Prerequisites

- Node.js and npm for the frontend
- Python 3.7+ for the backend
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd quiz-app
   ```

2. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```
   cd ../backend
   pip install -r requirements.txt
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   python main.py
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Quiz Format

The quiz consists of 64 questions in the following pattern:

1. Normal toss-up questions (both teams can answer)
2. After every 4th question: Bonus round (4 themed questions answered by one team)
3. After every 8th question: Lightning round (10 themed quick-fire questions)

### Scoring

- All questions are worth 5 points each
- Incorrect answers in normal and bonus rounds: No penalty, the other team gets a chance
- Incorrect answers in lightning rounds: -5 points penalty

## Creating Your Own Quiz

Create a JSON file with the following structure:

```json
{
  "questions": [
    {
      "id": 1,
      "text": "What is the capital of France?",
      "answer": "Paris",
      "type": "normal"
    },
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
  ]
}
```

The question types are:
- `normal`: Regular toss-up questions
- `bonus_theme`: The theme introduction for a bonus round (no answer needed)
- `bonus`: Questions in the bonus round
- `lightning_theme`: The theme introduction for a lightning round (no answer needed)
- `lightning`: Questions in the lightning round

## License

[MIT License](LICENSE)

## Backend Architecture

The backend is organized using a modular structure:

```
backend/
  ├── app/
  │   ├── models/             # Data models
  │   │   ├── quiz_state.py   # Quiz state and operations
  │   │   └── team_manager.py # Team management
  │   ├── routes/             # API routes
  │   │   ├── quiz.py         # Quiz-related endpoints
  │   │   └── teams.py        # Team-related endpoints
  │   └── utils/              # Utility functions
  └── run.py                  # Application entry point
```

### Running the Backend

To run the backend:

```bash
cd backend
pip install -r requirements.txt
python run.py
```

The API will be available at `http://localhost:5000/api/`

## API Endpoints

### Quiz Endpoints

- `POST /api/load-questions` - Load questions from a file or use sample data
- `GET /api/quiz/current` - Get the current quiz state
- `POST /api/quiz/answer` - Record an answer to the current question
- `POST /api/quiz/next` - Move to the next question
- `GET /api/quiz/stats` - Get quiz statistics
- `POST /api/quiz/reset` - Reset the quiz state

### Team Endpoints

- `GET /api/teams` - Get all teams
- `PUT /api/teams` - Update teams
- `POST /api/teams/:teamId/players` - Add a player to a team
- `DELETE /api/teams/:teamId/players/:playerId` - Remove a player from a team
- `PATCH /api/teams/:teamId` - Update a team's name 