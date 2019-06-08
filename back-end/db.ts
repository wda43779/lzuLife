import { MongoClient, Db } from "mongodb";

// Connection URL
let url = "mongodb://localhost:27017/lzu";

if (process.env["DRONE"] === "true") {
  console.log("Found CI(Drone CI) env, using test db");
  url = "mongodb://mongo:27017/lzu";
}

let client: MongoClient;
let db: Db;

const dbInit = async () => {
  client = await MongoClient.connect(url, {
    useNewUrlParser: true
  });
  if (process.env["NODE_ENV"] === "test") {
    console.log("Found test env, using test db");
    db = client.db("testDB");
    db.dropDatabase();
  } else {
    db = client.db();
  }
};

const getDb = async () => {
  if (!db) {
    await dbInit();
  }
  return db;
};

export default getDb;
