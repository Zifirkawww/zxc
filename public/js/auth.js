// Глобальні змінні для зберігання стану авторизації
let currentUser = null;
let authToken = null;

// DOM елементи
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const authContainer = document.querySelector('.container.mt-5');
const mainContent = document.getElementById('main-content');
const currentUsername = document.getElementById('current-username');
const userRole = document.getElementById('user-role');
const adminControls = document.getElementById('admin-controls');
const actionsHeader = document.getElementById('actions-header');

// Перевірка авторизації при завантаженні сторінки
document.addEventListener('DOMContentLoaded', checkAuth);

// Обробники подій
if (loginForm) loginForm.addEventListener('submit', handleLogin);
if (registerForm) registerForm.addEventListener('submit', handleRegister);
if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

// Функція для перевірки авторизації
async function checkAuth() {
    try {
        const response = await fetch('/api/users/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Включає cookies в запит
        });

        if (response.ok) {
            const userData = await response.json();
            setAuthenticatedUser(userData);
            loadExercises(); // Завантаження даних після авторизації
        }
    } catch (error) {
        console.error('Помилка перевірки авторизації:', error);
    }
}

// Функція для входу в систему
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include' // Включає cookies в запит
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            setAuthenticatedUser(data);
            showSuccessMessage('Вхід успішний!');
            loadExercises(); // Завантаження даних після авторизації
        } else {
            showErrorMessage(data.message || 'Помилка входу');
        }
    } catch (error) {
        showErrorMessage('Помилка зєднання з сервером');
        console.error('Помилка входу:', error);
    }
}

// Функція для реєстрації
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Перевірка співпадіння паролів
    if (password !== confirmPassword) {
        showErrorMessage('Паролі не співпадають');
        return;
    }
    
    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include' // Включає cookies в запит
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            showSuccessMessage('Реєстрація успішна! Ви увійшли в систему.');
            setAuthenticatedUser(data);
            loadExercises(); // Завантаження даних після авторизації
        } else {
            showErrorMessage(data.message || 'Помилка реєстрації');
        }
    } catch (error) {
        showErrorMessage('Помилка зєднання з сервером');
        console.error('Помилка реєстрації:', error);
    }
}

// Функція для виходу з системи
async function handleLogout() {
    try {
        await fetch('/api/users/logout', {
            method: 'POST',
            credentials: 'include' // Включає cookies в запит
        });
        
        // Очищення даних авторизації
        currentUser = null;
        authToken = null;
        
        // Відображення форми авторизації
        authContainer.classList.remove('d-none');
        mainContent.classList.add('d-none');
        
        showSuccessMessage('Вихід успішний');
    } catch (error) {
        console.error('Помилка виходу:', error);
    }
}

// Функція для встановлення авторизованого користувача
function setAuthenticatedUser(userData) {
    currentUser = userData;
    
    // Оновлення інтерфейсу
    currentUsername.textContent = userData.username;
    userRole.textContent = userData.role === 'admin' ? 'Адміністратор' : 'Користувач';
    
    // Відображення елементів для адміністратора
    if (userData.role === 'admin') {
        adminControls.classList.remove('d-none');
        actionsHeader.classList.remove('d-none');
    } else {
        adminControls.classList.add('d-none');
        actionsHeader.classList.add('d-none');
    }
    
    // Приховання форми авторизації та відображення основного контенту
    authContainer.classList.add('d-none');
    mainContent.classList.remove('d-none');
}

// Функція для відображення повідомлення про помилку
function showErrorMessage(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('d-none');
    
    // Приховання повідомлення через 5 секунд
    setTimeout(() => {
        errorMessage.classList.add('d-none');
    }, 5000);
}

// Функція для відображення повідомлення про успіх
function showSuccessMessage(message) {
    successMessage.textContent = message;
    successMessage.classList.remove('d-none');
    
    // Приховання повідомлення через 5 секунд
    setTimeout(() => {
        successMessage.classList.add('d-none');
    }, 5000);
}