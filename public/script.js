async function verifyCode() {
    console.log("Кнопка нажата, функция verifyCode запущена"); // Лог для браузера
    
    const secretInput = document.getElementById('secretInput');
    if (!secretInput) {
        console.error("Поле secretInput не найдено!");
        return;
    }
    
    const secret = secretInput.value;

    try {
        const res = await fetch('/api/verify-creator', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ secret })
        });

        const data = await res.json();
        console.log("Ответ от сервера:", data); // Лог ответа

        if (data.success) {
            document.getElementById('step-gate').classList.add('hidden');
            document.getElementById('step-register').classList.remove('hidden');
        } else {
            document.getElementById('gate-error').innerText = data.message;
        }
    } catch (e) {
        console.error("Ошибка при запросе:", e);
        alert("Произошла ошибка при связи с сервером. Проверьте консоль (F12)");
    }
}

async function register() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    const res = await fetch('/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (data.success) {
        window.location.href = '/content.html';
    } else {
        document.getElementById('reg-error').innerText = data.error;
    }
}

function showLogin() {
    document.getElementById('step-register').classList.add('hidden');
    document.getElementById('step-login').classList.remove('hidden');
}

function showRegister() {
    document.getElementById('step-login').classList.add('hidden');
    document.getElementById('step-register').classList.remove('hidden');
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
        window.location.href = '/content.html';
    } else {
        document.getElementById('login-error').innerText = data.error;
    }
}