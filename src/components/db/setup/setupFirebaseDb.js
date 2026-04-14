import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../firebase.js';
import initSqlJs from 'sql.js';

let SQL = null;
let runtimeConfig = {};
let cachedDatabases = null;
const dbCollection = doc(db, 'sqliteConfigs', 'mainConfig');

const waitForAuth = () => new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
    });
});
// Upload once
// Initialize SQL.js once
export const initSQL = async () => {
    if (!SQL) {
        SQL = await initSqlJs({
            locateFile: () => `/sql-wasm.wasm` // located in public
        });
    }
    return SQL;
};

// Add data such as create Dataset, table, and table Schema in Firestore
export const addDataToFirestore = async (dbname, query = []) => {
    runtimeConfig = (await getSqliteConfig()) || {};
    if (!runtimeConfig || !runtimeConfig[dbname]) {
        runtimeConfig[dbname] = { name: `${dbname}.sqlite`, queries: [] };
    }
    if (runtimeConfig) {
        runtimeConfig[dbname].queries.push(...query);
        await setDoc(dbCollection, runtimeConfig);
        invalidateDatabaseCache(); // force rebuild on next load
        console.log('Saved to Firestore');
    }
};

// Retrieve anytime
export const getSqliteConfig = async () => {
    await waitForAuth();
    const docSnap = await getDoc(dbCollection);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
};
// Use it
export const loadSqliteData = async () => {
    if (cachedDatabases) return cachedDatabases; // return cache on subsequent calls
    const databases = {};
    await initSQL();
    runtimeConfig = await getSqliteConfig();
    if (!runtimeConfig) {
        console.error('No config found in Firestore');
        return {};
    }
    for (const [key, config] of Object.entries(runtimeConfig)) {
        const sqliteDb = new SQL.Database();
        for (const query of config.queries)
            try {
                sqliteDb.run(query);
            } catch (error) {
                console.warn(`Skipped query in ${key}: ${error.message}`);
            }
        databases[key] = sqliteDb;
    }
    cachedDatabases = databases; // store in cache
    return databases;
};

// Call this after teacher adds/modifies datasets so cache is refreshed
export const invalidateDatabaseCache = () => { cachedDatabases = null; };
