import { checkLoginStatus, login } from './auth.js';
import { loadIdeas, saveIdea, deleteIdea, exportIdeas, importIdeas } from './ideas.js';
import { renderView, switchView, openNewIdeaModal, closeIdeaModal, showDeleteConfirmation, editIdea } from './views.js';
import { initializeEventListeners, checkStreak } from './utils.js';

// Global variables
let currentUser = null;
let currentView = 'list';
let currentEditingIndex = null;
let deleteIndex = null;

async function initApp() {
    await checkLoginStatus();
    initializeEventListeners();
    await loadIdeas();
    renderView(); // Add this line to ensure the view is rendered after ideas are loaded
}

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export functions and variables that need to be globally accessible
window.login = login;
window.saveIdea = saveIdea;
window.deleteIdea = deleteIdea;
window.exportIdeas = exportIdeas;
window.importIdeas = importIdeas;
window.editIdea = editIdea;
window.switchView = switchView;
window.openNewIdeaModal = openNewIdeaModal;
window.closeIdeaModal = closeIdeaModal;
window.showDeleteConfirmation = showDeleteConfirmation;