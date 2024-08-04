import { checkStreak } from './utils.js';

export async function checkLoginStatus() {
    if (puter.auth.isSignedIn()) {
        try {
            const user = await puter.auth.getUser();
            window.currentUser = user;
            const loginBtn = document.getElementById('loginBtn');
            const userInfo = document.getElementById('userInfo');
            if (loginBtn) loginBtn.style.display = 'none';
            if (userInfo) {
                userInfo.style.display = 'inline';
                userInfo.textContent = `Welcome, ${user.username}!`;
            }
            await checkStreak();
        } catch (error) {
            console.error('Error getting user info:', error);
        }
    } else {
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        if (loginBtn) loginBtn.style.display = 'inline';
        if (userInfo) userInfo.style.display = 'none';
    }
}

export async function login() {
    try {
        await puter.auth.signIn();
        await checkLoginStatus();
    } catch (error) {
        console.error('Login failed:', error);
    }
}