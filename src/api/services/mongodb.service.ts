import { Injectable } from '@nestjs/common';
import { Collection, Db, MongoClient } from 'mongodb';


@Injectable()
export class MongodbService {
    url = process.env.MONGODB_URL ;
    client: MongoClient;
    databaseString: string = 'ShortenerDB';
    collectionString: string = 'Mappings';
    database: Db;
    collection: Collection;
    connected: boolean = false;

    constructor() {
        this.client = new MongoClient(this.url);
        this.connect();
    }

    async connect(): Promise<void> {
        if (!this.connected) {
            try {
                await this.client.connect();
                this.database = this.client.db('ShortenerDB');
                this.collection = this.database.collection('Mappings');
                this.connected = true;
            } catch (error) {
                console.log(`Error on connecting to mongoDB database: ${this.database}, collection: ${this.collection} — ${error}`);
                throw error;
            }
        } else { throw new Error('Error on trying to connect: Already connected') };
    }
    async disconnect(): Promise<void> {
        try {
            await this.client.close();
            this.connected = false
        } catch (error) {
            console.log(`Error on trying to disconnect: ${error}`);
            throw new Error(`Error on trying to disconnect: ${error}`);
        }
    }

    async storeMapping(shortcode: string, longUrl: string): Promise<boolean> {
        if (this.connected) {
            try {
                const insertObj = {
                    shortcode: String(shortcode),
                    original: String(longUrl),
                    clicks: String(0),
                };
                const insertResult = await this.collection.insertOne(insertObj);
                return insertObj ? true : false;
            } catch (error) {
                console.log(`Error on storeMapping: ${error}`);
                throw new Error(`Error on storeMapping: ${error}`);
            }
        } else { throw new Error('Error on storeMapping: Not connected') };

    }

    async getMapping(shortcode: string): Promise<string> {
        if (this.connected) {
            try {
                const query = { shortcode: shortcode };
                const doc = await this.collection.findOne(query);
                return String(doc.original);
            } catch (error) {
                console.log(`Error on getMapping: ${error}`);
                throw new Error(`Error on getMapping: ${error}`);
            }
        } else { throw new Error('Error on getMapping: Not connected') };
    }

    async updateStats(shortcode: string): Promise<void> {
        if (this.connected) {
            const query = { shortcode: shortcode };
            const doc = await this.collection.findOne(query);
            const clicks = doc.clicks;
            await this.collection.updateOne({ shortcode: shortcode }, { $set: { clicks: clicks ? Number(clicks) + 1 : 1 } })
        } else { throw new Error('Error on updateStats: Not connected') };
    }

    async getStats(shortcode: string): Promise<string> {
        if (this.connected) {
            const query = { shortcode: shortcode };
            const doc = await this.collection.findOne(query);
            return doc.clicks;
        } else { throw new Error('Error on getStats: Not connected') };
    }
}
