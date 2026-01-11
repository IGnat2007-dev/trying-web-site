require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    const token = req.cookies['sb-access-token'];
    if (token) {
        // Если кука есть, сразу отправляем на контент
        return res.redirect('/content.html');
    }
    // Если куки нет, отдаем обычный index.html
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

// Защита страницы контента
const protectRoute = (req, res, next) => {
    const token = req.cookies['sb-access-token'];
    if (!token && req.path === '/content.html') {
        return res.redirect('/');
    }
    next();
};

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


app.get('/content.html', protectRoute, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/content.html'));
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Сервер запущен: http://localhost:${process.env.PORT || 3000}`);
});
