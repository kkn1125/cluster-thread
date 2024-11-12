import rangeWith from "../util/rangeWith.js";
import sleep from "../util/sleep.js";

export class JobWorker {
  name;
  timeout = 1000;
  accelerate = 1;
  runTimeout = 0;

  constructor(name, accelerate = 0) {
    this.name = name;
    this.accelerate = accelerate;
  }

  async run({ task, timeout }) {
    let waitTimeAsCondition, waitTime;
    const isAccelerate = Math.floor(Math.random() * 2);
    const currentCondition = rangeWith(this.accelerate);
    const waitTimeout = timeout || this.timeout;

    waitTimeAsCondition = +(waitTimeout + currentCondition).toFixed(2);

    if (isAccelerate)
      waitTime = waitTimeAsCondition > 0 ? waitTimeAsCondition : waitTimeout;
    else waitTime = waitTimeout;

    this.runTimeout = waitTime;

    await sleep(waitTime);

    console.log(
      `✨ ["${this.name}"] success work job --> ${task} ${this.runTimeout}s`
    );

    // process.stdout.moveCursor(-11, 0);
    // console.log(`${this.runTimeout}s`);
  }
}
