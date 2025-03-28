"""
This file is kept for backward compatibility.
It simply imports the application from the refactored structure.
"""

from run import app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
