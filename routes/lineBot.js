const express = require('express');
const linebot = require('linebot');
const router = express.Router();
const bodyParser = require('body-parser');
const cheerio = require('cheerio-httpcli');


const bot = linebot({
    channelId: process.env.LINE_CHANNEL_ID,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
});

const parser = bodyParser.json({
    verify: (req, res, buf, encoding) => {
        req.rawBody = buf.toString(encoding);
    }
});

router.post('/', parser, (req, res, next) => {
    if (req.body.events === '') {
        return;
    }
    console.log('before verify');
    if (!bot.verify(req.rawBody, req.get('X-Line-Signature'))) {
        return res.sendStatus(400);
    }
    console.log('try');
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
    cheerio.fetch('https://disneyreal.asumirai.info/realtime/disneysea-wait-today-wa.html', {}, function (err, $, res) {
        // レスポンスヘッダを参照
        // console.log(res.headers);

        // HTMLタイトルを表示
        console.log($('title').text());

        $('ui.wait-time li').each((test) =>{
            console.log('test ->', test);
        });

    });

    event.reply(event.message.text);
});

module.exports = router;
