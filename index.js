'use strict';

var express = require('express');
var request = require('superagent');
var bodyParser = require('body-parser');

var PAGE_ACCESS_TOKEN = 'EAAdeUR4JB0cBANKjyTCdfPU9W36sXvqOyxfpRDD18JtWqMsEVNgZA0PfB7QlW5Xm5IWOLNjwsCa8o2UXDlHC8bGu5s8lCRQoADDYga7FHO4cp9ezrpTH52YcZCzQAtaT7Yj0xQkmP8fAaa1CMf74XMqon1LSb1wszmJgcg1FauzvE1bj6sJTgsMhYkvSgZD';
const VERIFY_TOKEN = 'CALC++';

var app = express();
var port = process.env.PORT || 5000;

app.use(bodyParser.json());

app.listen(port, function() {
  console.log('Сервер запущен на порту: ', port);
});

app.get('/webhook', (req, res) => {
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook верифицирован');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.post('/webhook', function(req, res) {
    var messagingEvents = req.body.entry[0].messaging;
    messagingEvents.forEach(function(event) {
        var sender = event.sender.id;
        if (event.message && event.message.text) {
            var text = event.message.text.trim().substring(0, 200);
            sendTextMessage(sender, 'Результат: ' + calculate(text));
        }
    });
    res.sendStatus(200);
});

function calculate (expression) {
  let result
  if (expression.indexOf('+') + 1) {
    let numb = expression.split('+');
    result = +numb[0] + +numb[1];
  }
  if (expression.indexOf('-') + 1) {
    let numb = expression.split('-');
    result = +numb[0] - +numb[1];
  }
  if (expression.indexOf('*') + 1) {
    let numb = expression.split('*');
    result = +numb[0] * +numb[1];
  }
  if (expression.indexOf('/') + 1) {
    let numb = expression.split('/');
    result = +numb[0] / +numb[1];
  }
  return result;
}

function sendMessage (sender, message) {
    request
        .post('https://graph.facebook.com/v2.6/me/messages')
        .query({access_token: PAGE_ACCESS_TOKEN})
        .send({
            recipient: {
                id: sender
            },
            message: message
        })
        .end(function (err, res) {
            if (err) {
                console.log('Ошибка отправки сообщения: ', err);
            } else if (res.body.error) {
                console.log('Ошибка: ', res.body.error);
            }
        });
}

function sendTextMessage (sender, text) {
    sendMessage(sender, {
        text: text
    });
}
