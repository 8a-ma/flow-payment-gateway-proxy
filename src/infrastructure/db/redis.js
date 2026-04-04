const createClient = require('redis');


class RedisService {
    constructor(config) {
        const url = `redis://${config.user ? `${config.user}:${config.password}@` : ''}${config.host}:${config.port}/${config.db}`;

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
                EX: 120
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