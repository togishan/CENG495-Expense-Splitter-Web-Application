from flask import Flask, send_file, jsonify, redirect, render_template, session, url_for, request

from flask_cors import CORS
import os
import hashlib

DATABASE_SERVICE_URL = os.getenv("DATABASE_SERVICE_URL")

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template("index.html",  DATABASE_SERVICE_URL = DATABASE_SERVICE_URL)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')