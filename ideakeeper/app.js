// Global variables
let ideas = [];
let folders = [];
let currentUser = null;
let streak = 0;
let lastUsedDate = null;
let currentView = 'list';
let currentEditingIndex = null;
let deleteIndex = null;

// Functions
function initApp() {
    // Set DOM Elements
    const loginBtn = document.getElementById('loginBtn');
    const userInfo = document.getElementById('userInfo');
    const newIdeaBtn = document.getElementById('newIdeaBtn');
    const listView = document.getElementById('listView');
    const cloudView = document.getElementById('cloudView');
    const ideaModal = document.getElementById('ideaModal');
    const closeModal = document.querySelector('.close');
    const saveIdeaBtn = document.getElementById('saveIdeaBtn');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const cloudViewBtn = document.getElementById('cloudViewBtn');
    const confirmDialog = document.getElementById('confirmDialog');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');
    const emojiPickerBtn = document.getElementById('emojiPickerBtn');
    const emojiPicker = document.querySelector('emoji-picker');
    const ideaEmojiInput = document.getElementById('ideaEmoji');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    // Set Event Listeners
    loginBtn.addEventListener('click', login);
    newIdeaBtn.addEventListener('click', openNewIdeaModal);
    closeModal.addEventListener('click', closeIdeaModal);
    saveIdeaBtn.addEventListener('click', saveIdea);
    exportBtn.addEventListener('click', exportIdeas);
    importBtn.addEventListener('click', importIdeas);
    listViewBtn.addEventListener('click', () => switchView('list'));
    cloudViewBtn.addEventListener('click', () => switchView('cloud'));
    confirmYes.addEventListener('click', confirmDelete);
    confirmNo.addEventListener('click', cancelDelete);
    emojiPickerBtn.addEventListener('click', toggleEmojiPicker);
    emojiPicker.addEventListener('emoji-click', handleEmojiSelection);
    searchInput.addEventListener('input', renderListView);
    sortSelect.addEventListener('change', renderListView);

    // Initial load
    checkLoginStatus();
}

async function checkLoginStatus() {
    if (puter.auth.isSignedIn()) {
        try {
            const user = await puter.auth.getUser();
            currentUser = user;
            document.getElementById('loginBtn').style.display = 'none';
            document.getElementById('userInfo').style.display = 'inline';
            document.getElementById('userInfo').textContent = `Welcome, ${user.username}!`;
            await loadIdeas();
            await checkStreak();
        } catch (error) {
            console.error('Error getting user info:', error);
        }
    } else {
        document.getElementById('loginBtn').style.display = 'inline';
        document.getElementById('userInfo').style.display = 'none';
    }
}

async function login() {
    try {
        await puter.auth.signIn();
        await checkLoginStatus();
    } catch (error) {
        console.error('Login failed:', error);
    }
}

async function loadIdeas() {
    try {
        const storedIdeas = await puter.kv.get('ideas');
        if (storedIdeas) {
            ideas = JSON.parse(storedIdeas);
            renderView();
        }
    } catch (error) {
        console.error('Failed to load ideas:', error);
    }
}

function renderView() {
    if (currentView === 'list') {
        renderListView();
    } else {
        renderCloudView();
    }
}

function renderListView() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortOption = document.getElementById('sortSelect').value;

    let filteredIdeas = ideas.filter(idea =>
        idea.title.toLowerCase().includes(searchTerm) ||
        idea.description.toLowerCase().includes(searchTerm) ||
        idea.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    filteredIdeas.sort((a, b) => {
        switch (sortOption) {
            case 'dateDesc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'dateAsc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'titleAsc':
                return a.title.localeCompare(b.title);
            case 'titleDesc':
                return b.title.localeCompare(a.title);
            case 'status':
                return a.status.localeCompare(b.status);
            default:
                return 0;
        }
    });

    const ideasList = document.getElementById('ideasList');
    ideasList.innerHTML = '';
    filteredIdeas.forEach((idea, index) => {
        const ideaCard = document.createElement('div');
        ideaCard.className = 'idea-card';
        ideaCard.innerHTML = `
            <h3>${idea.emoji} ${idea.title}</h3>
            <p>${idea.description}</p>
            <p>Tags: ${idea.tags.join(', ')}</p>
            <p>Status: ${idea.status}</p>
            <button onclick="editIdea(${index})"><i class="fas fa-edit"></i> Edit</button>
            <button onclick="showDeleteConfirmation(${index})"><i class="fas fa-trash"></i> Delete</button>
        `;
        ideasList.appendChild(ideaCard);
    });
}

function renderCloudView() {
    const cloudView = document.getElementById('cloudView');
    cloudView.innerHTML = '';
    const tagConnections = {};

    ideas.forEach((idea, index) => {
        const node = document.createElement('div');
        node.className = 'cloud-node';
        node.style.left = `${Math.random() * 60 + 20}%`;
        node.style.top = `${Math.random() * 60 + 20}%`;
        node.innerHTML = `
            <span class="emoji">${idea.emoji}</span>
            <span class="title">${idea.title}</span>
        `;
        node.onclick = () => editIdea(index);
        cloudView.appendChild(node);

        idea.tags.forEach(tag => {
            if (!tagConnections[tag]) {
                tagConnections[tag] = [];
            }
            tagConnections[tag].push(node);
        });
    });

    // Draw connections
    Object.values(tagConnections).forEach(nodes => {
        if (nodes.length > 1) {
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    drawLine(nodes[i], nodes[j]);
                }
            }
        }
    });
}

function drawLine(node1, node2) {
    const cloudView = document.getElementById('cloudView');
    const line = document.createElement('div');
    line.className = 'tag-line';

    const x1 = node1.offsetLeft + node1.offsetWidth / 2;
    const y1 = node1.offsetTop + node1.offsetHeight / 2;
    const x2 = node2.offsetLeft + node2.offsetWidth / 2;
    const y2 = node2.offsetTop + node2.offsetHeight / 2;

    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    line.style.width = `${length}px`;
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.transform = `rotate(${angle}deg)`;

    cloudView.appendChild(line);
}

function openNewIdeaModal() {
    currentEditingIndex = null;
    document.getElementById('ideaModal').style.display = 'block';
    document.getElementById('ideaTitle').value = '';
    document.getElementById('ideaDescription').value = '';
    document.getElementById('ideaEmoji').value = '';
    document.getElementById('ideaTags').value = '';
    document.getElementById('ideaStatus').value = 'todo';
}

function closeIdeaModal() {
    document.getElementById('ideaModal').style.display = 'none';
    currentEditingIndex = null;
    document.querySelector('emoji-picker').style.display = 'none';
}

async function saveIdea() {
    const title = document.getElementById('ideaTitle').value;
    const description = document.getElementById('ideaDescription').value;
    const emoji = document.getElementById('ideaEmoji').value;
    const tags = document.getElementById('ideaTags').value.split(',').map(tag => tag.trim());
    const status = document.getElementById('ideaStatus').value;

    const updatedIdea = { 
        title, 
        description, 
        emoji, 
        tags, 
        status, 
        createdAt: new Date().toISOString() 
    };

    if (currentEditingIndex !== null) {
        ideas[currentEditingIndex] = { ...ideas[currentEditingIndex], ...updatedIdea };
    } else {
        ideas.push(updatedIdea);
    }

    await puter.kv.set('ideas', JSON.stringify(ideas));
    renderView();
    closeIdeaModal();
}

function editIdea(index) {
    currentEditingIndex = index;
    const idea = ideas[index];
    document.getElementById('ideaTitle').value = idea.title;
    document.getElementById('ideaDescription').value = idea.description;
    document.getElementById('ideaEmoji').value = idea.emoji;
    document.getElementById('ideaTags').value = idea.tags.join(', ');
    document.getElementById('ideaStatus').value = idea.status;
    document.getElementById('ideaModal').style.display = 'block';
}

function showDeleteConfirmation(index) {
    deleteIndex = index;
    document.getElementById('confirmDialog').style.display = 'block';
}

async function confirmDelete() {
    if (deleteIndex !== null) {
        ideas.splice(deleteIndex, 1);
        await puter.kv.set('ideas', JSON.stringify(ideas));
        renderView();
    }
    document.getElementById('confirmDialog').style.display = 'none';
    deleteIndex = null;
}

function cancelDelete() {
    document.getElementById('confirmDialog').style.display = 'none';
    deleteIndex = null;
}

function exportIdeas() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ideas));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ideas.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importIdeas() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async function(event) {
            const importedIdeas = JSON.parse(event.target.result);
            ideas = ideas.concat(importedIdeas);
            await puter.kv.set('ideas', JSON.stringify(ideas));
            renderView();
        };
        reader.readAsText(file);
    };
    input.click();
}

function switchView(view) {
    currentView = view;
    if (view === 'list') {
        document.getElementById('listView').classList.add('active');
        document.getElementById('cloudView').classList.remove('active');
        document.getElementById('listViewBtn').classList.add('active');
        document.getElementById('cloudViewBtn').classList.remove('active');
    } else {
        document.getElementById('listView').classList.remove('active');
        document.getElementById('cloudView').classList.add('active');
        document.getElementById('listViewBtn').classList.remove('active');
        document.getElementById('cloudViewBtn').classList.add('active');
    }
    renderView();
}

async function checkStreak() {
    const today = new Date().toDateString();
    const storedDate = await puter.kv.get('lastUsedDate');
    const storedStreak = await puter.kv.get('streak');

    if (storedStreak) streak = parseInt(storedStreak);

    if (storedDate && storedDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (storedDate === yesterday) {
            streak++;
        } else {
            streak = 1;
        }
    } else if (!storedDate) {
        streak = 1;
    }

    await puter.kv.set('lastUsedDate', today);
    await puter.kv.set('streak', streak.toString());

    checkBadges();
}

function checkBadges() {
    if (streak === 1) alert('You earned the "First Day" badge!');
    if (streak === 7) alert('You earned the "One Week" badge!');
    if (streak === 30) alert('You earned the "One Month" badge!');
}

function toggleEmojiPicker() {
    const emojiPicker = document.querySelector('emoji-picker');
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
}

function handleEmojiSelection(event) {
    document.getElementById('ideaEmoji').value = event.detail.unicode;
    document.querySelector('emoji-picker').style.display = 'none';
}

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);