// test-bot.js
const BOT_TOKEN = '8529224867:AAF7SknbqCOJX1ckpyJZ_I4HokltdR_96aw';
const WEBAPP_URL = 'https://tudasuda-kembot-mk7o3joaj-tokagazs-projects.vercel.app/';

// Получи свой chat_id, отправив /start боту и посмотрев в getUpdates
const CHAT_ID = 'ВАШ_CHAT_ID';

async function sendWebAppButton() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  const data = {
    chat_id: CHAT_ID,
    text: '🎮 Нажми на кнопку ниже, чтобы запустить игру:',
    reply_markup: {
      inline_keyboard: [[
        {
          text: '🚀 Открыть игру',
          web_app: { url: WEBAPP_URL }
        }
      ]]
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  console.log('Result:', result);
}

sendWebAppButton();