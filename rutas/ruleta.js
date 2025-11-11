const express = require('express');
const Bet = require('../models/Bet');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const router = express.Router();

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/iniciosesion');
  }
  next();
};

router.get('/', requireAuth, async (req, res) => {
  try {
    const ultimasApuestas = await Bet.find({ 
      usuario: req.session.user.id 
    }).sort({ fecha: -1 }).limit(5);
    
    const ultimosNumeros = [
      { numero: 32, color: 'rojo' },
      { numero: 15, color: 'negro' },
      { numero: 0, color: 'verde' },
      { numero: 19, color: 'rojo' },
      { numero: 4, color: 'negro' }
    ];
    
    res.render('ruleta', {
      user: req.session.user,
      ultimasApuestas,
      ultimosNumeros
    });
  } catch (error) {
    res.redirect('/perfil');
  }
});

router.post('/girar', requireAuth, async (req, res) => {
  try {
    const { tipoApuesta, monto, seleccion } = req.body;
    const userId = req.session.user.id;
    
    const user = await User.findById(userId);
    if (user.saldo < monto) {
      return res.json({ success: false, error: 'Saldo insuficiente' });
    }
    
    const numeroGanador = Math.floor(Math.random() * 37);
    let colorGanador = 'verde';
    if (numeroGanador !== 0) {
      colorGanador = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
        .includes(numeroGanador) ? 'rojo' : 'negro';
    }
    
    let resultado = 'perdida';
    let variacion = -monto;
    
    if (tipoApuesta === 'color' && seleccion === colorGanador) {
      resultado = 'ganada';
      variacion = monto;
    } else if (tipoApuesta === 'numero' && parseInt(seleccion) === numeroGanador) {
      resultado = 'ganada';
      variacion = monto * 35;
    }
    
    user.saldo += variacion;
    await user.save();
    
    const bet = new Bet({
      usuario: userId,
      tipoApuesta,
      monto,
      numeroGanador,
      colorGanador,
      resultado,
      variacion
    });
    await bet.save();
    
    const transaction = new Transaction({
      usuario: userId,
      tipo: resultado === 'ganada' ? 'ganancia' : 'apuesta',
      monto: Math.abs(variacion),
      descripcion: `${tipoApuesta} - ${resultado}`
    });
    await transaction.save();
    
    req.session.user.saldo = user.saldo;
    
    res.json({
      success: true,
      numeroGanador,
      colorGanador,
      resultado,
      variacion,
      nuevoSaldo: user.saldo
    });
    
  } catch (error) {
    res.json({ success: false, error: 'Error en la apuesta' });
  }
});

module.exports = router;
