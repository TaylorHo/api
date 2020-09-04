const express = require('express');
const bodyParser = require('body-parser');

const app = express(); // inicia o Express

app.use(bodyParser.json()); // habilita toda a comunicação a usar JSON (requisições e respostas)
app.use(bodyParser.urlencoded({ extended: false })); // converter carácteres especias na string/url

require('./controllers/authController')(app); // importamos o controlador de autenticação e repassamos a possibilidade de criar rotas lá no arquivo dele
require('./controllers/projectController')(app); // importamos o controlador do projeto e repassamos a possibilidade de criar rotas lá no arquivo dele

app.listen(3000); // porta do servidor (http://localhost:3000)
