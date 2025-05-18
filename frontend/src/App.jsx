import { useState } from 'react';
import { api } from './api';
import './App.css'; // Import the CSS reset and global styles

export default function App() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);

  const register = () => {
    api.post('/register', { username, password })
      .then(() => alert('Registered!'))
      .catch(() => alert('Username exists'));
  };

  const login = () => {
    api.post('/login', { username, password })
      .then(res => {
        setToken(res.data.token);
        alert('Logged in');
      })
      .catch(() => alert('Login failed'));
  };

  const deposit = () => {
    api.post('/deposit', { amount: parseInt(amount) }, {
      headers: { Authorization: token }
    }).then(() => alert('Deposited'));
  };

  const withdraw = () => {
    api.post('/withdraw', { amount: parseInt(amount) }, {
      headers: { Authorization: token }
    }).then(() => alert('Withdrawn'));
  };

  const getTransactions = () => {
    api.get('/transactions', {
      headers: { Authorization: token }
    }).then(res => setTransactions(res.data));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Digital Wallet</h2>
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} /><br /><br />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} /><br /><br />
      <button onClick={register}>Register</button>
      <button onClick={login}>Login</button>

      <hr />

      <input placeholder="Amount" onChange={e => setAmount(e.target.value)} /><br /><br />
      <button onClick={deposit}>Deposit</button>
      <button onClick={withdraw}>Withdraw</button>

      <hr />

      <button onClick={getTransactions}>View Transactions</button>
      <ul>
        {transactions.map(tx => (
          <li key={tx.id}>{tx.type} — ₹{tx.amount} — {tx.timestamp?.slice(0, 19).replace('T', ' ')}</li>
        ))}
      </ul>
    </div>
  );
}

