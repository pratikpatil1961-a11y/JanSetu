const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const dbPath = path.join(__dirname, 'local-db');
    if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);

    console.log("Creating persistent mongo server at", dbPath);
    const mongoServer = await MongoMemoryServer.create({
      instance: {
        dbPath,
        storageEngine: 'wiredTiger'
      }
    });
    console.log("URI:", mongoServer.getUri());
    process.exit(0);
  } catch(e) {
    console.error("ERROR", e);
    process.exit(1);
  }
})();
