from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

# Replace with your Supabase info
SUPABASE_URL = 'https://lmugwvvihinxxllipyqd.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdWd3dnZpaGlueHhsbGlweXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0OTc5MDUsImV4cCI6MjA2ODA3MzkwNX0.A2L5MWcm1L8ejcVhR1pr0QEAr24rpcsIKCkpsAnnIlc'
TABLE_NAME = 'problems'

HEADERS = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json'
}

@app.route('/problems', methods=['GET'])
def get_problems():
    date_filter = request.args.get('date')
    if date_filter:
        url = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}?date=eq.{date_filter}&select=*"
    else:
        url = f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}?select=*"
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
