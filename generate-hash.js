import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  const password = 'zXcWT#g-5';
  const hashed = await hashPassword(password);
  console.log(`Original password: ${password}`);
  console.log(`Hashed password: ${hashed}`);
}

main().catch(console.error);