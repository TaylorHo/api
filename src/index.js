const express = require('express');
const bodyParser = require('body-parser');

const app = express(); // inicia o Express

app.use(bodyParser.json()); // forçar todos os dados como JSON
app.use(bodyParser.urlencoded({ extended: false })); // converter carácteres especias na string/url

require('./controllers/authController')(app); // importamos o controlador de autenticação e repassamos a possibilidade de criar rotas lá no arquivo dele

app.listen(3000); // porta do servidor (http://localhost:3000)
