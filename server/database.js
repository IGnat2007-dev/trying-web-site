const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Инициализация таблицы
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            identifier TEXT PRIMARY KEY,
            attemptsRemaining INTEGER,
            lastAttemptTime INTEGER,
            lockedUntil INTEGER,
            isAuthorized INTEGER DEFAULT 0  -- ДОБАВЛЯЕМ ЭТУ КОЛОНКУ (0 - ложь, 1 - истина)
        )
    `);
});

// Функция получения состояния
function getUserState(identifier) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE identifier = ?", [identifier], (err, row) => {
            if (err) reject(err);
            else {
                if (row) {
                    // Превращаем 0/1 из базы обратно в false/true для JS
                    row.isAuthorized = !!row.isAuthorized;
                }
                resolve(row);
            }
        });
    });
}

// Функция сохранения состояния
function setUserState(identifier, state) {
    return new Promise((resolve, reject) => {
        const { attemptsRemaining, lastAttemptTime, lockedUntil, isAuthorized } = state;
        db.run(
            `INSERT OR REPLACE INTO users (identifier, attemptsRemaining, lastAttemptTime, lockedUntil, isAuthorized) 
             VALUES (?, ?, ?, ?, ?)`,
            [identifier, attemptsRemaining, lastAttemptTime, lockedUntil, isAuthorized ? 1 : 0], // Сохраняем как 1 или 0
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

module.exports = { getUserState, setUserState };
