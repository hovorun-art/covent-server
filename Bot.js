const TelegramBot = require('node-telegram-bot-api')

const Bot = (options) => {
    const {
        token
    } = options;

    const bot = new TelegramBot(token, { polling: true });

    bot.onText(/\/start/, async (msg) => {
        const { chat, from } = msg;
        const { type, id: chatId } = chat;
        const { id: fromId } = from;

        if (type !== 'private') {
            return;
        }

        bot.sendMessage(chatId, "Ваш идентификатор " + fromId);
    });

    const sendMessage = (chatId, message) => {
        bot.sendMessage(chatId, message)
    }

    return {
        sendMessage
    }
}

module.exports = { Bot }