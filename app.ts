import express from 'express';
import cluster from 'cluster';
import os from 'os';
import Redis from 'ioredis';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const numCPUs = 2; // We want two replica sets
const app = express();
const port = 3000;

// Redis client setup
const redis = new Redis();

// Rate limiter setup
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.body.user_id;
    },
});

app.use(express.json());
app.use('/api/v1/task', limiter);

// Task function
async function task(user_id: string) {
    const logMessage = `${user_id}-task completed at-${Date.now()}\n`;
    fs.appendFile(path.join(__dirname, 'task_log.txt'), logMessage, (err) => {
        if (err) console.error('Error writing to log file:', err);
    });
    console.log(logMessage);
}

// Queue processor
async function processQueue() {
    const userTimestamps: { [key: string]: number } = {};

    while (true) {
        try {
            const job = await redis.brpop('taskQueue', 1);
            if (job) {
                const [_, jobString] = job;
                const { user_id, timestamp, jobId } = JSON.parse(jobString);
                const now = Date.now();

                // Ensure 1 second has passed since the last task for this user
                const lastTaskTime = userTimestamps[user_id] || 0;
                const timeToWait = Math.max(0, 1000 - (now - lastTaskTime));

                if (timeToWait > 0) {
                    await new Promise(resolve => setTimeout(resolve, timeToWait));
                }

                await task(user_id);
                userTimestamps[user_id] = Date.now();

                console.log(`Processed job ${jobId} for user ${user_id}`);
            }
        } catch (error) {
            console.error('Error processing queue:', error);
        }
    }
}

// API route
app.post('/api/v1/task', async (req, res) => {
    const { user_id } = req.body;
    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
    }

    const jobId = uuidv4();
    const timestamp = Date.now();

    await redis.lpush('taskQueue', JSON.stringify({ user_id, timestamp, jobId }));
    res.json({ message: 'Task queued', jobId });
});

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork(); // Replace the dead worker
    });

    // Start queue processor in primary process
    processQueue();
} else {
    // Workers can share any TCP connection
    app.listen(port, () => {
        console.log(`Worker ${process.pid} started and listening on port ${port}`);
    });
}

export default app;
