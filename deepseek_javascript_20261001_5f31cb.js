// ==== Плавающие сердечки ====
const heartsBox = document.getElementById('hearts');
const HEART_EMOJIS = ['💖','💕','💗','❤️','💘','🌸'];

function spawnHeart() {
  const h = document.createElement('div');
  h.className = 'heart';
  h.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
  h.style.left = Math.random() * 100 + 'vw';
  h.style.animationDuration = (6 + Math.random() * 6) + 's';
  h.style.fontSize = (16 + Math.random() * 20) + 'px';
  heartsBox.appendChild(h);
  setTimeout(() => h.remove(), 12000);
}
setInterval(spawnHeart, 400);

// ==== Навигация по экранам ====
const screens = document.querySelectorAll('.screen');
let current = 0;

function goTo(index) {
  screens[current].classList.remove('active');
  screens[index].classList.add('active');
  current = index;
}

document.querySelectorAll('[data-next]').forEach(btn => {
  btn.addEventListener('click', () => goTo(1));
});

// ==== Убегающая кнопка "Нет" ====
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const hint = document.getElementById('hint');
let noCount = 0;

const NO_PHRASES = [
  'Уверен(а)? 🥺',
  'Кнопка убегает... но я — нет 😌',
  'Ну пожалуйста 🙏',
  'Ты серьёзно?? 💔',
  'Последний шанс! 😳',
  'Ладно, кнопка "Нет" сломалась 😅'
];

function moveNo() {
  noCount++;
  // Убегает
  const x = (Math.random() - 0.5) * 260;
  const y = (Math.random() - 0.5) * 160;
  noBtn.style.transform = `translate(${x}px, ${y}px)`;

  // Уменьшается, а "Да" растёт
  const scale = Math.max(0.5, 1 - noCount * 0.1);
  noBtn.style.fontSize = (16 * scale) + 'px';
  yesBtn.style.transform = `scale(${1 + noCount * 0.08})`;

  hint.textContent = NO_PHRASES[Math.min(noCount - 1, NO_PHRASES.length - 1)];

  if (noCount >= NO_PHRASES.length) {
    noBtn.style.display = 'none';
    hint.textContent = 'Кнопка "Нет" исчезла. Судьба решила за тебя 😉';
  }
}

noBtn.addEventListener('mouseenter', moveNo);
noBtn.addEventListener('click', moveNo);
// На мобильных — touch
noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveNo(); });

yesBtn.addEventListener('click', () => goTo(2));

// ==== Выбор настроения ====
let chosen = null;
document.querySelectorAll('.choice').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.choice').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    chosen = btn.dataset.choice;

    setTimeout(() => {
      buildInvite(chosen);
      goTo(3);
    }, 400);
  });
});

// ==== Финальное приглашение ====
const INVITES = {
  coffee: { emoji: '☕', text: 'Приглашаю тебя на чашку кофе в уютном месте, где никто не будет нас торопить.' },
  walk:  { emoji: '🌆', text: 'Давай встретим закат вместе — просто гулять и говорить обо всём на свете.' },
  cinema:{ emoji: '🎬', text: 'Предлагаю кино: я беру билеты, ты берёшь хорошее настроение.' },
  surprise:{ emoji: '🎁', text: 'У меня есть маленький сюрприз — но покажу его только при личной встрече 😉' }
};

function buildInvite(type) {
  const data = INVITES[type];
  document.getElementById('inviteText').innerHTML =
    `<div style="font-size:32px;margin-bottom:8px;">${data.emoji}</div>${data.text}`;
}

// ==== Подтверждение (для Telegram WebApp или просто alert) ====
document.getElementById('sendBtn').addEventListener('click', () => {
  const name = document.getElementById('nameInput').value.trim();
  const date = document.getElementById('dateInput').value;
  const time = document.getElementById('timeInput').value;

  if (!name || !date) {
    alert('Заполни имя и дату, пожалуйста 💕');
    return;
  }

  const message = `💌 Свидание подтверждено!\n\n👤 ${name}\n📅 ${date} в ${time}\n\nДо встречи ❤️`;

  // Если открыто в Telegram WebApp
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify({ name, date, time }));
    window.Telegram.WebApp.showAlert('Приглашение отправлено! 💖');
  } else {
    // Обычный сайт: показываем финальный экран + можно отправить себе в TG
    document.querySelector('.card').innerHTML = `
      <div class="emoji">💞</div>
      <h1>Жду тебя!</h1>
      <p style="white-space:pre-line;font-size:17px;">${message}</p>
      <a class="btn primary" style="display:inline-block;text-decoration:none;margin-top:10px;"
         href="https://t.me/share/url?url=${encodeURIComponent('Я иду на свидание! 💖')}&text=${encodeURIComponent(message)}"
         target="_blank">Поделиться в Telegram</a>
    `;
  }
});