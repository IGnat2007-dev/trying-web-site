require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { createClient } = require('@supabase/supabase-js');
const compression=require ('compression')

const app = express();
app.use(compression())
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// --- 1. ЗАГОЛОВКИ БЕЗОПАСНОСТИ ДЛЯ ИГРЫ (LÖVE.js) ---
app.use((req, res, next) => {
    // Разрешаем многопоточность для SharedArrayBuffer (чтобы игра не выдавала ошибку)
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    
    // Если была ошибка CSP "default-src none", добавим базовый CSP:
    res.setHeader("Content-Security-Policy", 
    "default-src 'self' https://*.supabase.co; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://translate.google.com https://www.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://www.gstatic.com https://fonts.googleapis.com; " +
    "img-src 'self' data: https://www.gstatic.com; " +
    "connect-src 'self' https://*.supabase.co;"
);
    next();
});

app.use(express.json());
app.use(cookieParser());

// Статику лучше объявлять ДО кастомных маршрутов
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    const token = req.cookies['sb-access-token'];
    if (token) {
        // Если кука есть, сразу отправляем на контент
        return res.redirect('/pages/home-page/home.html');
    }
    // Если куки нет, отдаем обычный index.html
    res.sendFile(path.join(__dirname, 'public/pages/register-page/index.html'));
});

// 1. Проверка секретного кода
app.post('/api/verify-creator', (req, res) => { 
    const { secret } = req.body;
    console.log("Получен запрос на проверку кода:", secret); // Лог для отладки
    
    if (secret === process.env.SECRET_CODE) {
        console.log("Код верный!");
        res.json({ success: true });
    } else {
        console.log("Код неверный!");
        res.status(403).json({ success: false, message: "Неверный код доступа" });
    }
});

// 2. Регистрация
app.post('/api/register', async (req, res) => {
    const { email, password, username } = req.body;

    console.log("Попытка регистрации:", email, username);

    // 1. Регистрация в Auth. 
    // Мы передаем username в options.data, чтобы триггер в базе его подхватил!
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: username // Эти данные попадут в raw_user_meta_data
            }
        }
    });

    if (authError) {
        console.error("ОШИБКА AUTH:", authError.message);
        return res.status(400).json({ success: false, error: authError.message });
    }

    // ТЕПЕРЬ НЕ НУЖНО делать supabase.from('profiles').insert(...)
    // Триггер в базе данных уже всё сделал сам!

    if (authData.session) {
        res.cookie('sb-access-token', authData.session.access_token, {
            httpOnly: false,
            maxAge: 86400 * 1000
        });
    }
    res.json({ success: true });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return res.status(400).json({ success: false, error: error.message });
    }

    if (data.session) {
        res.cookie('sb-access-token', data.session.access_token, {
            httpOnly: false,
            maxAge: 86400 * 1000
        });
    }

    res.json({ success: true });
});

// Защита страницы контента
const protectRoute = (req, res, next) => {
    const token = req.cookies['sb-access-token'];
    if (!token && req.path === 'pages/home-page/home.html') {
        return res.redirect('/');
    }
    next();
};

app.get('/pages/home-page/home.html', protectRoute, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/home-page/home.html'));
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Сервер запущен: http://localhost:${process.env.PORT || 3000}`);
});
