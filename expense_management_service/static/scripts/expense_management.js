var isAuthenticated;
var protectedContent = document.getElementById('protected-content');
var DATABASE_SERVICE_URL;
var groupid;
var memberUsers;
var nonMemberUsers;
var totalExpense;


document.addEventListener("DOMContentLoaded", function() {
    DATABASE_SERVICE_URL = document.getElementById("DATABASE_SERVICE_URL").textContent.trim();
    let queryParams= new URLSearchParams(window.location.search);

    groupid = queryParams.get('groupid');
    isAuthenticated = queryParams.get('isAuthenticated');
    getAllUsersInCurrentGroup();
    getAllNonMembersInCurrentGroup();
});

function openExpenseModal() {
    var modal = document.getElementById("expenseModal");
    modal.style.display = "block";
}

function populateUserSelect(users) {
    let userSelect = document.getElementById("userSelect");
    userSelect.innerHTML = "";
    memberUsers.forEach(user => {
        let option = document.createElement("option");
        option.value = user.id;
        option.text = user.username;
        userSelect.appendChild(option);
    });
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
                memberUsers = users;
                populateUserSelect(users)
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

async function getAllNonMembersInCurrentGroup() {
    var xhr = new XMLHttpRequest();
    let data = JSON.stringify({groupid: groupid});
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                users = JSON.parse(xhr.responseText).users;
                nonMemberUsers = users;
                updateUsersModal(users);
            } else {
                alert('Failed to fetch users');
            }
        }
    };
    xhr.open("POST", DATABASE_SERVICE_URL+"/getAllNonMembersInCurrentGroup", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(data);
}

function updateUsersList(users) {
    let touchablesContainer = document.querySelector('.touchables');
    touchablesContainer.innerHTML = '';
    users.forEach(user => {
        let touchable = document.createElement('div');
        touchable.classList.add('touchable');
        touchable.textContent = user.username; // Assuming user object has a 'name' property
        touchablesContainer.appendChild(touchable);
    });
}

function updateUsersModal(users) {
    let userListContainer = document.getElementById('userList');
    userListContainer.innerHTML = '';

    users.forEach(user => {
        let checkboxLabel = document.createElement('label');
        let checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('value', user.id); 
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(document.createTextNode(user.username));
        checkboxLabel.appendChild(document.createElement('br'));
        userListContainer.appendChild(checkboxLabel);
    });
}

async function addUsersToGroup() {
    let checkedUsers = [];
    let checkboxes = document.querySelectorAll('#userList input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkedUsers.push(checkbox.value);
        }
    });

    var xhr = new XMLHttpRequest();
    let data = JSON.stringify({userids: checkedUsers, groupid: groupid});
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                alert('Users are added successfully');
                window.location.reload();
            } else {
                alert('Failed to add users');
            }
        }
    };
    xhr.open("POST", DATABASE_SERVICE_URL+"/addUsersToGroup", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(data);
}

async function addExpense() {
    let expenseName = document.getElementById("expenseName").value;
    let userid = document.getElementById("userSelect").value;
    let amount = document.getElementById("amount").value;
    let dateTime = document.getElementById("dateTime").value;
   
    var xhr = new XMLHttpRequest();
    let data = JSON.stringify({expense_name: expenseName, user_id: userid, group_id: groupid, amount: amount, expense_date: dateTime });
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                alert("Expense Added Successfully!")
            } else {
                alert('Failed to add expense');
            }
        }
    };
    xhr.open("POST", DATABASE_SERVICE_URL+"/addExpense", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(data);
}