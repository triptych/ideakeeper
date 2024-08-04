import { ideas } from './ideas.js';

export function renderView() {
    if (window.currentView === 'list' || window.currentView === undefined) {
        renderListView();
    } else {
        renderCloudView();
    }
}

function renderListView() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const ideasList = document.getElementById('ideasList');
    console.log({
        searchInput,
        sortSelect,
        ideasList
    })
    if (!searchInput || !sortSelect || !ideasList) return;

    const searchTerm = searchInput.value.toLowerCase();
    const sortOption = sortSelect.value;

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
    if (!cloudView) return;

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
    if (!cloudView) return;

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

export function switchView(view) {
    window.currentView = view;
    const listView = document.getElementById('listView');
    const cloudView = document.getElementById('cloudView');
    const listViewBtn = document.getElementById('listViewBtn');
    const cloudViewBtn = document.getElementById('cloudViewBtn');

    if (view === 'list') {
        if (listView) listView.classList.add('active');
        if (cloudView) cloudView.classList.remove('active');
        if (listViewBtn) listViewBtn.classList.add('active');
        if (cloudViewBtn) cloudViewBtn.classList.remove('active');
    } else {
        if (listView) listView.classList.remove('active');
        if (cloudView) cloudView.classList.add('active');
        if (listViewBtn) listViewBtn.classList.remove('active');
        if (cloudViewBtn) cloudViewBtn.classList.add('active');
    }
    renderView();
}

export function openNewIdeaModal() {
    window.currentEditingIndex = null;
    const ideaModal = document.getElementById('ideaModal');
    const ideaTitle = document.getElementById('ideaTitle');
    const ideaDescription = document.getElementById('ideaDescription');
    const ideaEmoji = document.getElementById('ideaEmoji');
    const ideaTags = document.getElementById('ideaTags');
    const ideaStatus = document.getElementById('ideaStatus');

    if (ideaModal) ideaModal.style.display = 'block';
    if (ideaTitle) ideaTitle.value = '';
    if (ideaDescription) ideaDescription.value = '';
    if (ideaEmoji) ideaEmoji.value = '';
    if (ideaTags) ideaTags.value = '';
    if (ideaStatus) ideaStatus.value = 'todo';
}

export function closeIdeaModal() {
    console.log("close idea modal")
    const ideaModal = document.getElementById('ideaModal');
    const emojiPicker = document.querySelector('emoji-picker');
    
    if (ideaModal) ideaModal.style.display = 'none';
    window.currentEditingIndex = null;
    if (emojiPicker) emojiPicker.style.display = 'none';
}

export function showDeleteConfirmation(index) {
    window.deleteIndex = index;
    const confirmDialog = document.getElementById('confirmDialog');
    if (confirmDialog) confirmDialog.style.display = 'block';
}

export function editIdea(index) {
    console.log('editIdea')
    window.currentEditingIndex = index;
    const idea = ideas[index];
    const ideaModal = document.getElementById('ideaModal');
    const ideaTitle = document.getElementById('ideaTitle');
    const ideaDescription = document.getElementById('ideaDescription');
    const ideaEmoji = document.getElementById('ideaEmoji');
    const ideaTags = document.getElementById('ideaTags');
    const ideaStatus = document.getElementById('ideaStatus');

    if (ideaTitle) ideaTitle.value = idea.title;
    if (ideaDescription) ideaDescription.value = idea.description;
    if (ideaEmoji) ideaEmoji.value = idea.emoji;
    if (ideaTags) ideaTags.value = idea.tags.join(', ');
    if (ideaStatus) ideaStatus.value = idea.status;
    if (ideaModal) ideaModal.style.display = 'block';
}