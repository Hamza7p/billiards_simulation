
export class Engine {
  constructor(update) {

    this.update = update;
    this.running = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedDt = 1 / 120;
  }

  start() {
    if (this.running) return;

    this.running = true;

    requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
  }

  loop = (time) => {
    if (!this.running) return;

    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.accumulator += delta;

    while (this.accumulator >= this.fixedDt) {
      this.update(this.fixedDt);

      this.accumulator -= this.fixedDt;
    }

    requestAnimationFrame(this.loop);
  };
}