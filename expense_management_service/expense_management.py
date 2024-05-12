from flask import Flask, send_file, jsonify, redirect, render_template, session, url_for, request
import json
import os
from flask_cors import CORS
DATABASE_SERVICE_URL = os.environ.get('DATABASE_SERVICE_URL')
EXPENSE_DETAILS_SERVICE_URL = os.environ.get('EXPENSE_DETAILS_SERVICE_URL')
app = Flask(__name__)
CORS(app)

@app.route('/expense-management', methods=['GET'])
def expense():
    groupId = request.args.get('groupid')
    return render_template("expense_management.html", groupId=groupId,  DATABASE_SERVICE_URL = DATABASE_SERVICE_URL)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')


