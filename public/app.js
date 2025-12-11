// Use Render backend in production; fallback to same-origin for local development
const RENDER_BACKEND = 'https://chat-app-7c3g.onrender.com';
const socket = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? io()
  : io(RENDER_BACKEND, { transports: ['websocket', 'polling'] });

// Debug connection status
socket.on('connect', () => console.log('Socket connected', socket.id));
socket.on('connect_error', (err) => console.error('Socket connect_error', err));
let username = '';
let profilePicData = '';

const onboarding = document.getElementById('onboarding');
const usernameInput = document.getElementById('username');
const profilePicInput = document.getElementById('profilePic');

const joinBtn = document.getElementById('joinBtn');
const welcomeMsg = document.getElementById('welcomeMsg');
const userCount = document.getElementById('userCount');
const userPanel = document.getElementById('users');
const chatHistory = document.getElementById('chatHistory');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const typingIndicator = document.getElementById('typingIndicator');
const roomInput = document.getElementById('room');


let room = '';
joinBtn.onclick = () => {
  username = usernameInput.value.trim();
  room = roomInput.value.trim();
  if (!username) return alert('Please enter your name');
  if (!room) return alert('Please enter a room name');
  if (profilePicInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      profilePicData = e.target.result;
      finishJoin();
    };
    reader.readAsDataURL(profilePicInput.files[0]);
  } else {
    profilePicData = '';
    finishJoin();
  }
};

function finishJoin() {
  socket.emit('join', { username, profilePic: profilePicData, room });
  onboarding.style.display = 'none';
  document.querySelector('header').style.display = 'block';
  document.querySelector('main').style.display = 'flex';
  welcomeMsg.textContent = `Welcome, ${username}! (Room: ${room})`;
}

socket.on('chatHistory', (messages) => {
  chatHistory.innerHTML = '';
  messages.forEach(renderMessage);
});

socket.on('message', renderMessage);

function renderMessage(msg) {
  const isMine = username && msg.username === username;
  const div = document.createElement('div');
  div.className = 'message' + (isMine ? ' mine' : '');

  const img = document.createElement('img');
  img.className = 'profile-pic';
  img.src = msg.profilePic || 'https://via.placeholder.com/40';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  if (isMine) contentDiv.classList.add('mine-content');

  const headerDiv = document.createElement('div');
  headerDiv.className = 'message-header';
  headerDiv.textContent = `${msg.username} • ${new Date(msg.timestamp).toLocaleTimeString()}`;

  contentDiv.appendChild(headerDiv);
  contentDiv.appendChild(document.createTextNode(msg.content));

  // For own messages, show content before profile pic (row-reverse via CSS)
  div.appendChild(img);
  div.appendChild(contentDiv);

  chatHistory.appendChild(div);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

socket.on('userList', (users) => {
  userPanel.innerHTML = '';
  userCount.textContent = `Users online: ${users.length}`;
  users.forEach(user => {
    const li = document.createElement('li');
    const dot = document.createElement('span');
    dot.className = 'online-dot';
    const img = document.createElement('img');
    img.className = 'profile-pic';
    img.src = user.profilePic || 'https://via.placeholder.com/32';
    li.appendChild(dot);
    li.appendChild(img);
    li.appendChild(document.createTextNode(user.username));
    userPanel.appendChild(li);
  });
});

socket.on('userJoined', ({ username, profilePic }) => {
  const div = document.createElement('div');
  div.className = 'message';
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.style.background = '#e0ffe0';
  contentDiv.style.textAlign = 'center';
  contentDiv.textContent = `${username} joined the room!`;
  div.appendChild(contentDiv);
  chatHistory.appendChild(div);
  chatHistory.scrollTop = chatHistory.scrollHeight;
});

socket.on('userLeft', (username) => {
  const div = document.createElement('div');
  div.className = 'message';
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.style.background = '#ffe0e0';
  contentDiv.style.textAlign = 'center';
  contentDiv.textContent = `${username} left the room.`;
  div.appendChild(contentDiv);
  chatHistory.appendChild(div);
  chatHistory.scrollTop = chatHistory.scrollHeight;
});

socket.on('userJoined', ({ username, profilePic }) => {
  // Optionally show a notification
});

socket.on('userLeft', (username) => {
  // Optionally show a notification
});


chatForm.onsubmit = (e) => {
  e.preventDefault();
  if (chatInput.value.trim()) {
    socket.emit('message', { content: chatInput.value, room });
    chatInput.value = '';
    socket.emit('stopTyping', username);
  }
};

chatInput.oninput = () => {
  if (chatInput.value) {
    socket.emit('typing', username);
  } else {
    socket.emit('stopTyping', username);
  }
};

chatInput.onblur = () => {
  socket.emit('stopTyping', username);
};

socket.on('typing', (user) => {
  typingIndicator.textContent = `${user} is typing...`;
});

socket.on('stopTyping', () => {
  typingIndicator.textContent = '';
});
