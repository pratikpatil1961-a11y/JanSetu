const { MongoMemoryServer } = require('mongodb-memory-server');
(async () => {
  try {
    console.log("Creating memory server...");
    const mongoServer = await MongoMemoryServer.create();
    console.log("URI:", mongoServer.getUri());
    process.exit(0);
  } catch(e) {
    console.error("ERROR", e);
    process.exit(1);
  }
})();
