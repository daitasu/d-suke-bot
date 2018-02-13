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
    if (!bot.verify(req.rawBody, req.get('X-Line-Signature'))) {
        return res.sendStatus(400);
    }
    bot.parse(req.body);
    res.set('Content-Type', 'text/plain');
    res.status(200).end();
});

// 友達追加
bot.on('follow', (event) => {
    console.log('follow event');
});

// ブロック
bot.on('unfollow', (event) => {
    console.log('unfollow event');
});

bot.on('message', async (event) => {
    console.log('message event');

    if(event.message.type !== 'text') {
        return;
    }
    let replyMessage;
    if(event.message.text.indexOf('Dランド') !== -1) {
        replyMessage = await getWaitingTime("land");
    }else if(event.message.text.indexOf('Dシー') !== -1){
        replyMessage = await getWaitingTime("sea");
    }else {
        replyMessage = "待ち時間を取得するには、メニューからボタンをお選び下さい。";
    }
    event.reply(replyMessage);
});

async function getWaitingTime(name) {
    const cheerioObject= await cheerio.fetch('http://tokyodisneyresort.info/smartPhone/realtime.php', {park: name, order: "wait"});
    let replyMessage = "";
    let lists = cheerioObject.$('li').text();

    lists = lists.trim().replace(/\t/g, "").replace(/\n+/g, ",").split(",");
    lists.forEach((list) => {
        if (list.indexOf("更新") !== -1){
            replyMessage += list;
        } else if (/FP|中|分|情報なし|案内/.test(list)){
            replyMessage += "\n" + list;
        } else {
            replyMessage += "\n\n" + list;
        }
    });
    return replyMessage;
}

module.exports = router;
