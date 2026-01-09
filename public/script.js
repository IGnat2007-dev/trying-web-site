
document.addEventListener('DOMContentLoaded', () => {
    // --- Настройки ---
    // CORRECT_CREATOR_NAME теперь на сервере
    const API_URL = '/api/check-name'; // URL для POST запроса на сервер

    // --- Элементы DOM ---
    const namePromptOverlay = document.getElementById('namePromptOverlay');
    const attemptsLeftSpan = document.getElementById('attemptsLeft');
    const creatorNameInput = document.getElementById('creatorNameInput');
    const submitNameBtn = document.getElementById('submitNameBtn');
    const errorMessage = document.getElementById('errorMessage');
    const siteContent = document.getElementById('siteContent');

    // --- Функции ---

    function displayError(message) {
        errorMessage.textContent = message || '';
    }

    // Функция для обновления UI в зависимости от состояния, полученного с сервера
    function updateUI(state) {
        attemptsLeftSpan.textContent = state.attemptsRemaining;
        displayError(''); // Сбрасываем ошибку при каждом обновлении UI

        if (state.lockedUntil && Date.now() < state.lockedUntil) {
            // Если есть блокировка и она еще действует
            const remainingMs = state.lockedUntil - Date.now();
            const hours = Math.floor(remainingMs / (60 * 60 * 1000));
            const mins = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
            displayError(`Доступ заблокирован. Попробуйте через ${hours} ч ${mins}.`);
            creatorNameInput.disabled = true;
            submitNameBtn.disabled = true;
        } else {
            // Блокировки нет или она истекла
            creatorNameInput.disabled = false;
            submitNameBtn.disabled = false;
            if (state.attemptsRemaining === 0 && state.lockedUntil === null) {
                // Если попытки кончились, но блокировка еще не установлена (на клиенте такое не увидим, но на сервере может быть)
                // Или если сервер прислал attemptsRemaining=0 без lockUntil
                displayError("У вас закончились попытки.");
                creatorNameInput.disabled = true;
                submitNameBtn.disabled = true;
            } else {
                // Попытки есть или мы только что угадали
                attemptsLeftSpan.textContent = state.attemptsRemaining; // Обновим, если были попытки
            }
        }
    }

    // Функция для отображения сайта
    function revealSite() {
        namePromptOverlay.classList.add('hidden');
        siteContent.classList.remove('hidden');
    }

    // Функция для отправки запроса на сервер и обработки ответа
    async function checkName() {
        const enteredName = creatorNameInput.value.trim();

        const savedName = localStorage.getItem('userName');

    if (savedName) {
        // Если имя нашли, сразу подставляем его в поле и пишем приветствие
        input.value = savedName;
        statusText.innerText = `С возвращением, ${savedName}!`;
        // Здесь можно автоматически вызвать функцию проверки, если нужно
        revealSite()
    }

        // Проверяем, если кнопка заблокирована
        if (submitNameBtn.disabled) {
            return;
        }

        displayError(''); // Очищаем предыдущую ошибку

        if (!enteredName) {
            displayError("Пожалуйста, введите имя.");
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ enteredName: enteredName }),
            });

            const data = await response.json(); // Парсим JSON из ответа сервера

            if (response.ok && data.success) {
                // Успех!
                revealSite();
                // Можно обновить UI, но в случае успеха он все равно скрывается
                // updateUI(data.state); // Если нужно показать, например, что попытки сброшены
            } else {
                // Ошибка или неверное имя
                displayError(data.message);
                if (data.state) {
                    updateUI(data.state); // Обновляем UI (количество попыток, блокировку)
                }
            }
        } catch (error) {
            console.error("Ошибка при отправке запроса:", error);
            displayError("Произошла ошибка при проверке имени. Попробуйте позже.");
            // Можно также установить блокировку на всякий случай
            submitNameBtn.disabled = true;
            creatorNameInput.disabled = true;
        }
    }

    // --- Инициализация ---
        async function initPage() {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();

            if (response.ok && data.success) {
                // ПРОВЕРЯЕМ: если в состоянии из базы стоит флаг "авторизован"
                if (data.state && data.state.isAuthorized) {
                    revealSite(); // Только тогда показываем сайт
                } else {
                    updateUI(data.state); // Иначе просто обновляем счетчик попыток
                }
            } else if (data.state) {
                updateUI(data.state);
            }
        } catch (error) {
            console.error("Ошибка при инициализации:", error);
            displayError("Ошибка загрузки состояния.");
        }
    }

    initPage(); // Запускаем инициализацию при загрузке страницы

    submitNameBtn.addEventListener('click', checkName);
    creatorNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            checkName();
        }
    });
});