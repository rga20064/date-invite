// ==== Telegram WebApp ====
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();                    // развернуть на весь экран
  tg.disableVerticalSwipes?.();   // чтобы не закрывалось случайно
  tg.setHeaderColor?.('secondary_bg_color');
  tg.setBackgroundColor?.('#ffe6ee');

  // Имя пользователя из Telegram
  const user = tg.initDataUnsafe?.user;
  if (user?.first_name) {
    document.getElementById('userName').textContent = `, ${user.first_name}`;
  }
}

// Тактильный отклик (вибрация) — работает только в TG
function haptic(type = 'light') {
  tg?.HapticFeedback?.impactOccurred(type);
}
function notify(type = 'success') {
  tg?.HapticFeedback?.notificationOccurred(type);
}

// ==== Плавающие сердечки ====
const heartsBox = document.getElementById('hearts');
const HEARTS = ['💖','💕','💗','❤️','💘','🌸'];
function spawnHeart() {
  const h = document.createElement('div');
  h.className = 'heart';
  h.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
  h.style.left = Math.random() * 100 + 'vw';
  h.style.animationDuration = (6 + Math.random() * 6) + 's';
  h.style.fontSize = (16 + Math.random() * 20) + 'px';
  heartsBox.appendChild(h);
  setTimeout(() => h.remove(), 12000);
}
setInterval(spawnHeart, 450);

// ==== Навигация по экранам ====
const screens = document.querySelectorAll('.screen');
let current = 0;

function goTo(index) {
  screens[current].classList.remove('active');
  screens[index].classList.add('active');
  current = index;
  haptic('light');
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
  'Уверена? 🥺',
  'Кнопка убегает... но я — нет 😌',
  'Ну пожалуйста 🙏',
  'Ты серьёзно?? 💔',
  'Последний шанс! 😳',
  'Ладно, кнопка "Нет" сломалась 😅'
];

function moveNo() {
  noCount++;
  haptic('rigid');

  const x = (Math.random() - 0.5) * 220;
  const y = (Math.random() - 0.5) * 140;
  noBtn.style.transform = `translate(${x}px, ${y}px)`;
  noBtn.style.fontSize = Math.max(0.5, 1 - noCount * 0.1) * 16 + 'px';
  yesBtn.style.transform = `scale(${1 + noCount * 0.08})`;

  hint.textContent = NO_PHRASES[Math.min(noCount - 1, NO_PHRASES.length - 1)];

  if (noCount >= NO_PHRASES.length) {
    noBtn.style.display = 'none';
    hint.textContent = 'Кнопка "Нет" исчезла. Судьба решила за тебя 😉';
  }
}

noBtn.addEventListener('mouseenter', moveNo);
noBtn.addEventListener('click', (e) => { e.preventDefault(); moveNo(); });
noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveNo(); }, { passive: false });

yesBtn.addEventListener('click', () => {
  notify('success');
  goTo(2);
});

// ==== Выбор формата ====
let chosen = null;
document.querySelectorAll('.choice').forEach(btn => {
  btn.addEventListener('click', () => {
    haptic('medium');
    document.querySelectorAll('.choice').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    chosen = btn.dataset.choice;
    setTimeout(() => { buildInvite(chosen); goTo(3); }, 350);
  });
});

// ==== Приглашение ====
const INVITES = {
  coffee:   { emoji: '☕', text: 'Приглашаю тебя на чашку кофе в уютном месте, где никто не будет нас торопить.' },
  walk:     { emoji: '🌆', text: 'Давай встретим закат вместе — просто гулять и говорить обо всём на свете.' },
  cinema:   { emoji: '🎬', text: 'Предлагаю кино: я беру билеты, ты берёшь хорошее настроение.' },
  surprise: { emoji: '🎁', text: 'У меня есть маленький сюрприз — покажу только при личной встрече 😉' }
};

function buildInvite(type) {
  const d = INVITES[type];
  document.getElementById('inviteText').innerHTML =
    `<div style="font-size:30px;margin-bottom:6px;">${d.emoji}</div>${d.text}`;
}

// ==== Подтверждение ====
const sendBtn = document.getElementById('sendBtn');
sendBtn.addEventListener('click', () => {
  const name  = document.getElementById('nameInput').value.trim();
  const date  = document.getElementById('dateInput').value;
  const time  = document.getElementById('timeInput').value;

  if (!name || !date) {
    notify('error');
    tg?.showAlert ? tg.showAlert('Заполни имя и дату, пожалуйста 💕')
                  : alert('Заполни имя и дату, пожалуйста 💕');
    return;
  }

  const payload = { name, date, time, type: chosen };
  const message =
    `💌 Свидание подтверждено!\n\n` +
    `👤 ${name}\n📅 ${date} в ${time}\n🎯 ${INVITES[chosen].emoji} ${INVITES[chosen].text}`;

  notify('success');

  // Отправляем данные боту
  if (tg) {
    try {
      tg.sendData(JSON.stringify(payload));
    } catch (e) {
      tg.showAlert('Приглашение отправлено! 💖');
    }
    // Показываем финальный экран сразу
    document.getElementById('finalText').textContent = message;
    goTo(4);
  } else {
    // Открыто вне Telegram
    document.getElementById('finalText').textContent = message;
    goTo(4);
  }
});

// Кнопка "Назад" в Telegram
if (tg) {
  tg.BackButton.onClick(() => {
    if (current > 0) goTo(current - 1);
    if (current === 0) tg.BackButton.hide();
  });
  // Показываем кнопку "назад" только после первого экрана
  const observer = setInterval(() => {
    current > 0 ? tg.BackButton.show() : tg.BackButton.hide();
  }, 500);
}