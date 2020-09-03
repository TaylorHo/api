const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/noderest', { useMongoClient: true }); // caminho do banco de dados (local, nesse caso)
mongoose.Promise = global.Promise; // tem que ter essa parte, mas não precisa entender?

module.exports = mongoose;