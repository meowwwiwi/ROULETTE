const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const router = express.Router();

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/iniciosesion');
  }
  next();
};

router.get('/', requireAuth, (req, res) => {
  res.render('deposito', { user: req.session.user });
});

router.post('/depositar', requireAuth, async (req, res) => {
  try {
    const { monto } = req.body;
    const userId = req.session.user.id;
    
    const user = await User.findById(userId);
    user.saldo += parseFloat(monto);
    await user.save();
    
    const transaction = new Transaction({
      usuario: userId,
      tipo: 'deposito',
      monto: parseFloat(monto),
      descripcion: 'Depósito de saldo'
    });
    await transaction.save();
    
    req.session.user.saldo = user.saldo;
    
    res.json({ success: true, nuevoSaldo: user.saldo });
  } catch (error) {
    res.json({ success: false, error: 'Error en el depósito' });
  }
});

router.post('/retirar', requireAuth, async (req, res) => {
  try {
    const { monto } = req.body;
    const userId = req.session.user.id;
    
    const user = await User.findById(userId);
    if (user.saldo < monto) {
      return res.json({ success: false, error: 'Saldo insuficiente' });
    }
    
    user.saldo -= parseFloat(monto);
    await user.save();
    
    const transaction = new Transaction({
      usuario: userId,
      tipo: 'retiro',
      monto: parseFloat(monto),
      descripcion: 'Retiro de saldo'
    });
    await transaction.save();
    
    req.session.user.saldo = user.saldo;
    
    res.json({ success: true, nuevoSaldo: user.saldo });
  } catch (error) {
    res.json({ success: false, error: 'Error en el retiro' });
  }
});

module.exports = router;
