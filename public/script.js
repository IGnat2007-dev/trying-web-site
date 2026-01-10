// Элементы управления
const gateCard = document.getElementById('step-gate');
const regCard = document.getElementById('step-register');
const secretInput = document.getElementById('secretInput');
const gateError = document.getElementById('gate-error');

// 1. Проверка секретного кода
document.getElementById('btnVerify').addEventListener('click', async () => {
    const secret = secretInput.value.trim();

    try {
        const response = await fetch('/api/verify-creator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret })
        });

        const data = await response.json();

        if (data.success) {
            // Если код верный, переключаем форму
            gateCard.classList.add('hidden');
            regCard.classList.remove('hidden');
        } else {
            gateError.textContent = data.message || "Неверный код доступа";
        }
    } catch (e) {
        gateError.textContent = "Ошибка связи с сервером";
    }
});

// 2. Регистрация
document.getElementById('btnRegister').addEventListener('click', async () => {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const regError = document.getElementById('reg-error');

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Если регистрация успешна, переходим на страницу с контентом
            window.location.href = '/content.html';
        } else {
            regError.textContent = data.error || "Ошибка регистрации";
        }
    } catch (e) {
        regError.textContent = "Ошибка при регистрации";
    }
});