var isAuthenticated;
var protectedContent = document.getElementById('protected-content');
var DATABASE_SERVICE_URL;
var EXPENSE_DETAILS_SERVICE_URL;
var EXPENSE_MANAGEMENT_SERVICE_URL;
var groups;
var userid;

document.addEventListener("DOMContentLoaded", function() {
    DATABASE_SERVICE_URL = document.getElementById("DATABASE_SERVICE_URL").textContent.trim();
    EXPENSE_DETAILS_SERVICE_URL = document.getElementById("EXPENSE_DETAILS_SERVICE_URL").textContent.trim();
    EXPENSE_MANAGEMENT_SERVICE_URL = document.getElementById("EXPENSE_MANAGEMENT_SERVICE_URL").textContent.trim();
    let queryParams= new URLSearchParams(window.location.search);

    userid = queryParams.get('userid');
    isAuthenticated = queryParams.get('isAuthenticated');
    if (isAuthenticated) {
        protectedContent.style.display = 'block';
    } else {
        protectedContent.style.display = 'none';
    }
    getAllGroups();

});



function logout(){
    localStorage.setItem('isAuthenticated', 'false');
}

var modal = document.getElementById('modal');
var button = document.getElementsByClassName("button2")[0];

button.onclick = function() {
    modal.style.display = "block";
}

function closeModal() {
    modal.style.display = "none";
    document.getElementById('groupName').value = "";
    document.getElementById('dayInput').value = "";
    document.getElementById('monthInput').value = "";
    document.getElementById('yearInput').value = "";
}

window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

async function getAllGroups(){
    var xhr = new XMLHttpRequest();
    let data = JSON.stringify({userid: userid});
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                groups = JSON.parse(xhr.responseText).groups;
                updateGroupList(groups);
            } else {
                alert('Failed to fetch groups');
            }
        }
    };
    xhr.open("POST", DATABASE_SERVICE_URL+"/getGroupsOfUser", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(data);
}
 
function updateGroupList(groups) {
    var ol = document.querySelector('#protected-content ol');
    var templateLi = document.createElement('li');
    templateLi.style.setProperty('--i', '2'); // Set the initial value of --i

    groups.forEach(group => {
        var li = templateLi.cloneNode(true); // Clone the template <li> element
        var div = document.createElement('div');
        div.className = 'list-item';
        var textDiv = document.createElement('div');
        textDiv.className = 'text-content';
        var h3 = document.createElement('h3');
        h3.textContent = group.group_name;
        textDiv.appendChild(h3);
        div.appendChild(textDiv);
    
        // Add Details button
        var editButtonArea = document.createElement('div');
        editButtonArea.className = 'button-area';
        var editButton = document.createElement('button');
        editButton.className = 'button1';
        editButton.textContent = 'Edit';
        editButtonArea.appendChild(editButton);
        div.appendChild(editButtonArea);
    
        // Add Edit button
        var detailButtonArea = document.createElement('div');
        detailButtonArea.className = 'button-area';
        var detailButton = document.createElement('button');
        detailButton.className = 'button1';
        detailButton.textContent = 'Details';
        detailButton.style.marginLeft = '10px'; // Add margin to the top of the Edit button
        detailButtonArea.appendChild(detailButton);
        div.appendChild(detailButtonArea);
    
        // Add hidden input for group id
        var hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'group_id'; // Use a name to identify the input when submitting a form
        hiddenInput.value = group.id;
        div.appendChild(hiddenInput);
    
        editButton.addEventListener('click', function() {
            var groupId = hiddenInput.value;
            expenseManagement(groupId); 
        });
        detailButton.addEventListener('click', function() {
            var groupId = hiddenInput.value;
            groupDetails(groupId); 
        });
    
        li.appendChild(div);
        ol.appendChild(li);
    });
}

function groupDetails(groupId) {
    window.location.href = EXPENSE_DETAILS_SERVICE_URL + '/expense-details?groupid=' + groupId;
}

function expenseManagement(groupId) {
    window.location.href = EXPENSE_MANAGEMENT_SERVICE_URL + '/expense-management?groupid=' + groupId;
}

async function createGroup() {
    var nameInput = document.getElementById('groupName').value;
    var dayInput = document.getElementById('dayInput').value;
    var monthInput = document.getElementById('monthInput').value;
    var yearInput = document.getElementById('yearInput').value;

    if (isNaN(dayInput) || dayInput < 1 || dayInput > 31) {
        alert('Please enter a valid day (1-31)');
        return;
    }
    if (isNaN(monthInput) || monthInput < 1 || monthInput > 12) {
        alert('Please enter a valid month (1-12)');
        return;
    }
    if (isNaN(yearInput) || yearInput < 1900 || yearInput > 2024) {
        alert('Please enter a valid year (1900-2024)');
        return;
    }

    var dateInput = `${yearInput}-${monthInput}-${dayInput}`;
    let data = JSON.stringify({userid: userid, group_name: nameInput, date: dateInput});

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            alert(xhr.response);
        }
        closeModal();
        location.reload();
    };
    xhr.open("POST", DATABASE_SERVICE_URL+"/addGroupToApp", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(data);
}
