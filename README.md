<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/74eea0de-a319-43ad-93e5-08fbbc75119e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

**Шаг 1. Подготовка сервера (Ubuntu 22.04 / 24.04 — самый простой вариант)**

# обновляем систему
`sudo apt update && sudo apt upgrade -y`

# ставим нужное
`sudo apt install -y git curl build-essential`

# ставим свежий Node.js (лучше 20 или 22 LTS)
`curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -`
`sudo apt install -y nodejs`

# проверяем
`node -v    # должно быть ~ v22.x`
`npm -v`
**Шаг 2. Клонируем и устанавливаем проект**
`git clone https://github.com/KNikolaich/Ai-Coocker.git`
`cd Ai-Coocker`

# создаём .env.local (обязательно!)
`nano .env.local`
Вставь туда свою ключевую строку:
`GEMINI_API_KEY=ваш_ключ_от_google_gemini_api`
Сохрани (Ctrl+O → Enter → Ctrl+X).
Bash
# устанавливаем зависимости
`npm install --production`    # можно и без --production, но на сервере лучше

# собираем production-сборку
`npm run build`

**Шаг 3. Запускаем и проверяем вручную**
Bash
# способ 1 — просто для теста
`npm run start`
Должно запуститься на порту 302.
Проверь в браузере: http://IP_сервера:302
Если работает → отлично. Ctrl+C для остановки.

**Шаг 4. Делаем автозагрузку (самый надёжный и простой способ — systemd)**
Создаём сервис:
Bashsudo nano /etc/systemd/system/ai-cooker.service
Вставь такой текст (замени пути, если нужно):
ini[Unit]
Description=Ai-Coocker Next.js приложение
After=network.target

[Service]
Type=simple
User=твой_пользователь          # например: ubuntu или твой логин, НЕ root
WorkingDirectory=/home/твой_пользователь/Ai-Coocker
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5

# Очень полезно для Next.js
Environment=NODE_OPTIONS="--max-old-space-size=2048"

[Install]
WantedBy=multi-user.target
Сохрани.
Bash# перечитываем systemd, запускаем, включаем автозагрузку
sudo systemctl daemon-reload
sudo systemctl start ai-cooker
sudo systemctl enable ai-cooker

# смотрим статус
sudo systemctl status ai-cooker

# смотрим логи
journalctl -u ai-cooker -f
Шаг 5. Доступ снаружи (рекомендую)
Варианты:
Вариант А — самый простой (рекомендую для начала)
Установи Nginx как reverse proxy:
Bashsudo apt install -y nginx

sudo nano /etc/nginx/sites-available/ai-cooker
Вставь:
nginxserver {
    listen 80;
    server_name ваш_домен.ru 185.123.45.67;   # или только IP

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
Активируем:
Bashsudo ln -s /etc/nginx/sites-available/ai-cooker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
Теперь сайт доступен по http://ваш_IP или домену.
Вариант Б — сразу HTTPS (через 5 минут)
Установи certbot:
Bashsudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ваш_домен.ru
Альтернативы systemd (если не нравится)

pm2 (очень популярно для node-приложений)

Bashsudo npm install -g pm2
pm2 start npm --name "ai-cooker" -- run start
pm2 save
pm2 startup   # добавит автозагрузку

Docker — если хочешь контейнеризировать (но в репозитории Dockerfile нет, придётся написать простой)

Кратко — что делать прямо сейчас
Bashcd ~
git clone https://github.com/KNikolaich/Ai-Coocker.git
cd Ai-Coocker
nano .env.local   # ← добавь GEMINI_API_KEY
npm install
npm run build
sudo nano /etc/systemd/system/ai-cooker.service   # ← скопируй сервис выше
sudo systemctl daemon-reload
sudo systemctl start ai-cooker
sudo systemctl enable ai-cooker
sudo systemctl status ai-cooker
Если что-то не запускается — смотри логи:
Bashjournalctl -u ai-cooker -e -n 200