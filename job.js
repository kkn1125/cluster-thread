import { isMainThread, parentPort, workerData } from "worker_threads";
import { JobWorker } from "./module/JobWorker.js";
import { Plan } from "./module/Plan.js";

console.log("isMainThread", isMainThread, workerData.workerName);

console.log(`PID: ${process.pid}`);

const { workerName, tasks, accelerate } = workerData;

console.log(`✨ [SYS] start job worker [${workerName}]`);

const worker = new JobWorker(workerName);
const plan = new Plan(tasks);
plan.allocate(worker);

plan
  .working()
  .then((result) => {
    parentPort.postMessage("done!");
  })
  .finally(() => {
    parentPort.close();
  });
