require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.json());
app.use(cookieParser()); // Позволяет серверу читать куки
app.use(express.static(path.join(__dirname, 'public')));

// --- MIDDLEWARE ДЛЯ ЗАЩИТЫ СТРАНИЦ ---
const protectRoute = (req, res, next) => {
    const token = req.cookies['sb-access-token'];
    
    if (!token) {
        // Если токена нет, а пользователь хочет на content.html — выкидываем на главную
        if (req.path === '/content.html') {
            return res.redirect('/');
        }
    }
    next();
};

// --- РОУТЫ ---

// 1. Проверка секретного кода (до регистрации)
app.post('/api/verify-creator', (req, res) => {
    const { secret } = req.body;
    const CORRECT_CODE = process.env.SECRET_CODE || "12345"; // Сверям с .env

    if (secret === CORRECT_CODE) {
        res.json({ success: true });
    } else {
        res.status(403).json({ success: false, message: "Код неверный. Доступ запрещен." });
    }
});

// 2. Регистрация в Supabase
app.post('/api/register', async (req, res) => {
    const { email, password, username } = req.body;

    // 1. Регистрируем пользователя в Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        return res.status(400).json({ success: false, error: authError.message });
    }

    if (authData.user) {
        // 2. Если Auth прошел успешно, записываем логин в таблицу profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                { 
                    id: authData.user.id, 
                    username: username, 
                    email: email 
                }
            ]);

        if (profileError) {
            // Если логин уже занят, профиль не создастся (сработает unique в БД)
            return res.status(400).json({ 
                success: false, 
                error: "Этот логин уже занят другим пользователем." 
            });
        }

        // 3. Ставим куку сессии
        if (authData.session) {
            res.cookie('sb-access-token', authData.session.access_token, {
                httpOnly: false,
                maxAge: 86400 * 1000
            });
        }
    }

    res.json({ success: true });
});

// Применяем защиту к странице контента
app.get('/content.html', protectRoute, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/content.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
