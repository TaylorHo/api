const express = require('express');
const bcrypt = require('bcryptjs'); // para tirar o hash da senha
const jwt = require('jsonwebtoken'); // token de autenticação p usuários
const crypto = require('crypto'); // gerador de tokens nativo do node.js
const mailer = require('../../modules/mailer');

// O token de autenticação serve para o usuário ser logado automaticamente, por isso a validade de 1 dia (definida lá em baixo) é necessária (assim ele loga automaticamente até um dia depois de ter acessado a conta)

const authConfig = require('../../config/auth.json'); //secret (hash único da API, para autenticação)

const User = require('../models/User'); // acessando o módulo exportado (que é a estrutura da tabela)

const router = express.Router(); // agora "router" pode ser usado para definir as rotas (ex: linha 23)

function generateTokeen(params = {}){ // função para criar o token com base em algum parâmetro
  return jwt.sign(params, authConfig.secret, { // cria o token de autenticação da API
    expiresIn: 86400, // 86.400 segundos = 1 dia (a hash só é válida por um dia)
  });
}


// ######################## INÍCIO DA SEÇÃO DE REGISTRO DE USUÁRIOS ################################

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
// ############### INÍCIO DA SEÇÃO DE ENVIO DE EMAIL DE RECUPERAÇÃO DE SENHAS ################################

router.post('/forgot_password', async (req, res) => { // através do método POST no caminho /forgot_password vamos solicitar uma recuperação de senha
  const { email } = req.body; // desestrutura e pega apenas o email do corpo da requisição

  try {
    const user = await User.findOne({ email }); // tenta encontrar um usuário com o email da requisição

    if (!user) { // se não tiver retorno do usuário (pq não existe)
      return res.status(400).send({ error: 'Usuário não encontrado' }); // então retorna o estatus http 400 e a mensagem de erro
    }

    const token = crypto.randomBytes(20).toString('hex'); // gera token aleatório de 20 caracteres e transforma em uma string hexadecimal

    const now = new Date(); // pega a data atual e joga em na const now
    now.setHours(now.getHours() + 1); // a now recebe mais uma hora (para ser usada como data de expiração)

    await User.findByIdAndUpdate(user.id, { // procura o user do ID especificado na requisição e altera ele
      '$set': { // define alguma alteração nos dados do Banco
        passwordResetToken: token, // salva o token no banco
        passwordResetExpires: now, // salva a data de expiração no banco
      }
    });

    mailer.sendMail({ // o nodemailer envia um email como definido abaixo
      to: email, // recebido na request
      from: 'taylor@indecisos.space', // quem envia
      template: 'auth/forgot_password', // não precisa ser o caminho todo pq isso já está definido no modules/mailer
      context: { token }, // é passada a variável q é utilizada no template
    }, (err) => { // callback de erro
      if (err) {
        return res.status(400).send({ error: 'Não foi possível enviar o email de recuperação de senha' }); // erro
      }

      return res.send();
    });

  } catch (err) {
    res.status(400).send({ error: 'Erro na parte de "Esqueci Minha Senha", por favor tente novamente' }); // avisa se ocorrer algum erro
  }

});

// ############### FIM DA SEÇÃO DE ENVIO DE EMAIL DE RECUPERAÇÃO DE SENHAS ################################
// ################## INÍCIO DA SEÇÃO DE ENVIO DE REDEFINIÇÃO DE SENHAS ################################

router.post('/reset_password', async (req, res) => { // através do método POST no caminho /reset_password vamos resetar a senha
  const { email, token, password } = req.body; // parâmetros passados na requisição

  try {
    const user = await User.findOne({ email })
      .select('+passwordResetToken passwordResetExpires'); // seleciona os dados do usuário + os dados que não são selecionados por padrão
    
    if (!user) { // se não tiver retorno do usuário (pq não existe)
      return res.status(400).send({ error: 'Usuário não encontrado' }); // então retorna o estatus http 400 e a mensagem de erro
    }

    if (token !== user.passwordResetToken) { // se o token da requisição e o do Banco de Dados não forem iguais então:
      return res.status(400).send({ error: 'Token Inválido' }); // msg de erro
    }

    const now = new Date(); // pega a data atual

    if (now > user.passwordResetExpires) { // se a data atual foi maior que a data de validade do token então:
      return res.status(400).send({ error: 'Token Expirado' }); // msg de erro
    }

    // se tudo ocorreu bem até aqui, então ele finalmente atualiza a senha
    user.password = password; // a senha do user é atualizada 

    await user.save(); // as alterações do MongoDB são salvas

    res.send(); // tudo OK
  } catch (err) { // dá um catch no erro
    return res.status(400).send({ error: 'Não foi possível reiniciar a senha, tente novamente' }); // erro
  }
});

// ################## INÍCIO DA SEÇÃO DE ENVIO DE REDEFINIÇÃO DE SENHAS ################################

module.exports = app => app.use('/auth', router); // define http://localhost:3000/auth como uma rota padrão, assim o registro e a autenticação vão ter /auth como prefixo, ficando assim: http://localhost:3000/auth/(register ou authenticate)