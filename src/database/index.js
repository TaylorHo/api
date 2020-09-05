const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/noderest', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }); // caminho do banco de dados (local, nesse caso) + parâmetros de conexão
mongoose.Promise = global.Promise; // tem que ter essa parte, mas não precisa entender?

module.exports = mongoose;