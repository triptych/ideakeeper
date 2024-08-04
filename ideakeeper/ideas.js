import { renderView } from './views.js';

let ideas = [];

export async function loadIdeas() {
    try {
        const storedIdeas = await puter.kv.get('ideas');
        if (storedIdeas) {
            ideas = JSON.parse(storedIdeas);
        }
    } catch (error) {
        console.error('Failed to load ideas:', error);
    }
}
export async function saveIdea() {
    const ideaTitle = document.getElementById('ideaTitle');
    const ideaDescription = document.getElementById('ideaDescription');
    const ideaEmoji = document.getElementById('ideaEmoji');
    const ideaTags = document.getElementById('ideaTags');
    const ideaStatus = document.getElementById('ideaStatus');

    if (!ideaTitle || !ideaDescription || !ideaEmoji || !ideaTags || !ideaStatus) return;

    const title = ideaTitle.value;
    const description = ideaDescription.value;
    const emoji = ideaEmoji.value;
    const tags = ideaTags.value.split(',').map(tag => tag.trim());
    const status = ideaStatus.value;

    const updatedIdea = { 
        title, 
        description, 
        emoji, 
        tags, 
        status, 
        createdAt: new Date().toISOString() 
    };

    if (window.currentEditingIndex !== null) {
        ideas[window.currentEditingIndex] = { ...ideas[window.currentEditingIndex], ...updatedIdea };
    } else {
        ideas.push(updatedIdea);
    }

    await puter.kv.set('ideas', JSON.stringify(ideas));
    closeIdeaModal();
    renderView();
}

export async function deleteIdea() {
    if (window.deleteIndex !== null) {
        ideas.splice(window.deleteIndex, 1);
        await puter.kv.set('ideas', JSON.stringify(ideas));
        renderView();
    }
}

export function exportIdeas() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ideas));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ideas.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

export function importIdeas() {
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

export { ideas };