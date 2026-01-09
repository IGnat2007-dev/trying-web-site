const express = require('express');
const router = express.Router();
const { getUserState, setUserState } = require('../database');
const config = require('../config');

function getClientIdentifier(req) {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
}

// GET роут: Отдает состояние
router.get('/', async (req, res) => {
    const identifier = getClientIdentifier(req);
    try {
        let userState = await getUserState(identifier);
        if (!userState) {
            userState = { attemptsRemaining: config.MAX_ATTEMPTS, lockedUntil: null, isAuthorized: false };
        }
        // Даже если успех запроса true, мы смотрим на поле isAuthorized
        res.json({ success: true, state: userState });
    } catch (error) {
        res.status(500).json({ success: false, message: "Ошибка сервера" });
    }
});

// POST роут: Проверяет имя
router.post('/', async (req, res) => {
    const { enteredName } = req.body;
    const identifier = getClientIdentifier(req);
    const currentTime = Date.now();

    try {
        let userState = await getUserState(identifier) || { attemptsRemaining: config.MAX_ATTEMPTS, isAuthorized: false };

        if (userState.lockedUntil && currentTime < userState.lockedUntil) {
            return res.status(403).json({ success: false, message: "Заблокировано", state: userState });
        }

        if (enteredName.toLowerCase() === config.SECRET_CREATOR_NAME.toLowerCase()) {
            userState.isAuthorized = true; // ПОЛЬЗОВАТЕЛЬ УГАДАЛ ИМЯ
            userState.attemptsRemaining = config.MAX_ATTEMPTS;
            await setUserState(identifier, userState);
            res.json({ success: true, state: userState });

            localStorage.setItem('userName', identifier);
        } else {
            userState.attemptsRemaining = Math.max(0, userState.attemptsRemaining - 1);
            if (userState.attemptsRemaining === 0) {
                userState.lockedUntil = currentTime + config.LOCK_DURATION_MS;
            }
            await setUserState(identifier, userState);
            res.status(401).json({ success: false, message: "Неверное имя", state: userState });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Ошибка сервера" });
    }
});

module.exports = router;
