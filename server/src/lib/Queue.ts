import Queue from 'bull';
import redisConfig from '../config/redis'
import * as jobs from '../jobs'


const queues = Object.values(jobs).map(job => ({
    bull: new Queue(job.key, {
        redis: redisConfig,
        defaultJobOptions: job.options
    }),
    name: job.key,
    handle: job.handle,
}))



export default {
    queues,
    add(name: string, data: any) {
        const queue = this.queues.find( queue => queue.name === name)
        return queue?.bull.add(data);
    },
    process() {
        return this.queues.forEach( queue => {
            queue.bull.process(queue.handle);
            queue.bull.on("failed", (job, err) => {
                console.log(' Job failed ', queue.name, job.data)
            })
        })
    }
};