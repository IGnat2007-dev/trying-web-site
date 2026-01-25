import { games } from "./game-list.js";

let gameHtml=``;

games.forEach((game)=>{
gameHtml+=`
     <div class="game-container"> <!-- Добавил обертку для каждой игры -->
        <div class="game-image-container">
            <img class='game-image' src="${game.image}" alt="${game.name}">
        </div>
        <div class="explanatory-div">
            <h3 class="game-name">${game.name}</h3>
            <p class="game-discription">${game.description}</p>
        </div>
        <button class="game-button"><a href="#" onclick="window.open('/game/index.html','_blank','noopener,noreferrer');return false;">Try </a>Game</button>
    </div>
    `;
});
document.querySelector('.games-grid').innerHTML=gameHtml;

const promoLine = document.getElementById('promoLine');
const pDots = document.querySelectorAll('.p-dot');
const slide= document.querySelector('.promo-widget');
// Получаем все вычисленные стили элемента
const computedStyle = window.getComputedStyle(slide);

let promoIndex = 0; // Номер текущего слайда (0, 1, 2)
const totalSlides = 3;

function getActualWidth(){
    const computedStyle=window.getComputedStyle(slide);
    return parseFloat(computedStyle.width);
};


function movePromo() {
    // 1. Двигаем ленту
    promoIndex++;
    if(promoIndex>=3)promoIndex=0;
    
    const currentWidth=getActualWidth();
    //Сдвигаем картинку на ее размер
    promoLine.style.transform=`translateX(-${promoIndex*currentWidth}px)`;

    //Обновляем точки
    pDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === promoIndex);
    });
}

// Запускаем авто-переключение каждые 3 секунды
let autoSlide = setInterval(movePromo, 3500);

// Если вы меняете размер окна, слайд может "съехать", 
// поэтому на resize лучше тоже обновлять позицию:
window.addEventListener('resize',()=>{
    const currentWidth=getActualWidth();
    promoLine.style.transform=`translateX(-${promoIndex*currentWidth}px)`
});

// Добавим возможность кликать по точкам
pDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        promoIndex = index;
        updateSlider();
        
        // Сбрасываем таймер, чтобы после клика слайд не прыгнул сразу
        clearInterval(autoSlide);
        autoSlide = setInterval(nextSlide, 3000);
    });
});
