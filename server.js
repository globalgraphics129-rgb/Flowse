const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Parse request bodies (profile pictures might be base64 strings up to 5MB)
app.use(express.json({ limit: '10mb' }));

// Custom CORS middleware supporting Capacitor mobile webviews
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure db directory and json storage file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR);
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({}));
}

// DB Helpers
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data || '{}');
  } catch (err) {
    console.error('Error reading db.json:', err);
    return {};
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

// 1. Onboard / Register User
app.post('/api/auth/onboard', (req, res) => {
  const { profile } = req.body;
  if (!profile || !profile.email || !profile.pin) {
    return res.status(400).json({ error: 'Invalid profile data.' });
  }

  const db = readDB();
  const email = profile.email.toLowerCase().trim();

  if (db[email]) {
    return res.status(400).json({ error: 'User with this email already exists.' });
  }

  db[email] = {
    profile,
    transactions: [],
    budgets: [],
    goals: [],
    recurringTransactions: [],
    lastSynced: new Date().toISOString()
  };

  writeDB(db);
  res.json({ message: 'Onboarded successfully.', profile });
});

// 2. Login / Restore Ledger Data
app.post('/api/auth/login', (req, res) => {
  const { email, pin } = req.body;
  if (!email || !pin) {
    return res.status(400).json({ error: 'Email and PIN are required.' });
  }

  const db = readDB();
  const normalizedEmail = email.toLowerCase().trim();
  const user = db[normalizedEmail];

  if (!user || user.profile.pin !== pin) {
    return res.status(401).json({ error: 'Invalid email or PIN.' });
  }

  res.json({
    message: 'Authenticated successfully.',
    profile: user.profile,
    transactions: user.transactions || [],
    budgets: user.budgets || [],
    goals: user.goals || [],
    recurringTransactions: user.recurringTransactions || []
  });
});

// 3. Synchronize Ledger Data
app.post('/api/data/sync', (req, res) => {
  const { email, pin, data } = req.body;
  if (!email || !pin || !data) {
    return res.status(400).json({ error: 'Invalid sync payload.' });
  }

  const db = readDB();
  const normalizedEmail = email.toLowerCase().trim();
  const user = db[normalizedEmail];

  if (!user || user.profile.pin !== pin) {
    return res.status(401).json({ error: 'Authentication failed.' });
  }

  // Overwrite server database with the latest client sync state
  db[normalizedEmail] = {
    ...user,
    profile: data.profile || user.profile,
    transactions: data.transactions || [],
    budgets: data.budgets || [],
    goals: data.goals || [],
    recurringTransactions: data.recurringTransactions || [],
    lastSynced: new Date().toISOString()
  };

  writeDB(db);
  res.json({ message: 'Synchronized successfully.' });
});

// Serve Vite Static Bundle
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for React SPA Routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Flowse Sync Server running on port ${PORT}`);
});
