let user = null;

// AUTOMATIC PROTOCOL DETECTION
// If we are on https://, use wss://. If http://, use ws://
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}/chat`;

const socket = new WebSocket(wsUrl);
const messages = document.getElementById('messages');

socket.onopen = () => {
    console.log("Connected to WebSocket!");
};

socket.onmessage = (msg) => {
    const data = JSON.parse(msg.data);

    switch (data.type) {
        case 'error':
            alert(data.message);
            break;

        case 'auth':
            if (data.success) {
                setLoggedInState(data.username);
            } else {
                setLoggedOutState();
            }
            break;

        case 'message':
            addMessage(data.message, data.username);
            break;

        default:
            console.log("Unknown message type:", data);
    }
};

// --- Event Listeners ---

document.getElementById('login').onclick = () => authRequest('login');
document.getElementById('signup').onclick = () => authRequest('signup');

document.getElementById('send').addEventListener('click', () => {
    if (user == null) return;
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (message) {
        addMessage(message);
        sendMessage(message);
        input.value = '';
    }
});

document.getElementById('messageInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') document.getElementById('send').click();
});

document.getElementById('logout').addEventListener('click', () => {
    if (user === null) return;
    socket.send(JSON.stringify({ type: 'logout', username: user }));
    setLoggedOutState();
});

// --- Helper Functions ---

function authRequest(type) {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }
    socket.send(JSON.stringify({ type, username, password }));
}

function setLoggedInState(username) {
    user = username;
    document.getElementById("login").disabled = true;
    document.getElementById("signup").disabled = true;
    document.getElementById("logout").disabled = false;
    document.getElementById("username").disabled = true;
    document.getElementById("password").disabled = true;
    console.log("Logged in as:", user);
}

function setLoggedOutState() {
    user = null;
    document.getElementById("login").disabled = false;
    document.getElementById("signup").disabled = false;
    document.getElementById("logout").disabled = true;
    document.getElementById("username").disabled = false;
    document.getElementById("password").disabled = false;
    console.log("Logged out");
}

function addMessage(message, sender = user) {
    const messagesDiv = document.getElementById('messages');
    const newMessage = document.createElement('div');
    newMessage.textContent = `${sender}: ${message}`;
    messagesDiv.appendChild(newMessage);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage(message) {
    socket.send(JSON.stringify({
        'type': 'message',
        'username': user,
        'message': message
    }));
}