const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipo: {
    type: String,
    enum: ['deposito', 'retiro', 'apuesta', 'ganancia'],
    required: true
  },
  monto: {
    type: Number,
    required: true
  },
  descripcion: String,
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
