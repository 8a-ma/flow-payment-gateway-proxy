const { createClient } = require('redis');


class RedisService {
    constructor(config) {
        const user = 'default'; 
        const pass = config.password;
        const host = config.host || 'localhost';
        const port = config.port || 6379;
        const db = config.db || 0;

        // Construimos la URL: redis://default:password@host:port/db
        const url = pass 
            ? `redis://${user}:${pass}@${host}:${port}/${db}`
            : `redis://${host}:${port}/${db}`;

        this.client = createClient({url});

        this.client.on('error', (err) => console.log('Redis Client Error', err));
        this.client.on('connect', () => console.log('Redis connected - DB 0'));
    }

    async connect(){
        if (!this.client.isOpen) {
            await this.client.connect();
        }
    }
    
    async saveToken(token, value = "") {
        try {
            await this.client.set(token, value,{
                EX: 600
            });
        } catch (error) {
            console.log(`Error while save the token on redis: ${error.message}`);
            throw error;
        }
    }

    async getValue(key) {
        try {
            return await this.client.get(key);
        } catch (error) {
            console.log(`Error while get the key on redis: ${error.message}`);
            throw error;
        }
    }

    async updateValue(key, value) {
        try {
            await this.client.set(key, value, {
                KEEPTTL: true
            });
        } catch (error) {
            console.log(`Error while updating value on redis: ${error.message}`);
            throw error;
        }
    }

    async disconnect() {
        await this.client.quit();
    }
}

module.exports = RedisService;