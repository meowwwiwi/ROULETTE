const mongoose = require('mongoose');
//guarda las apuestas dentro de la base de datos
const betSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipoApuesta: {
    type: String,
    required: true
  },
  monto: {
    type: Number,
    required: true
  },
  numeroGanador: Number,
  colorGanador: String,
  resultado: {
    type: String,
    enum: ['ganada', 'perdida'],
    required: true
  },
  variacion: {
    type: Number,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bet', betSchema);
