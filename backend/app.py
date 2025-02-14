from flask import Flask, request, jsonify  # type: ignore
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
import bcrypt
import mysql.connector  # MySQL library
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)  # This will allow all origins by default
load_dotenv()

# Setup JWT Manager
app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY")  # Change this to your secret key
jwt = JWTManager(app)


db_host = os.getenv("DB_HOST")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_name = os.getenv("DB_NAME")

# MySQL Database Connection
db_config = {
    "host": db_host,  # Change to your host if needed
    "user": db_user,  # Replace with your MySQL username
    "password": db_password,  # Replace with your MySQL password
    "database": db_name  # Replace with your database name
}


def get_db_connection():
    return mysql.connector.connect(**db_config)


@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Flask App"})


# User Registration route
@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    # Store user in the database
    connection = get_db_connection()
    cursor = connection.cursor()
    query = "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)"
    cursor.execute(query, (username, email, hashed_password.decode('utf-8')))
    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({"message": "User registered successfully"}), 201

# User Login route


@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    # Fetch user from the database
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    cursor.close()
    connection.close()

    if user and bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        # Create JWT token
        access_token = create_access_token(identity=user["id"])
        return jsonify({"access_token": access_token}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401


# Fetch all expenses from the database
@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM expenses")
    expenses = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(expenses)


# Add a new expense to the database
@app.route('/api/expenses', methods=['POST'])
def add_expense():
    new_expense = request.get_json()
    amount = new_expense['amount']
    category = new_expense['category']
    date = new_expense['date']

    connection = get_db_connection()
    cursor = connection.cursor()
    query = "INSERT INTO expenses (amount, category, date) VALUES (%s, %s, %s)"
    cursor.execute(query, (amount, category, date))
    connection.commit()
    cursor.close()
    connection.close()

    # Add the generated ID to the response
    new_expense['id'] = cursor.lastrowid
    return jsonify(new_expense), 201

    # Delete an expense from the database


@app.route('/api/expenses/<int:id>', methods=['DELETE'])
def delete_expense(id):
    connection = get_db_connection()
    cursor = connection.cursor()
    query = "DELETE FROM expenses WHERE id = %s"
    cursor.execute(query, (id,))
    connection.commit()
    cursor.close()
    connection.close()
    return jsonify({"message": f"Expense with id {id} deleted successfully"}), 200

# Clear all expenses from the database


# Clear all expenses from the database and reset auto-increment
@app.route('/api/expenses', methods=['DELETE'])
def clear_expenses():
    connection = get_db_connection()
    cursor = connection.cursor()

    # Delete all expenses
    query = "DELETE FROM expenses"
    cursor.execute(query)

    # Reset auto-increment value
    cursor.execute("ALTER TABLE expenses AUTO_INCREMENT = 1")

    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({"message": "All expenses cleared, auto-increment reset"}), 200


if __name__ == '__main__':
    app.run(debug=True)
