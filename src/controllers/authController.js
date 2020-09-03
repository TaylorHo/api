const express = require('express');

const User = require('../models/User'); // acessando o módulo exportado (que é a estrutura da tabela)

const router = express.Router(); // agora "router" ppode ser usado para definir as rotas de usuário

// req = requisição         res = resposta
router.post('/register', async (req, res) => { // através do método POST no caminho http://localhost:3000/register vamos registrar algum usuário
  try { // tenta criar um noovo usuário ao enviar os dados para esta rota ("tenta" pois se os nados  forem incondizentes com os parâmetros da tabela, não será possível criar)
    const user = await User.create(req.body); // cria o usuário com os parâmetros passados pelo POST (ou seja, no "req.body", pq o POST passa os dados no body da requisição)
    // await faz com que para seguir o script, a criação de usuário já tenha sido terminada

    return res.send({ user }); // é retornado pro front-end os dados do usuário criado
  } catch(err) { // dá um catch no erro, caso aconteça algum
    return res.status(400).send({ error: 'Falha no Registro de Usuário' }); // bota no status 400 (erro na requisição) e mostra a msg de erro
  }
});

module.exports = app => app.use('/auth', router); // define http://localhost:3000/auth como uma rota padrão, assim o registro vai tter /auth como prefixo, ficando assim: http://localhost:3000/auth/register