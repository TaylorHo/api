const express = require('express');
const authMiddleware = require('../middlewares/auth'); // importa o middleware (que verifica se tem um token de auth válido)

const router = express.Router(); // router agora pode ser usado para definir rotas e metodos de conversação

router.use(authMiddleware); // para fazer a verificação

router.get('/', (req, res) => { // o router escuta na raíz do caminho definido lá no fim do arquivo (localhost:3000/projects)
  res.send({ ok: true });
});

module.exports = app => app.use('/projects', router); // ele exporta pro index.js do projeto, onde o app usa esse módulo e cria uma rota /projects, que vai acompahar as requests do router definido nesse arquivo aqui