import { Task } from "./Task.js";
import { JobWorker } from "./JobWorker.js";

export class Plan {
  /** @type {Array<Task>} */
  tasks = [];
  /** @type {JobWorker} */
  worker;

  constructor(tasks = []) {
    this.tasks = [...tasks];
  }

  makePlan({ task, timeout }) {
    this.tasks.push({ task, timeout });
  }

  allocate(worker) {
    this.worker = worker;
  }

  async working() {
    const total = this.tasks.length;
    let processing = 0;
    for (const task of this.tasks) {
      processing += 1;
      console.log(
        `✔️ ${processing}/${total} ["${this.worker.name}"] prepare work job --> ${task.task}`
      );
      await this.worker.run(task);
      // console.log(
      //   `===================\n🛠️ [${this.worker.name}]\n${processing}/${total}\n${(
      //     (processing / total) *
      //     100
      //   ).toFixed(2)}%\n===================`
      // );
    }
  }
}
