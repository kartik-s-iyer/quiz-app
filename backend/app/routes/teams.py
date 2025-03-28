from flask import Blueprint, request, jsonify
from ..models import team_manager

bp = Blueprint('teams', __name__, url_prefix='/api')

@bp.route('/teams', methods=['GET'])
def get_teams():
    """Get current teams info."""
    try:
        teams = team_manager.get_teams()
        return jsonify({"teams": teams})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/teams', methods=['PUT'])
def update_teams():
    """Update teams information."""
    try:
        data = request.json
        if "teams" in data:
            teams = team_manager.update_teams(data["teams"])
            return jsonify({"teams": teams})
        else:
            return jsonify({'error': 'Teams data is required'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/teams/<int:team_id>/players', methods=['POST'])
def add_player(team_id):
    """Add a player to a team."""
    try:
        data = request.json
        player_name = data.get('name')
        
        if not player_name:
            return jsonify({'error': 'Player name is required'}), 400
        
        new_player = team_manager.add_player(team_id, player_name)
        return jsonify({"player": new_player})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/teams/<int:team_id>/players/<int:player_id>', methods=['DELETE'])
def remove_player(team_id, player_id):
    """Remove a player from a team."""
    try:
        success = team_manager.remove_player(team_id, player_id)
        return jsonify({"success": success})
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/teams/<int:team_id>', methods=['PATCH'])
def update_team_name(team_id):
    """Update a team's name."""
    try:
        data = request.json
        new_name = data.get('name')
        
        if not new_name:
            return jsonify({'error': 'Team name is required'}), 400
        
        team = team_manager.update_team_name(team_id, new_name)
        return jsonify({"team": team})
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500 