from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import os

app = Flask(__name__, static_folder='backend/frontend', static_url_path='')
CORS(app)

SUPABASE_URL = 'https://lmugwvvihinxxllipyqd.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdWd3dnZpaGlueHhsbGlweXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0OTc5MDUsImV4cCI6MjA2ODA3MzkwNX0.A2L5MWcm1L8ejcVhR1pr0QEAr24rpcsIKCkpsAnnIlc'
TABLE_NAME = 'problems'

HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}
@app.route('/problems', methods=['POST'])
def addd_problem():
    data = request.json
    print("Incoming POST:", data)  # 👈 Add this line
    url = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}"
    res = requests.post(url, headers=HEADERS, json=data)
    return jsonify({"message": "Added!"}), res.status_code

# ✅ Serve index.html at "/"
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

# ✅ API routes
@app.route('/problems', methods=['GET'])
def get_problems():
    date_filter = request.args.get('date')
    url = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}?select=*"
    if date_filter:
        url = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}?date=eq.{date_filter}&select=*"
    res = requests.get(url, headers=HEADERS)
    return jsonify(res.json())

@app.route('/problems', methods=['POST'])
def add_problem():
    data = request.json
    url = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}"
    res = requests.post(url, headers=HEADERS, json=data)
    return jsonify({"message": "Added!"}), res.status_code

@app.route('/problems/<id>', methods=['PUT'])
def update_problem(id):
    data = request.json
    url = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}?id=eq.{id}"
    res = requests.patch(url, headers=HEADERS, json=data)
    return jsonify({"message": "Updated!"}), res.status_code

@app.route('/problems/<id>', methods=['DELETE'])
def delete_problem(id):
    url = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}?id=eq.{id}"
    res = requests.delete(url, headers=HEADERS)
    return jsonify({"message": "Deleted!"}), res.status_code

if __name__ == '__main__':
    app.run(debug=True)
