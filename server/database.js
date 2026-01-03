const { createClient } = require('@supabase/supabase-js');

// Настройка клиента Supabase
// На сервере Render мы будем брать эти данные из переменных окружения
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Функция получения состояния
async function getUserState(identifier) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('identifier', identifier)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 значит "запись не найдена"
        console.error("Ошибка Supabase (get):", error);
        return null;
    }
    return data; // Возвращает объект пользователя или null
}

// Функция сохранения состояния
async function setUserState(identifier, state) {
    const { error } = await supabase
        .from('users')
        .upsert({ 
            identifier: identifier,
            attempts_remaining: state.attemptsRemaining,
            last_attempt_time: state.lastAttemptTime,
            locked_until: state.lockedUntil,
            is_authorized: state.isAuthorized
        });

    if (error) {
        console.error("Ошибка Supabase (set):", error);
    }
}

module.exports = { getUserState, setUserState };
