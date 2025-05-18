import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.SECRET || 'secretkey';

// Auth middleware
function authenticate(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(403);
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Register
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], err => {
    if (err) return res.status(400).json({ error: 'User exists' });
    res.json({ message: 'Registered' });
  });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Deposit
app.post('/deposit', authenticate, (req, res) => {
  const { amount } = req.body;
  if (amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  db.run('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, req.user.id], function (err) {
    if (err) return res.sendStatus(500);
    db.run('INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)', [req.user.id, 'deposit', amount], function(err) {
      if (err) return res.sendStatus(500);
      res.json({ message: 'Deposited' });
    });
  });
});

// Withdraw
app.post('/withdraw', authenticate, (req, res) => {
  const { amount } = req.body;
  if (amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  db.get('SELECT balance FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.balance < amount) return res.status(400).json({ error: 'Insufficient funds' });

    db.run('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, req.user.id], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to update balance' });
      db.run('INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)', [req.user.id, 'withdraw', amount], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to record transaction' });
        res.json({ message: 'Withdrawn' });
      });
    });
  });
});

// Transactions
app.get('/transactions', authenticate, (req, res) => {
  db.all('SELECT * FROM transactions WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch transactions' });
    res.json(rows);
  });
});

app.listen(5000, () => console.log('✅ Backend running on http://localhost:5000'));
