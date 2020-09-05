// o usuário só pode seguir para usar a aplicação se estiver autenticado, ou seja, caso tenha um token de autenticação
// essa verificação do token é feita através desse middleware

// todas essas verificações simples são para garantir que o jwt não precise processar dados que não estão válidos (dessa maneira mto menos desempenho é usado do backend)

const jwt = require('jsonwebtoken'); // para verificar o token recebido
const authConfig = require('../../config/auth.json'); // para comparar a hash da API e garantir que é uma requisição segura

module.exports = (req, res, next) => { // além do req e res, tem o next, que só é chamado quando o user pode prosseguir (ou seja, caso esteja autenticado)
  // ######################## INÍCIO DAS VERIFICAÇÕES SIMPLES ################################

  const authHeader = req.headers.authorization; // pega o token passado pelo cabeçalho da requisição

  if(!authHeader){ // se não tiver token
    return res.status(401).send({ error: 'Nenhum token passado' }); // retorna estatus 401 (não autorizado) e msg de erro
  }

  const parts = authHeader.split(' '); // quebra o token em duas partes, separando onde tiver o espaço

  if(!parts.length === 2){ // se as partes não forem iguais a 2
    return res.status(401).send({ error: 'Erro de Token'}); // retorna estatus de não autorizado e msg de erro
  }

  const [ scheme, token ] = parts; // faz a desestruturação do array retornado no split

  if(!/^Bearer$/i.test(scheme)) { // verifica se na const scheme não tem a palavra Bearer
    // se não tiver então:
    return res.status(401).send({ error: 'Token mal formado' })
  }

  // ######################## FIM DAS VERIFICAÇÕES SIMPLES ################################
  // ######################## INÍCIO DAS VERIFICAÇÕES DO JWT (PESADAS) ################################

  jwt.verify(token, authConfig.secret, (err, decoded) => { // jwt verifica o token, utilizando o secret da API
    // e tem um callback que retorna o erro (caso tenha) e/ou o ID do uduário (decoded)
    if (err) { return res.status(401).send({ error: 'Token Inválido'}); } // caso dê algum erro, ele retorna que o token é inválido
    // se não der erro significa que ele encontrou o ID do usuário

    req.userId = decoded.id; // o userId recebe o ID de usuario decodificado
    return next(); // o token é válido e a requisição está apta para prosseguir para usar os recursos da API
  });

};