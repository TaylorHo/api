const mongoose = require('../database');
const bcrypt = require('bcryptjs'); // para encriptar a senha

// o "new mongoose.Schema" gera uma nova tabela como definida nos parâmetros
const UserSchema = new mongoose.Schema({
  name: {
    type: String, // texto
    required: true, // obrigatório
  },
  email: {
    type: String, // texto
    required: true, // obrigatório
    unique: true, // não pode ser repetido
    lowercase: true, // transforma tudo em caixa baixa
  },
  password: {
    type: String, // texto
    required: true, // obrigatório
    select: false, // impede que a senha seja enviada para o client-side no array de usuários
  },
  createdAt: {
    type: Date, // data
    default: Date.now, // data e hora atual
  },
});

UserSchema.pre('save', async function(next){ // antes de salvar os dados, ele chama a função
  const hash = await bcrypt.hash(this.password, 10); // encripta a senha 10x
  this.password = hash; // a senha recebe a senha encriptada

  next(); // executa/termina a função
});

const User = mongoose.model('User', UserSchema); // User recebe a criação da tabela como definida anteriormente

module.exports = User;