from flask import Blueprint, request, jsonify
import json

# Import the module and its functions explicitly
from ..models.quiz_state import (
    load_questions_from_file,
    reset_quiz_state,
    get_current_state,
    record_answer,
    move_to_next_question,
    calculate_quiz_stats,
)

bp = Blueprint("quiz", __name__, url_prefix="/api")


@bp.route("/load-questions", methods=["POST"])
def load_questions():
    """Load questions from a file or use sample data."""
    data = request.json
    file_path = data.get("filePath")

    try:
        # Reset quiz state
        reset_quiz_state()

        # Load questions
        questions = load_questions_from_file(file_path)

        return jsonify({"questions": questions})

    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except json.JSONDecodeError as e:
        return jsonify({"error": "Invalid JSON format in the quiz file"}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error loading questions: {str(e)}"}), 500


@bp.route("/quiz/current", methods=["GET"])
def get_current_quiz_state():
    """Get the current state of the quiz."""
    try:
        from ..models.quiz_state import quiz_state

        state = get_current_state()

        # Explicitly include the questions array in the response
        state["questions"] = quiz_state["questions"]

        return jsonify(state)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/quiz/answer", methods=["POST"])
def record_answer_route():
    """Record an answer to the current question."""
    data = request.json
    team_id = data.get("team_id")
    player_id = data.get("player_id")
    is_correct = data.get("is_correct")

    if None in [team_id, player_id, is_correct]:
        return (
            jsonify({"error": "team_id, player_id, and is_correct are required"}),
            400,
        )

    try:
        result = record_answer(team_id, player_id, is_correct)
        return jsonify(result)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/quiz/next", methods=["POST"])
def next_question():
    """Move to the next question."""
    try:
        success = move_to_next_question()
        if success:
            from ..models.quiz_state import quiz_state

            return jsonify(
                {
                    "success": True,
                    "current_question_index": quiz_state["current_question_index"],
                    "current_round": quiz_state["current_round"],
                }
            )
        else:
            return jsonify({"error": "Already at the last question"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/quiz/stats", methods=["GET"])
def get_quiz_stats():
    """Get statistics for the quiz."""
    try:
        stats = calculate_quiz_stats()
        return jsonify({"stats": stats})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/quiz/reset", methods=["POST"])
def reset_quiz():
    """Reset the quiz to initial state without clearing questions."""
    try:
        reset_quiz_state()
        return jsonify({"success": True, "message": "Quiz reset successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
