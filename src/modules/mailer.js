const path = require('path');
const nodemailer = require('nodemailer'); // para enviar emails com o Node.js
const hbs = require('nodemailer-express/handlebars'); // serve para usar templates de emails
// hbs = HandleBarS

// const mailConfig = require('../config/mail.json'); // essa seria a importação da config de email
const { host, port, user, pass } = require('../config/mail.json'); // e essa é ela, mas retornadno direto só os valores
// desse modo não precisa usar "mailConfig.host", por exemplo, só usar direto o "host", graças à desestruturação

// Essa é a configuração da conta no https://mailtrap.io, que serve para testar emails
const transport = nodemailer.createTransport({
  host,                   // Configurações 
  port,                   // do Mailtrap
  auth: { user, pass },   // da pasta ../config/mail.json
});

transport.use('compile', hbs({ // o email que será enviado vai usar as configurações do handlebars (hbs)
  viewEngine: 'handlebars',
  viewPath: path.resolve('./src/resources/mail'),
  extName: '.html',
}));

module.exports = transport;