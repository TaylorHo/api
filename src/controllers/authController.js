const express = require('express');
const bcrypt = require('bcryptjs'); // para tirar o hash da senha
const jwt = require('jsonwebtoken'); // token de autenticação p usuários

// O token de autenticação serve para o usuário ser logado automaticamente, por isso a validade de 1 dia (definida lá em baixo) é necessária (assim ele loga automaticamente até um dia depois de ter acessado a conta)

const authConfig = require('../config/auth'); //secret (hash único da API, para autenticação)

const User = require('../models/User'); // acessando o módulo exportado (que é a estrutura da tabela)

const router = express.Router(); // agora "router" ppode ser usado para definir as rotas de 

function generateTokeen(params = {}){ // função para criar o token com base em algum parâmetro
  return jwt.sign(params, authConfig.secret, { // cria o token de autenticação da API
    expiresIn: 86400, // 86.400 segundos = 1 dia (a hash só é válida por um dia)
  });
}


// ######################## INÍCIO DA SEÇÃO DE REGISTRO DE USUÁRIOS ################################

// req = requisição --- res = resposta
router.post('/register', async (req, res) => { // através do método POST no caminho /register vamos registrar algum usuário
  const { email } = req.body; // cria uma constante com o email recebido (pega apenas o email, nenhum dos outros dados)
  
  try { // tenta criar um noovo usuário ao enviar os dados para esta rota ("tenta" pois se os nados  forem incondizentes com os parâmetros da tabela, não será possível criar)
    if (await User.findOne({ email })) { // se a função encontrar o email (significa que ele já existe)
      return res.status(400).send({ error: 'Usuário já Existente' }); // então executa isso, pra dizer q ele já existe
    }
  
    const user = await User.create(req.body); // cria o usuário com os parâmetros passados pelo POST (ou seja, no "req.body", pq o POST passa os dados no body da requisição)
    // await faz com que para seguir o script, a criação de usuário já tenha sido terminada

    user.password = undefined; // faz com que a senha (mesmo em hash) não seja enviada junto com a resposta do servidor, para aumentar a segurança

    return res.send({ // envia os seguintes dados para o client-side
      user, // dados do usuário
      token: generateTokeen({ id: user.id }), // token de autenticação gerado com base no ID do user
    });
  } catch(err) { // dá um catch no erro, caso aconteça algum
    return res.status(400).send({ error: 'Falha no Registro de Usuário' }); // bota no status 400 (erro na requisição) e mostra a msg de erro
  }
});

// ######################## FIM DA SEÇÃO DE REGISTRO DE USUÁRIOS ################################
// ######################## INÍCIO DA SEÇÃO DE AUTENTICAÇÃO DE USUÁRIOS ################################

router.post('/authenticate', async (req, res) => { // através do método POST no caminho /authenticate vamos autenticar algum usuário
  const { email, password } = req.body; // na requisição de autenticação, a senha e o email são passados pelo body (POST), então jogamos eles em duas constantes (email e password)
  
  const user = await User.findOne({ email }).select('+password'); // a "const user" recebe um usuário que tenha o email especificado na requisição (caso exista)
  // o ".select('+password')" é pra retornar a senha junto nos dados da "const user" (pq na requests normais a senha não é retornada pro lado do cliente)

  if (!user) { // se não tiver retorno do usuário (pq não existe)
    return res.status(400).send({ error: 'Usuário não encontrado' }); // então retorna o estatus http 400 e a mensagem de erro
  }

  if (!await bcrypt.compare(password, user.password)) { // o bcryptjs compara as senhas (a passado no request e a retornada na consulta da "const user")
    // tem que ser assíncrona pq demora pra descriptografas e comparar
    // essa função só acontece se as senhas NÃO COINCIDIREM, por isso o "!" antes
    return res.status(400).send({ error: 'Senha Inválida' }); // retorna o estatus http 400 e a mensagem de erro
  }

  user.password = undefined; // faz com que a senha (mesmo em hash) não seja enviada junto com a resposta do servidor, para aumentar a segurança

  // caso tudo tenha ocorrido bem até aqui (todos os dados válidos) então:
  res.send({ // envia os seguintes dados para o client-side
    user, // dados do usuário
    token: generateTokeen({ id: user.id }), // token de autenticação gerado com base no ID do user
  });
});

// ######################## FIM DA SEÇÃO DE AUTENTICAÇÃO DE USUÁRIOS ################################

module.exports = app => app.use('/auth', router); // define http://localhost:3000/auth como uma rota padrão, assim o registro e a autenticação vão ter /auth como prefixo, ficando assim: http://localhost:3000/auth/(register ou authenticate)