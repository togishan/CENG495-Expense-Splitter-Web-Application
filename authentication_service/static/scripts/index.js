var DATABASE_SERVICE_URL; 
document.addEventListener("DOMContentLoaded", function() {
    DATABASE_SERVICE_URL = document.getElementById("DATABASE_SERVICE_URL").textContent.trim();
});

async function login(){
    let username = document.getElementById("login_username").value;
    let password = document.getElementById("login_password").value;
    let data = JSON.stringify({username, password});
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var response = JSON.parse(xhr.responseText);
            alert(response.message);
            if (xhr.status == 200) {
                window.location.href = 'http://localhost/dashboard?userid=' + response.userid + '&isAuthenticated=true';
            }
        }
    };
    xhr.open("POST", DATABASE_SERVICE_URL+"/login", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(data);
}

async function register(){
    let username = document.getElementById("signup_username").value;
    let password = document.getElementById("signup_password").value;
    let email = document.getElementById("signup_email").value;

    let data1 = JSON.stringify({ username, email, password });
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            alert(xhr.response);
        }
    };
    xhr.open("POST", DATABASE_SERVICE_URL+"/register", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(data1);
}
