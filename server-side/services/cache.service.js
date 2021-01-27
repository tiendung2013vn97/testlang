const cacheManager = require('cache-manager');
const cache = cacheManager.caching({store: 'memory', max: 0, ttl: 3600/*seconds*/});

class CacheService {

    /**
    * Save cache define by key
    */
    static async saveCache(data, key){
        await cache.set(key, data, 3600);
    }

    /**
    * Get cache define by key
    */
    static async getCache(key){
        const value = await cache.get(key);
        if(value === undefined){
            return '';
        }
        return value;
    }

    /**
    * Remove cache by key
    */
    static async removeCache(key){
        await cache.del(key)
    }
}

module.exports = CacheService;
