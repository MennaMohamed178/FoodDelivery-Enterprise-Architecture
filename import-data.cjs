const fs = require("fs");
const { MongoClient, ObjectId } = require("mongodb");

async function main() {
  const client = new MongoClient("mongodb://localhost:27017");
  try {
    await client.connect();
    const db = client.db("gofoody");

    for (const [file, collection] of [
      ["gofoodyitemsdatabase.json", "items"],
      ["gofoodycategorydatabase.json", "category"]
    ]) {
      const docs = JSON.parse(fs.readFileSync(file, "utf8"), (key, value) => {
        if (value && typeof value === "object" && value.$oid)
          return new ObjectId(value.$oid);
        return value;
      });

      const existing = await db.collection(collection).countDocuments();
      if (existing > 0) {
        console.log(`${collection}: skipped; already has ${existing} documents.`);
        continue;
      }

      if (docs.length) {
        await db.collection(collection).insertMany(docs);
      }
      console.log(`${collection}: imported ${docs.length} documents.`);
    }
  } finally {
    await client.close();
  }
}
main().catch(err => { console.error(err); process.exitCode = 1; });
