class Expenses {

    constructor(expenses) {
        this.expenses = new Map();
        expenses.forEach(expense => {
            this.addExpense(expense.user_id, expense.amount);
        });
        this.setTotalExpenseAmount();
        this.setBalanceOfUsers();
    }
    
    addExpense(userid, amount) {
        if (this.expenses.has(userid)) {
            this.expenses.get(userid).totalUserExpense += amount;
        } else {
            this.expenses.set(userid, { totalUserExpense: amount, balance: 0 });
        }
    }
    
    setTotalExpenseAmount() {
        let total = 0;
        this.expenses.forEach((expense) => {
            total += expense.totalUserExpense;
        });
        this.totalAmount = total;
    }

    setBalanceOfUsers() {
        let usersWithExpense = Array.from(this.expenses.keys()).length;
        let equallyPartionedAmount = this.totalAmount / usersWithExpense;
        this.expenses.forEach(expense => {
            expense.balance = expense.totalUserExpense - equallyPartionedAmount;
        });
    }
}

var isAuthenticated;
var protectedContent = document.getElementById('protected-content');
var DATABASE_SERVICE_URL;
var groupid;
var expensesData;

document.addEventListener("DOMContentLoaded", function() {
    DATABASE_SERVICE_URL = document.getElementById("DATABASE_SERVICE_URL").textContent.trim();
    let queryParams= new URLSearchParams(window.location.search);

    groupid = queryParams.get('groupid');
    isAuthenticated = queryParams.get('isAuthenticated');
    getAllExpensesInGroup();
    


});

function openExpenseModal() {
    var modal = document.getElementById("expenseModal");
    modal.style.display = "block";
}

function closeExpenseModal() {
    var modal = document.getElementById("expenseModal");
    modal.style.display = "none";
}


function openUserModal() {
    var modal = document.getElementById("userModal");
    modal.style.display = "block";
}

function closeUserModal() {
    var modal = document.getElementById("userModal");
    modal.style.display = "none";
}

async function getAllUsersInCurrentGroup() {
    var xhr = new XMLHttpRequest();
    let data = JSON.stringify({groupid: groupid});
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                users = JSON.parse(xhr.responseText).users;
                updateUsersList(users);
            } else {
                alert('Failed to fetch users');
            }
        }
    };
    xhr.open("POST", DATABASE_SERVICE_URL+"/getAllUsersInCurrentGroup", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(data);
}

async function getAllExpensesInGroup() {
    var xhr = new XMLHttpRequest();
    let data = JSON.stringify({groupid: groupid});

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                expenses = JSON.parse(xhr.responseText).expenses;
                expensesData = new Expenses(expenses);
                updateExpensesList(expenses);
                getAllUsersInCurrentGroup();
            } else {
                alert('Failed to fetch expenses');
            }
        }
    };
    xhr.open("POST", DATABASE_SERVICE_URL+"/getAllExpensesInGroup", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(data);
}


function updateUsersList(users) {
    // Get the touchables container
    let touchablesContainer = document.getElementById('touchables');

    // Clear existing touchables
    touchablesContainer.innerHTML = '';

    // Create and append touchables for each user
    users.forEach(user => {
        let userExpenseData = expensesData.expenses.get(user.id);
        let touchable = document.createElement('div');
        touchable.classList.add('touchable');
        touchable.textContent = "Username: " + user.username; // Assuming user object has a 'name' property
        touchable.innerHTML += "<br>Balance: " + userExpenseData.balance;

        touchablesContainer.appendChild(touchable);
    });
    let totalDiv = document.getElementById('total');
    totalDiv.innerHTML = expensesData.totalAmount;
}
function updateExpensesList(expenses) {
    // Get the touchables container
    let touchablesContainer = document.getElementById('touchables2');

    // Clear existing touchables
    touchablesContainer.innerHTML = '';

    // Create and append touchables for each user
    expenses.forEach(expense => {
        let touchable = document.createElement('div');
        touchable.classList.add('touchable');
        touchable.textContent = "Expense Name: " + expense.expense_name;
        touchable.innerHTML += '<br>Expense Owner: ' + expense.username;
        touchable.innerHTML += '<br>Amount: ' + expense.amount;
        touchablesContainer.appendChild(touchable);
    });
}