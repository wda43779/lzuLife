import { MongoClient, Db } from "mongodb";
import { once } from "lodash";

// Connection URL
let url = "mongodb://localhost:27017/lzu";

if (process.env["DRONE"] === "true") {
  console.log("Found CI(Drone CI) env, using test db");
  url = "mongodb://mongo:27017/lzu";
}

const dbInit = async () => {
  const client = await MongoClient.connect(url, {
    useNewUrlParser: true
  });
  let db: Db;
  if (process.env["NODE_ENV"] === "test") {
    console.log("Found test env, using test db");
    db = client.db("testDB");
    db.dropDatabase();
  } else {
    db = client.db();
  }
  return {
    client,
    db
  };
};

const dbInitOnce = once(dbInit);

const getDb = async () => {
  return (await dbInitOnce()).db;
};

export default getDb;
export { dbInitOnce };
