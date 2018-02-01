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

bot.on('message', async (event) => {
    console.log('message event');
    let replyMessage;

    if(event.message.text.indexOf('>Dランド')) {
        replyMessage = await getWaitingTime("land");
    }else if(event.message.text.indexOf('>Dシー')){
        replyMessage = await getWaitingTime("sea");
    }else {
        replyMessage = "待ち時間を取得するには、メニューからボタンをお選び下さい。";
    }
    console.log('return ->', replyMessage);
    event.reply(replyMessage);
});

async function getWaitingTime(name) {
    const cheerioObject= await cheerio.fetch('http://tokyodisneyresort.info/smartPhone/realtime.php', {park: name, order: "wait"});
    let replyMessage = "";
    let lists = cheerioObject.$('li').text();

    lists = lists.trim().replace(/\t/g, "").replace(/\n+/g, ",").split(",");
    lists.forEach((list) => {
        if (list.indexOf("FP") !== -1) {
            replyMessage += list;
        }else {
            replyMessage += "\n" + list;
        }
    });
    return replyMessage;


    // cheerio.fetch('http://tokyodisneyresort.info/smartPhone/realtime.php', {park: "land", order: "wait"})
    //     .then((result) => {
    //         let replyMessage = "";
    //         let lists = result.$('li').text();
    //
    //         lists = lists.trim().replace(/\t/g, "").replace(/\n+/g, ",").split(",");
    //         lists.forEach((list) => {
    //             if (list.indexOf("FP") !== -1) {
    //                 replyMessage += list;
    //             }else {
    //                 replyMessage += "\n" + list;
    //             }
    //         });
    //         console.log(replyMessage);
    //         return replyMessage;
    //
    //     }).catch((err) => {
    //     console.log("error ->");
    //     console.log(err);
    // });

}

module.exports = router;
