class AudioEnergy extends Tone.Analyser {
  constructor(sampleCount = 2048) {
    super("fft", sampleCount);
    this._updated = false;

    this.frequencyRanges = {
      bass: [20, 140],
      lowMid: [140, 400],
      mid: [400, 2600],
      highMid: [2600, 5200],
      treble: [5200, 14000]
    };
  }

  _map(n, start1, stop1, start2, stop2) {
    return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  }

  _log(n, logBase = 10) {
    return Math.log(n) / Math.log(logBase);
  }

  _lerp(start, stop, amt) {
    return amt * (stop - start) + start;
  }

  update() {
    this._updated = true;
    this.getValue();
  }

  getEnergyAtHz(hz) {
    const nyquist = this.context.sampleRate / 2;
    const frequencyBinCount = this.size;
    return Math.max(
      0,
      Math.min(
        frequencyBinCount - 1,
        Math.floor((hz / nyquist) * frequencyBinCount)
      )
    );
  }

  getEnergyBins(logarithmic = false, n = this.size, minFreq, maxFreq) {
    if (!this._updated) {
      throw new Error("getEnergy() error: You must call energy.update() first");
    }

    const minFrequency = minFreq || 0;
    const maxFrequency = maxFreq || this.context.sampleRate / 2;
    const logBase = 10;
    const minFrequencyLog = this._log(Math.max(1, minFrequency), logBase);
    const maxFrequencyLog = this._log(Math.max(1, maxFrequency), logBase);

    const bands = [];
    for (let i = 0; i < n; i++) {
      const minT = i / n;
      const maxT = minT + 1 / n;
      let minHz, maxHz;
      if (logarithmic) {
        minHz = Math.pow(
          logBase,
          this._lerp(minFrequencyLog, maxFrequencyLog, minT)
        );
        maxHz = Math.pow(
          logBase,
          this._lerp(minFrequencyLog, maxFrequencyLog, maxT)
        );
      } else {
        minHz = this._lerp(minFrequency, maxFrequency, minT);
        maxHz = this._lerp(minFrequency, maxFrequency, maxT);
      }
      const energy = this.getEnergy(minHz, maxHz);
      bands.push(energy);
    }
    return bands;
  }

  getEnergy() {
    if (!this._updated) {
      throw new Error("getEnergy() error: You must call energy.update() first");
    }
    const args = Array.from(arguments);
    let low, high;
    if (args.length === 1 && typeof args[0] === "string") {
      if (args[0] in this.frequencyRanges) {
        const range = this.frequencyRanges[args[0]];
        low = range[0];
        high = range[1];
      } else {
        throw new Error(
          `getEnergy() error: No range called ${
            args[0]
          } - possible ranges are: ${Object.keys(this.frequencyRanges).join(
            ", "
          )}`
        );
      }
    } else if (args.length === 2) {
      low = args[0];
      high = args[1];
    }

    const lowIndex = this.getEnergyAtHz(low);
    const highIndex = this.getEnergyAtHz(high);

    const buffer = this._buffer;
    let total = 0;
    let numFrequencies = 0;
    // add up all of the values for the frequencies
    for (let i = lowIndex; i <= highIndex; i++) {
      total += buffer[i];
      numFrequencies++;
    }
    // divide by total number of frequencies
    const toReturn = total / numFrequencies;
    return toReturn;
  }
}
