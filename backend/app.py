from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os

# app = Flask(__name__, static_folder='../frontend', static_url_path='')
app = Flask(__name__, static_folder='frontend', static_url_path='')
CORS(app)

# Serve frontend files
@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_file(path):
    return send_from_directory(app.static_folder, path)

# SQLite setup
def init_db():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS problems (
            id TEXT PRIMARY KEY,
            title TEXT,
            platform TEXT,
            tags TEXT,
            notes TEXT,
            status TEXT,
            date TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

def row_to_dict(row):
    return {
        "id": row[0],
        "title": row[1],
        "platform": row[2],
        "tags": row[3].split(',') if row[3] else [],
        "notes": row[4],
        "status": row[5],
        "date": row[6]
    }

@app.route('/problems', methods=['GET'])
def get_problems():
    selected_date = request.args.get('date')  # from ?date=YYYY-MM-DD
    conn = sqlite3.connect('database.db')
    c = conn.cursor()

    if selected_date:
        # Return only problems from that date
        c.execute('SELECT * FROM problems WHERE date = ?', (selected_date,))
    else:
        # Return all problems sorted by date
        c.execute('SELECT * FROM problems ORDER BY date DESC')

    rows = c.fetchall()
    conn.close()
    return jsonify([row_to_dict(row) for row in rows])



@app.route('/problems', methods=['POST'])
def add_problem():
    data = request.json
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('''
        INSERT INTO problems (id, title, platform, tags, notes, status, date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['id'],
        data['title'],
        data.get('platform', ''),
        ','.join(data.get('tags', [])),
        data.get('notes', ''),
        data.get('status', 'todo'),
        data.get('date')
    ))
    conn.commit()
    conn.close()
    return jsonify({"message": "Problem added!"}), 201

@app.route('/problems/<id>', methods=['PUT'])
def update_problem(id):
    data = request.json
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('''
        UPDATE problems SET status=?, notes=?, tags=? WHERE id=?
    ''', (
        data.get('status', ''),
        data.get('notes', ''),
        ','.join(data.get('tags', [])),
        id
    ))
    conn.commit()
    conn.close()
    return jsonify({"message": "Problem updated!"})

@app.route('/problems/<id>', methods=['DELETE'])
def delete_problem(id):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('DELETE FROM problems WHERE id=?', (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Problem deleted!"})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)

