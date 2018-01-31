const linebot = require('linebot');
const router = express.Router();

const bot = linebot({
    channelId: process.env.LINE_CHANNEL_ID,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
});

router.post('/', parser, (req, res, next) => {
    if (req.body.events === '') {
        return;
    }
    if (!bot.verify(req.rawBody, req.get('X-Line-Signature'))) {
        return res.sendStatus(400);
    }
    bot.parse(req.body);
    res.set('Content-Type', 'text/plain');
    res.status(200).end();
});

// 友達追加
bot.on('follow', (event) => {
    console.log('follow success!');
});

// ブロック
bot.on('unfollow', (event) => {
    console.log('unfollow success');
});

bot.on('message', (event) => {
    console.log('message event');
    event.reply(event.message.text);
});
