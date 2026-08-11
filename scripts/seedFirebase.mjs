import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { SEED_PRODUCTS } from '../src/data/seedProducts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const contents = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const equalsIndex = line.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(envPath);

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error(`Missing Firebase config values: ${missingKeys.join(', ')}`);
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedProducts() {
  const snapshot = await getDocs(collection(db, 'products'));
  if (!snapshot.empty) {
    console.log(`Firestore already has ${snapshot.size} product(s). Nothing to seed.`);
    return;
  }

  const writes = SEED_PRODUCTS.map((product) =>
    addDoc(collection(db, 'products'), {
      ...product,
      createdAt: serverTimestamp(),
    })
  );
  const refs = await Promise.all(writes);
  console.log(`Seeded ${refs.length} product(s) into Firestore.`);
  refs.forEach((ref, index) => {
    console.log(`${index + 1}. ${SEED_PRODUCTS[index].name} -> ${ref.id}`);
  });
}

seedProducts()
  .then(() => {
    console.log('Done.');
  })
  .catch((err) => {
    console.error('Firebase seed failed:', err);
    process.exit(1);
  });
