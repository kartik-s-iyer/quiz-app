import time
import json
import os

# In-memory quiz state (in a real app, you'd use a proper database)
quiz_state = {
    "questions": [],
    "teams": [
        {"id": 1, "name": "Team A", "players": [], "score": 0},
        {"id": 2, "name": "Team B", "players": [], "score": 0}
    ],
    "current_question_index": 0,
    "current_round": "normal",
    "answer_history": [],
    "bonus_team_id": None
}

# Sample quiz data
SAMPLE_QUIZ = {
    "questions": [
        # Normal questions (1-3)
        {"id": 1, "text": "What is the capital of France?", "answer": "Paris", "type": "normal"},
        {"id": 2, "text": "Who wrote 'Romeo and Juliet'?", "answer": "William Shakespeare", "type": "normal"},
        {"id": 3, "text": "What is the chemical symbol for gold?", "answer": "Au", "type": "normal"},
        
        # First bonus round (4-8)
        {"id": 4, "text": "BONUS THEME: Solar System", "type": "bonus_theme"},
        {"id": 5, "text": "What is the largest planet in our solar system?", "answer": "Jupiter", "type": "bonus"},
        {"id": 6, "text": "Which planet is known as the Red Planet?", "answer": "Mars", "type": "bonus"},
        {"id": 7, "text": "Which planet has the most moons?", "answer": "Saturn", "type": "bonus"},
        {"id": 8, "text": "What is the smallest planet in our solar system?", "answer": "Mercury", "type": "bonus"},
        
        # More normal questions (9-11)
        {"id": 9, "text": "Which country is home to the kangaroo?", "answer": "Australia", "type": "normal"},
        {"id": 10, "text": "What is the largest mammal in the world?", "answer": "Blue Whale", "type": "normal"},
        {"id": 11, "text": "Who painted the Mona Lisa?", "answer": "Leonardo da Vinci", "type": "normal"},
        
        # First lightning round (12-22)
        {"id": 12, "text": "LIGHTNING ROUND: World Capitals", "type": "lightning_theme"},
        {"id": 13, "text": "Capital of Japan?", "answer": "Tokyo", "type": "lightning"},
        {"id": 14, "text": "Capital of Egypt?", "answer": "Cairo", "type": "lightning"},
        {"id": 15, "text": "Capital of Australia?", "answer": "Canberra", "type": "lightning"},
        {"id": 16, "text": "Capital of Brazil?", "answer": "Brasília", "type": "lightning"},
        {"id": 17, "text": "Capital of Canada?", "answer": "Ottawa", "type": "lightning"},
        {"id": 18, "text": "Capital of Spain?", "answer": "Madrid", "type": "lightning"},
        {"id": 19, "text": "Capital of South Korea?", "answer": "Seoul", "type": "lightning"},
        {"id": 20, "text": "Capital of Italy?", "answer": "Rome", "type": "lightning"},
        {"id": 21, "text": "Capital of Argentina?", "answer": "Buenos Aires", "type": "lightning"},
        {"id": 22, "text": "Capital of India?", "answer": "New Delhi", "type": "lightning"}
        # More questions would be added to reach 64 total
    ]
}

def load_questions_from_file(file_path):
    """Load questions from a file or use sample data."""
    if file_path == 'sample':
        quiz_state["questions"] = SAMPLE_QUIZ["questions"]
        return SAMPLE_QUIZ["questions"]
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    with open(file_path, 'r') as f:
        quiz_data = json.load(f)
        
    if 'questions' not in quiz_data:
        raise ValueError("Invalid quiz format: missing 'questions' key")
    
    quiz_state["questions"] = quiz_data["questions"]
    return quiz_data["questions"]

def reset_quiz_state():
    """Reset quiz state without clearing questions."""
    quiz_state["current_question_index"] = 0
    quiz_state["current_round"] = "normal"
    quiz_state["answer_history"] = []
    quiz_state["bonus_team_id"] = None
    
    # Reset team and player scores
    for i, team in enumerate(quiz_state["teams"]):
        quiz_state["teams"][i]["score"] = 0
        for j, player in enumerate(team["players"]):
            quiz_state["teams"][i]["players"][j]["score"] = 0
    
    return True

def get_current_question():
    """Get the current question."""
    current_index = quiz_state["current_question_index"]
    if current_index >= len(quiz_state["questions"]):
        return None
    return quiz_state["questions"][current_index]

def get_current_state():
    """Get the current quiz state."""
    current_question = get_current_question()
    return {
        "current_question_index": quiz_state["current_question_index"],
        "current_round": quiz_state["current_round"],
        "current_question": current_question,
        "bonus_team_id": quiz_state["bonus_team_id"],
        "teams": quiz_state["teams"],
        "total_questions": len(quiz_state["questions"])
    }

def move_to_next_question():
    """Move to the next question."""
    current_index = quiz_state["current_question_index"]
    
    if current_index < len(quiz_state["questions"]) - 1:
        quiz_state["current_question_index"] = current_index + 1
        quiz_state["current_round"] = check_next_round(current_index)
        return True
    return False

def check_next_round(question_index):
    """Determine what type of round the next question is."""
    if (question_index + 1) % 8 == 0:
        return 'lightning'
    elif (question_index + 1) % 4 == 0:
        return 'bonus'
    else:
        return 'normal'

def record_answer(team_id, player_id, is_correct):
    """Record an answer to the current question."""
    current_index = quiz_state["current_question_index"]
    if current_index >= len(quiz_state["questions"]):
        raise ValueError("No current question")
    
    current_question = quiz_state["questions"][current_index]
    round_type = current_question["type"]
    
    # Calculate points based on answer and round type
    points = 0
    if is_correct:
        points = 5
    elif round_type == "lightning" and not is_correct:
        points = -5
    
    # Update player and team scores
    team_index = None
    player_index = None
    
    for i, team in enumerate(quiz_state["teams"]):
        if team["id"] == team_id:
            team_index = i
            quiz_state["teams"][i]["score"] += points
            
            for j, player in enumerate(team["players"]):
                if player["id"] == player_id:
                    player_index = j
                    quiz_state["teams"][i]["players"][j]["score"] += points
                    break
            break
    
    if team_index is None or player_index is None:
        raise ValueError("Team or player not found")
    
    # Record the answer in history
    answer_record = {
        "question_index": current_index,
        "team_id": team_id,
        "player_id": player_id,
        "is_correct": is_correct,
        "points": points,
        "timestamp": int(time.time()),
        "round_type": round_type
    }
    
    quiz_state["answer_history"].append(answer_record)
    
    # If this is the question before a bonus round and answer is correct,
    # set this team as the one who gets to answer the bonus
    if is_correct and check_next_round(current_index) == 'bonus':
        quiz_state["bonus_team_id"] = team_id
    
    return {
        "recorded_answer": answer_record,
        "updated_team": quiz_state["teams"][team_index]
    }

def calculate_quiz_stats():
    """Calculate quiz statistics for teams and players."""
    team_stats = []
    
    for team in quiz_state["teams"]:
        team_answers = [a for a in quiz_state["answer_history"] if a["team_id"] == team["id"]]
        correct_answers = [a for a in team_answers if a["is_correct"]]
        
        normal_answers = [a for a in team_answers if a["round_type"] == "normal"]
        bonus_answers = [a for a in team_answers if a["round_type"] == "bonus"]
        lightning_answers = [a for a in team_answers if a["round_type"] == "lightning"]
        
        player_stats = []
        for player in team["players"]:
            player_answers = [a for a in team_answers if a["player_id"] == player["id"]]
            player_correct = [a for a in player_answers if a["is_correct"]]
            
            player_stats.append({
                "id": player["id"],
                "name": player["name"],
                "score": player["score"],
                "stats": {
                    "total_answered": len(player_answers),
                    "correct_answers": len(player_correct),
                    "accuracy": (len(player_correct) / len(player_answers) * 100) if player_answers else 0
                }
            })
        
        team_stats.append({
            "id": team["id"],
            "name": team["name"],
            "score": team["score"],
            "players": player_stats,
            "stats": {
                "total_answered": len(team_answers),
                "correct_answers": len(correct_answers),
                "accuracy": (len(correct_answers) / len(team_answers) * 100) if team_answers else 0,
                "normal_points": sum(a["points"] for a in normal_answers),
                "bonus_points": sum(a["points"] for a in bonus_answers),
                "lightning_points": sum(a["points"] for a in lightning_answers)
            }
        })
    
    return team_stats 