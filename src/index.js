const express = require('express');
const bodyParser = require('body-parser');

const app = express(); // inicia o Express

app.use(bodyParser.json()); // habilita toda a comunicação a usar JSON (requisições e respostas)
app.use(bodyParser.urlencoded({ extended: false })); // converter carácteres especias na string/url

require('./controllers/index')(app); // importamos os controladores a passamos o app, para ele conseguirem criar rotas lá

app.listen(3000); // porta do servidor (http://localhost:3000)
