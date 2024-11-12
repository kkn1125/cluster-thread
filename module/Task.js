export class Task {
  task;
  timeout;

  constructor(task, seconds) {
    this.task = task;
    this.timeout = seconds;
  }
}
