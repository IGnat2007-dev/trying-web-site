module.exports = {
    SECRET_CREATOR_NAME: "Iga", // ЗАМЕНИТЕ НА ИСТИНОЕ ИМЯ!
    MAX_ATTEMPTS: 5,
    RESET_INTERVAL_MS: 24 * 60 * 60 * 1000, // 24 часа
    // Если вы хотите блокировать пользователя после исчерпания попыток
    LOCK_DURATION_MS: 24 * 60 * 60 * 1000 // 24 часа блокировки
};
