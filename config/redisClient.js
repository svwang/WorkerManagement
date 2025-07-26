import { createClient } from 'redis'

export const redisClient = createClient({
    socket: {
        host: '127.0.0.1',
        port: '6379'
    },
    password: ''
})

redisClient.on('connect', ()=> {
    console.log('Redis server connected!')
})

redisClient.on('error', () => {
    console.log('Redis failed connetion to server!')
})

await redisClient.connect()