from flask import Flask, send_file, jsonify, redirect, render_template, session, url_for, request
import json
import os
from flask_cors import CORS
DATABASE_SERVICE_URL = os.environ.get('DATABASE_SERVICE_URL')
EXPENSE_DETAILS_SERVICE_URL = os.environ.get('EXPENSE_DETAILS_SERVICE_URL')
EXPENSE_MANAGEMENT_SERVICE_URL = os.environ.get('EXPENSE_MANAGEMENT_SERVICE_URL')

app = Flask(__name__)
CORS(app)

@app.route('/dashboard')
def dashboard():
    return render_template("dashboard.html", DATABASE_SERVICE_URL = DATABASE_SERVICE_URL, EXPENSE_DETAILS_SERVICE_URL = EXPENSE_DETAILS_SERVICE_URL, EXPENSE_MANAGEMENT_SERVICE_URL = EXPENSE_MANAGEMENT_SERVICE_URL)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

