require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./server/config');

const app = express();
const port = process.env.PORT || 3000;

// Подключение маршрутов
const indexRouter = require('./server/routes/index');
const checkNameRouter = require('./server/routes/checkName');

// Middleware
app.use(cors()); 
app.use(express.json()); // Встроено в экспресс, body-parser не нужен
app.use(express.static(path.join(__dirname, 'public'))); 

// Роуты
app.use('/', indexRouter); 
app.use('/api/check-name', checkNameRouter); 

// Запускаем сервер
app.listen(port, () => {
    // ОБЯЗАТЕЛЬНО обратные кавычки для ${}
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Имя создателя: "${config.SECRET_CREATOR_NAME}"`);
});
