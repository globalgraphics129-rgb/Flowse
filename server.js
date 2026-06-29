const express = require('express');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

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

// Database Config
const MONGODB_URI = process.env.MONGODB_URI;
let mongoClient = null;
let mongoDb = null;

// Local JSON File Database Config
const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

if (!MONGODB_URI) {
  // Ensure local db directory and json storage file exist for local fallback
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR);
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({}));
  }
}

// Local File Helper functions
function readLocalDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data || '{}');
  } catch (err) {
    console.error('Error reading db.json:', err);
    return {};
  }
}

function writeLocalDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

// MongoDB Helper functions
async function getMongoCollection() {
  if (!mongoDb) {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    mongoDb = mongoClient.db('flowse');
  }
  return mongoDb.collection('users');
}

// Abstracted Database Interface Adapter
async function readUser(email) {
  const normalizedEmail = email.toLowerCase().trim();
  if (MONGODB_URI) {
    const col = await getMongoCollection();
    const user = await col.findOne({ email: normalizedEmail });
    return user;
  } else {
    const localDB = readLocalDB();
    return localDB[normalizedEmail];
  }
}

async function writeUser(email, userData) {
  const normalizedEmail = email.toLowerCase().trim();
  if (MONGODB_URI) {
    const col = await getMongoCollection();
    // Exclude MongoDB system _id field if present to prevent update errors
    const dataToSave = { ...userData };
    delete dataToSave._id;
    await col.updateOne(
      { email: normalizedEmail },
      { $set: { ...dataToSave, email: normalizedEmail } },
      { upsert: true }
    );
  } else {
    const localDB = readLocalDB();
    localDB[normalizedEmail] = userData;
    writeLocalDB(localDB);
  }
}

async function userExists(email) {
  const normalizedEmail = email.toLowerCase().trim();
  if (MONGODB_URI) {
    const col = await getMongoCollection();
    const count = await col.countDocuments({ email: normalizedEmail });
    return count > 0;
  } else {
    const localDB = readLocalDB();
    return !!localDB[normalizedEmail];
  }
}

// 1. Onboard / Register User
app.post('/api/auth/onboard', async (req, res) => {
  const { profile } = req.body;
  if (!profile || !profile.email || !profile.pin) {
    return res.status(400).json({ error: 'Invalid profile data.' });
  }

  const email = profile.email.toLowerCase().trim();
  try {
    const exists = await userExists(email);
    if (exists) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const userData = {
      profile,
      transactions: [],
      budgets: [],
      goals: [],
      recurringTransactions: [],
      lastSynced: new Date().toISOString()
    };

    await writeUser(email, userData);
    res.json({ message: 'Onboarded successfully.', profile });
  } catch (err) {
    console.error('Onboard error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 2. Login / Restore Ledger Data
app.post('/api/auth/login', async (req, res) => {
  const { email, pin } = req.body;
  if (!email || !pin) {
    return res.status(400).json({ error: 'Email and PIN are required.' });
  }

  try {
    const user = await readUser(email);
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
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 3. Synchronize Ledger Data
app.post('/api/data/sync', async (req, res) => {
  const { email, pin, data } = req.body;
  if (!email || !pin || !data) {
    return res.status(400).json({ error: 'Invalid sync payload.' });
  }

  try {
    const user = await readUser(email);
    if (!user || user.profile.pin !== pin) {
      return res.status(401).json({ error: 'Authentication failed.' });
    }

    const updatedUserData = {
      ...user,
      profile: data.profile || user.profile,
      transactions: data.transactions || [],
      budgets: data.budgets || [],
      goals: data.goals || [],
      recurringTransactions: data.recurringTransactions || [],
      lastSynced: new Date().toISOString()
    };

    await writeUser(email, updatedUserData);
    res.json({ message: 'Synchronized successfully.' });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Serve Vite Static Bundle
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for React SPA Routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start standalone server locally
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Flowse Sync Server running on port ${PORT}`);
  });
}

// Export for Vercel Serverless hosting
module.exports = app;
