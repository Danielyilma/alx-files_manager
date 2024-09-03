import { MongoClient } from "mongodb";

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST ?? 'localhost';
    this.port = process.env.DB_PORT ?? 27017;
    this.dbname = process.env.DB_DATABASE ?? "files_manager";

    this.client = new MongoClient(`mongodb://${this.host}:${this.port}`, { useUnifiedTopology: true });
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.dbname);
    } catch (err) {
        console.log(err)
    }
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return await this.db.collection("users").countDocuments();
  }

  async nbFiles() {
    return await this.db.collection("files").countDocuments();
  }
}

const dbClient = new DBClient();

export default dbClient;
