import cluster from "cluster";
import { isMainThread, Worker } from "worker_threads";
import { JobWorker } from "./module/JobWorker.js";
import { Plan } from "./module/Plan.js";
import { Task } from "./module/Task.js";
import sleep from "./util/sleep.js";

let start = 0;
const ranking = [];
const wakeupTime = 1;
const workerFile = "./job.js";
const mode = "cluster";
const accelerate = 5;
const workers = [
  "james",
  "tom",
  "hob",
  "teddy",
  "malon",
  "lora",
  "bread",
  "bob",
  "chris",
  "tomas",
];
const WorkLevel = {
  Low: 0.01,
  Simple: 0.1,
  Middle: 1,
  Difficult: 10,
  Heavy: 20,
  VeryHeavy: 30,
};
const tasks = [
  [
    new Task("Middle", WorkLevel.Middle),
    new Task("Heavy", WorkLevel.Heavy),
    ...taskFactory("Low", 30, WorkLevel.Low),
  ],
  [
    ...taskFactory("Low", 30, WorkLevel.Low),
    new Task("Middle", WorkLevel.Middle),
    new Task("Heavy", WorkLevel.Heavy),
  ],
];

function taskFactory(name, amount, seconds) {
  const factory = [];
  for (let i = 0; i < amount; i++) factory.push(new Task(name, seconds));
  return factory;
}

function main() {
  console.log(`Main PID: ${process.pid}`);
  console.log("✨ [SYS] all job work...");

  const workerJames = new Worker(workerFile, {
    workerData: {
      workerName: workers[0],
      tasks: tasks[0],
      accelerate,
    },
  });

  const workerTom = new Worker(workerFile, {
    workerData: {
      workerName: workers[1],
      tasks: tasks[1],
      accelerate,
    },
  });

  workerJames.on("message", (result) => {
    console.log("✨ [SYS] james:", result);
  });
  workerTom.on("message", (result) => {
    console.log("✨ [SYS] tom:", result);
  });

  workerJames.on("exit", () => {
    console.log(`james done at: ${(Date.now() - start) / 1000} seconds`);
  });
  workerTom.on("exit", (result) => {
    console.log(`tom done at: ${(Date.now() - start) / 1000} seconds`);
  });
}

if (mode === "worker") {
  if (isMainThread) {
    console.log("isMainThread:", isMainThread);
    sleep(wakeupTime).then(() => {
      main();
      start = Date.now();
    });
  }
} else if (mode === "cluster") {
  if (cluster.isPrimary) {
    console.log(`Main PID: ${process.pid}`);
    console.log("cluster isPrimary:", isMainThread);
    sleep(wakeupTime).then(() => {
      for (let i = 0; i < 2 /* os.cpus().length */; i++) {
        function makeCluster() {
          let name;
          const clusterWorker = cluster.fork({
            WORKER_NAME: workers[i],
            TASKS: JSON.stringify(tasks[i]),
            ACCELERATE: accelerate,
          });
          clusterWorker.on("message", (result) => {
            const [domainName, domainMsg] = result.split(",");
            name = domainName.split(":")[1];
            const msg = domainMsg.split(":")[1];
            console.log(`✨ [SYS] ${name}:`, msg);
            ranking.push(name);
          });
          clusterWorker.on("exit", () => {
            console.log(
              `✅ [SYS] ${name} done at: ${(Date.now() - start) / 1000} seconds`
            );
            if (ranking.length === 2) {
              console.log(
                `✅ [RESULT] Rank is:\n${ranking
                  .map((name, i) => "   " + (i + 1) + "-" + name)
                  .join("\n")}`
              );
            }
          });
        }
        makeCluster();
      }
      start = Date.now();
    });
  } else {
    const workerName = process.env.WORKER_NAME;
    const tasks = JSON.parse(process.env.TASKS);
    const accelerate = JSON.parse(process.env.ACCELERATE);

    console.log("isWorker:", cluster.isWorker);
    console.log("isWorker WORKER_NAME:", workerName);
    console.log("isWorker ENV:", tasks);

    console.log(`PID: ${process.pid}`);

    // const { workerName, tasks } = workerData;

    console.log(`✨ [SYS] start job worker [${workerName}]`);

    const worker = new JobWorker(workerName, accelerate);
    const plan = new Plan(tasks);
    plan.allocate(worker);

    plan
      .working()
      .then((result) => {
        process.send(`name:${workerName},msg:done!`);
      })
      .finally(() => {
        cluster.worker.disconnect();
      });
  }
}
