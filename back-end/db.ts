import { MongoClient, Db } from "mongodb";

// Connection URL
const url = "mongodb://localhost:27017/lzu";

let client: MongoClient;
let db: Db;

const dbInit = async () => {
  client = await MongoClient.connect(url, {
    useNewUrlParser: true
  });
  db = client.db();
};

const getDb = async () => {
  if (!db) {
    await dbInit();
  }
  return db;
};

export default getDb;
