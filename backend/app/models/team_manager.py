import time
from .quiz_state import quiz_state

def get_teams():
    """Get current teams."""
    return quiz_state["teams"]

def update_teams(teams_data):
    """Update teams with new data."""
    quiz_state["teams"] = teams_data
    return quiz_state["teams"]

def add_player(team_id, player_name):
    """Add a player to a team."""
    if not player_name:
        raise ValueError("Player name is required")
    
    for i, team in enumerate(quiz_state["teams"]):
        if team["id"] == team_id:
            new_player = {
                "id": int(time.time() * 1000),  # Simple ID generation
                "name": player_name,
                "score": 0
            }
            quiz_state["teams"][i]["players"].append(new_player)
            return new_player
    
    raise ValueError(f"Team with ID {team_id} not found")

def remove_player(team_id, player_id):
    """Remove a player from a team."""
    for i, team in enumerate(quiz_state["teams"]):
        if team["id"] == team_id:
            quiz_state["teams"][i]["players"] = [p for p in team["players"] if p["id"] != player_id]
            return True
    
    raise ValueError("Team or player not found")

def update_team_name(team_id, new_name):
    """Update a team's name."""
    if not new_name:
        raise ValueError("Team name is required")
    
    for i, team in enumerate(quiz_state["teams"]):
        if team["id"] == team_id:
            quiz_state["teams"][i]["name"] = new_name
            return quiz_state["teams"][i]
    
    raise ValueError(f"Team with ID {team_id} not found") 