import { Injectable } from '@nestjs/common';

import { Redis } from 'ioredis';
import * as crypto from 'crypto';
import { MongodbService } from './mongodb.service';

@Injectable()
export class ShortcodeService {

    constructor(private readonly redis: Redis,
        private readonly mongoDB: MongodbService) { }

    symbols = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    random(max: number): number {
        const randomBytes = crypto.randomBytes(1);
        return Math.floor(randomBytes[0] / 255 * (max));
    }
    async generateShortCode(length: number): Promise<string> {
        try {
            let code: string = '';
            for (let i = 0; i < length; i++) {
                code += this.symbols[this.random(this.symbols.length - 1)];
            }
            return code;
        } catch (error) {
            throw new Error(`Error on generateShortCode: ${error}`);
        }
    }
    async createUniqueCode(): Promise<string> {
        try {
            let code = await this.generateShortCode(6);
            while (await this.redis.get(code)) {
                code = await this.generateShortCode(6);
            }
            return code;
        } catch (error) {
            throw new Error(`Error on createUniqueCode: ${error}`);
        }

    }
    async createMapping(shortcode: string, longUrl: string): Promise<boolean> {
        try {
            if (!await this.redis.get(shortcode)) {
                await this.redis.set(shortcode, longUrl);
                await this.mongoDB.storeMapping(shortcode, longUrl);
                return true;
            } else { return false }
        } catch (error) {
            throw new Error(`Error on createMapping: ${error}`);
        }

    }

    async getMappedUrl(shortcode: string): Promise<string | null> {
        try {
            let originalUrl = await this.redis.get(shortcode);
            if (!originalUrl) { originalUrl = await this.mongoDB.getMapping(shortcode) };
            return originalUrl;
        } catch (error) {
            throw new Error(`Error on getMappedUrl: ${error}`);
        }

    }
    async updateStats(shortcode: string): Promise<void> {
        try {
            await this.mongoDB.updateStats(shortcode);
        } catch (error) {
            throw new Error(`Error on updateStats: ${error}`);
        }
    }
    async getStats(shortcode: string): Promise<string> {
        try {
            return await this.mongoDB.getStats(shortcode);
        } catch (error) {
            throw new Error(`Error on getStats: ${error}`);
        }
    }
}
