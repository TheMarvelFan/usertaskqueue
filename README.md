# Task Queue API Documentation

## Approach

The Task Queue API is designed to handle task processing with specific rate limits per user. Here's an overview of the approach:

1. **Node.js Cluster**: We use Node.js clustering to create two replica sets, improving performance and reliability.
2. **Express API**: The API is built using Express.js, providing a simple and efficient way to handle HTTP requests.
3. **Redis Queue**: Redis is used as a queue to manage tasks across clusters, ensuring fair task distribution and processing.
4. **Rate Limiting**: We implement two levels of rate limiting:

1. 20 requests per minute per user using `express-rate-limit`
2. 1 task processed per second per user using custom logic in the queue processor



5. **Task Processing**: Tasks are processed in the primary (master) process to ensure consistent rate limiting across all worker processes.


## Assumptions

1. Redis is available and running on the default localhost:6379.
2. The system has Node.js (version 14 or higher) installed.
3. The application will run on a single machine (for simplicity of setup and demonstration).
4. Tasks are relatively quick to process and don't require significant computational resources.
5. The log file (`task_log.txt`) will be created in the same directory as the application.

## Project Setup and Running Instructions

### Option 1: Setting up the project from an unzipped folder

1. **Prerequisites**

1. Ensure you have Node.js (version 14 or higher) installed on your system.
2. Install Redis on your local machine.



2. **Navigate to the project directory**
   Open a terminal and navigate to the unzipped project folder:

```bash
cd path/to/unzipped/task-queue-api
```


3. **Install dependencies**
   Run the following command in your project directory:

```bash
npm install
```


4. **Start Redis server**
   Open a new terminal window and run:

1. For Windows: `redis-server`
2. For macOS/Linux: `redis-server`



5. **Compile and run the application**
   In your project directory, run:

```bash
npx ts-node app.ts
```




### Option 2: Cloning the project from GitHub

1. **Prerequisites**

1. Ensure you have Node.js (version 14 or higher) installed on your system.
2. Install Redis on your local machine.
3. Make sure you have Git installed on your system.



2. **Clone the repository**
   Open a terminal and run:

```bash
git clone [https://github.com/TheMarvelFan/usertaskqueue.git](https://github.com/TheMarvelFan/usertaskqueue.git)
cd usertaskqueue
```


3. **Install dependencies**
   Run the following command in your project directory:

```bash
npm install
```


4. **Start Redis server**
   Open a new terminal window and run:

1. For Windows: `redis-server`
2. For macOS/Linux: `redis-server`



5. **Compile and run the application**
   In your project directory, run:

```bash
npx ts-node app.ts
```




## Running and Testing the Project using Postman

1. **Install Postman**

1. Download and install Postman from [postman.com](https://www.postman.com/downloads/)



2. **Create a new request in Postman**

1. Open Postman and click on the "+" button to create a new request
2. Set the request type to "POST"
3. Enter the URL: `http://localhost:3000/api/v1/task`



3. **Set up the request body**

1. Click on the "Body" tab
2. Select "raw" and choose "JSON" from the dropdown
3. Enter the following JSON in the body:

```json
{
  "user_id": "123"
}
```





4. **Set up headers**

1. Click on the "Headers" tab
2. Add a new header:

1. Key: `Content-Type`
2. Value: `application/json`






5. **Send requests and observe rate limiting**

1. Click the "Send" button to send your first request
2. You should receive a response like:

```json
{
  "message": "Task queued",
  "jobId": "some-uuid-here"
}
```


3. Quickly send multiple requests (you can use the "Send" button repeatedly)
4. Observe that you can send up to 20 requests in quick succession
5. After 20 requests within a minute, you should start seeing rate limit errors



6. **Test different user IDs**

1. Change the `user_id` in the request body to a different value, e.g., "456"
2. Send requests with this new user ID
3. You should be able to send another 20 requests before hitting the rate limit for this new user ID



7. **Observe task processing**

1. While sending requests, keep an eye on your server console
2. You should see log messages indicating task completion, spaced approximately 1 second apart for each user ID



8. **Check the log file**

1. After running some tests, check the `task_log.txt` file in your project directory
2. You should see entries corresponding to the tasks you've submitted, with timestamps and user IDs



9. **Long-running test**

1. Set up a collection in Postman with the request you created
2. Use Postman's Collection Runner to send a large number of requests (e.g., 100) with a delay between requests (e.g., 100ms)
3. This will help you verify that tasks are queued and processed according to the rate limits over a longer period



10. **Monitor Redis (Optional)**

1. If you have Redis CLI installed, you can monitor the queue in real-time
2. Open a new terminal and run: `redis-cli monitor`
3. This will show you Redis operations as they happen, allowing you to see tasks being added to and removed from the queue





## Additional Notes

- The application uses TypeScript. If you prefer JavaScript, you can transpile the code or modify it to use `.js` files instead.
- For production use, consider adding more robust error handling, logging, and monitoring.
- The current implementation assumes a trusted environment. For production, implement proper authentication and authorization mechanisms.
- To scale the application across multiple machines, you would need to set up a centralized Redis instance and modify the clustering logic.


## Troubleshooting

1. If you encounter EADDRINUSE errors, ensure no other application is using port 3000.
2. If Redis connection fails, verify that the Redis server is running and accessible.
3. For TypeScript-related issues, ensure you have the latest version of `ts-node` installed.


By following these instructions, you should be able to set up, run, and test the Task Queue API project on your local system. The application demonstrates handling rate-limited tasks across multiple processes while ensuring fair distribution and processing of tasks for each user.
