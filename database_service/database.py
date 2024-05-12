from datetime import datetime
from flask import Flask, jsonify, request, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import or_

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
db = SQLAlchemy(app)
CORS(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)

class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    group_name = db.Column(db.String(50), unique=True, nullable=False)
    creation_date = db.Column(db.DateTime, nullable=False, default=datetime.now())
    users_groups = db.relationship('Users_Groups', backref='group')
    expenses = db.relationship('Expense', backref='group')

class Users_Groups(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('group.id'), primary_key=True)

class Expense(db.Model):
    expense_name = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('group.id'), primary_key=True)
    amount = db.Column(db.Integer, autoincrement = True)
    expense_date = db.Column(db.DateTime, nullable=False, default=datetime.now())


@app.route('/register', methods=['POST'])
def register():

    username = request.json.get('username')
    password = request.json.get('password')
    email = request.json.get('email')

    user = User.query.filter(or_(User.username == username, User.email == email)).first()
    if user:
        response = make_response("User with same username or email already exists", 400)
        return response
    
    new_user = User(username=username, password=password, email=email)
    db.session.add(new_user)
    db.session.commit()
    response = make_response("User registered successfully", 200)
    return response

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    user = User.query.filter_by(username=username, password=password).first()
    if user:
        response_data = {"message": "Login successful", "userid": user.id}
        response = make_response(jsonify(response_data), 200)
        return response
    response_data = {"message": "Invalid username or password"}
    response = make_response(jsonify(response_data), 400)
    return response


@app.route('/addGroupToApp', methods=['POST'])
def addGroup():
    userid = request.json.get('userid')
    group_name = request.json.get('group_name')
    date_str = request.json.get('date')
    if not group_name:
        return make_response("Groupname is required", 400)
    if not date_str:
        return make_response("Date is required", 400)

    date = datetime.strptime(date_str, "%Y-%m-%d")
    new_group = Group(group_name=group_name, creation_date=date)
    db.session.add(new_group)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return make_response(str(e), 500)
    
    # Add creator to the group
    user = User.query.filter_by(id=userid).first()
    if not user:
        return make_response("User not found", 404)
    
    new_user_group = Users_Groups(user_id=user.id, group_id=new_group.id)
    db.session.add(new_user_group)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return make_response(str(e), 500)

    response = make_response("Group added successfully", 200)
    return response

@app.route('/addUsersToGroup', methods=['POST'])
def addUsersToGroup():
    userids = request.json.get('userids')
    groupid = request.json.get('groupid')
    errors = []

    group = Group.query.filter_by(id=groupid).first()
    if not group:
        errors.append("Group not found")

    for userid in userids:
        user = User.query.filter_by(id=userid).first()
        if not user:
            errors.append(f"User with ID {userid} not found")
            continue

        user_group = Users_Groups.query.filter_by(user_id=user.id, group_id=group.id).first()
        if user_group:
            errors.append(f"User {user.username} is already in the group")
            continue

        new_user_group = Users_Groups(user_id=user.id, group_id=group.id)
        db.session.add(new_user_group)

    if errors:
        db.session.rollback()
        return make_response("\n".join(errors), 400)
    try:
        db.session.commit()
        return make_response("Users added to group successfully", 200)
    except Exception as e:
        db.session.rollback()
        return make_response(str(e), 500)


@app.route('/getGroupsOfUser', methods=['POST'])
def getGroupsOfUser():
    userid = request.json.get('userid') 
    user = User.query.filter_by(id=userid).first()
    if not user:
        return make_response("User not found", 404)
    
    # Get groups of the user
    user_groups = Users_Groups.query.filter_by(user_id=user.id).all()
    groups = [Group.query.get(group.group_id) for group in user_groups]

    # Create response
    response_data = {
        "groups": [{"id": group.id, "group_name": group.group_name, "date": group.creation_date} for group in groups]
    }
    response = make_response(jsonify(response_data), 200)
    return response

@app.route('/getAllUsersInCurrentGroup', methods=['POST'])
def getAllUsersInCurrentGroup():
    groupid = request.json.get('groupid') 
    group = Group.query.filter_by(id=groupid).first()
    if not group:
        return make_response("Group not found", 404)
   
    user_groups = Users_Groups.query.filter_by(group_id=groupid).all()
    users = [User.query.get(user.user_id) for user in user_groups]
    response_data = {
        "users": [{"id": user.id, "username": user.username} for user in users]
    }
    response = make_response(jsonify(response_data), 200)
    return response

@app.route('/getAllNonMembersInCurrentGroup', methods=['POST'])
def getAllNonMembersInCurrentGroup():
    groupid = request.json.get('groupid')
    group = Group.query.filter_by(id=groupid).first()
    if not group:
        return make_response("Group not found", 404)

    group_user_ids = [user_group.user_id for user_group in group.users_groups]
    non_members = User.query.filter(User.id.notin_(group_user_ids)).all()
    
    response_data = {
        "users": [{"id": user.id, "username": user.username} for user in non_members]
    }
    response = make_response(jsonify(response_data), 200)
    return response

@app.route('/addExpense', methods=['POST'])
def addExpense():
    expense_name = request.json.get('expense_name')
    user_id = request.json.get('user_id')
    group_id = request.json.get('group_id')
    amount = request.json.get('amount')
    expense_date_str = request.json.get('expense_date')
    expense_date = datetime.strptime(expense_date_str, '%Y-%m-%dT%H:%M')

    group = Group.query.filter_by(id=group_id).first()
    if not group:
        return make_response("Group not found", 404)

    expense =  Expense(expense_name=expense_name, user_id=user_id, group_id=group_id, amount=amount, expense_date=expense_date)
    db.session.add(expense)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return make_response(str(e), 500)

    response = make_response("OK", 200)
    return response

@app.route('/getAllExpensesInGroup', methods=['POST'])
def getAllExpensesInGroup():
    groupid = request.json.get('groupid')
    group = Group.query.filter_by(id=groupid).first()
    if not group:
        return make_response("Group not found", 404)

    expenses = Expense.query.filter_by(group_id=groupid).all()
    response_data = {
        "expenses": [{"expense_name": expense.expense_name, "user_id": expense.user_id, "username": User.query.get(expense.user_id).username, "amount": expense.amount, "expense_date": expense.expense_date} for expense in expenses]
    }
    response = make_response(jsonify(response_data), 200)
    return response

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0')