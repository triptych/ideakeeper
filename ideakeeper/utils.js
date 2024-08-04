import { login, checkLoginStatus } from './auth.js';
import { saveIdea, deleteIdea, exportIdeas, importIdeas } from './ideas.js';
import { switchView, openNewIdeaModal, closeIdeaModal, showDeleteConfirmation, renderView } from './views.js';

export function initializeEventListeners() {
    const elements = {
        loginBtn: document.getElementById('loginBtn'),
        newIdeaBtn: document.getElementById('newIdeaBtn'),
        closeModal: document.querySelector('.close'),
        saveIdeaBtn: document.getElementById('saveIdeaBtn'),
        exportBtn: document.getElementById('exportBtn'),
        importBtn: document.getElementById('importBtn'),
        listViewBtn: document.getElementById('listViewBtn'),
        cloudViewBtn: document.getElementById('cloudViewBtn'),
        confirmYes: document.getElementById('confirmYes'),
        confirmNo: document.getElementById('confirmNo'),
        emojiPickerBtn: document.getElementById('emojiPickerBtn'),
        emojiPicker: document.querySelector('emoji-picker'),
        searchInput: document.getElementById('searchInput'),
        sortSelect: document.getElementById('sortSelect')
    };

    // Add event listeners only if the element exists
    if (elements.loginBtn) elements.loginBtn.addEventListener('click', login);
    if (elements.newIdeaBtn) elements.newIdeaBtn.addEventListener('click', openNewIdeaModal);
    if (elements.closeModal) elements.closeModal.addEventListener('click', closeIdeaModal);
    if (elements.saveIdeaBtn) elements.saveIdeaBtn.addEventListener('click', saveIdea);
    if (elements.exportBtn) elements.exportBtn.addEventListener('click', exportIdeas);
    if (elements.importBtn) elements.importBtn.addEventListener('click', importIdeas);
    if (elements.listViewBtn) elements.listViewBtn.addEventListener('click', () => switchView('list'));
    if (elements.cloudViewBtn) elements.cloudViewBtn.addEventListener('click', () => switchView('cloud'));
    if (elements.confirmYes) elements.confirmYes.addEventListener('click', confirmDelete);
    if (elements.confirmNo) elements.confirmNo.addEventListener('click', cancelDelete);
    if (elements.emojiPickerBtn) elements.emojiPickerBtn.addEventListener('click', toggleEmojiPicker);
    if (elements.emojiPicker) elements.emojiPicker.addEventListener('emoji-click', handleEmojiSelection);
    if (elements.searchInput) elements.searchInput.addEventListener('input', renderView);
    if (elements.sortSelect) elements.sortSelect.addEventListener('change', renderView);
}

export async function checkStreak() {
    const today = new Date().toDateString();
    const storedDate = await puter.kv.get('lastUsedDate');
    const storedStreak = await puter.kv.get('streak');

    let streak = storedStreak ? parseInt(storedStreak) : 0;

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

    checkBadges(streak);
}

function checkBadges(streak) {
    if (streak === 1) alert('You earned the "First Day" badge!');
    if (streak === 7) alert('You earned the "One Week" badge!');
    if (streak === 30) alert('You earned the "One Month" badge!');
}

function toggleEmojiPicker() {
    const emojiPicker = document.querySelector('emoji-picker');
    if (emojiPicker) {
        emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
    }
}

function handleEmojiSelection(event) {
    const ideaEmojiInput = document.getElementById('ideaEmoji');
    if (ideaEmojiInput) {
        ideaEmojiInput.value = event.detail.unicode;
    }
    const emojiPicker = document.querySelector('emoji-picker');
    if (emojiPicker) {
        emojiPicker.style.display = 'none';
    }
}

function confirmDelete() {
    deleteIdea();
    const confirmDialog = document.getElementById('confirmDialog');
    if (confirmDialog) confirmDialog.style.display = 'none';
    window.deleteIndex = null;
}

function cancelDelete() {
    const confirmDialog = document.getElementById('confirmDialog');
    if (confirmDialog) confirmDialog.style.display = 'none';
    window.deleteIndex = null;
}