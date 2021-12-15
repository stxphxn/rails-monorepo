import { Database } from '@vuex-orm/core';
import User from '@/store/models/User';

const database = new Database();

database.register(User);

// Use dor development
if (process.env.DEV) {
  (window as any).User = User;
}

export default database;
