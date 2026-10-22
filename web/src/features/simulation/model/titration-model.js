export class TitrationModel {
  constructor(params, pKa = null) {
    this.params = params;
    this.pKa = pKa;
    this.volumeBase = 0;
  }

  get equivalenceVolume() {
    return (
      (this.params.acidConcentration * this.params.initialAcidVolume) /
      this.params.baseConcentration
    );
  }

  get equivalenceReached() {
    return this.volumeBase >= this.equivalenceVolume - 0.05;
  }

  get ph() {
    return this._computePh(this.volumeBase);
  }

  addBase(dVolMl) {
    if (dVolMl <= 0) return;
    this.volumeBase += dVolMl;
  }

  reset() {
    this.volumeBase = 0;
  }

  _computePh(vBase) {
    const {
      acidConcentration: ca,
      initialAcidVolume: va,
      baseConcentration: cb,
    } = this.params;
    const vTot = va + vBase;
    const nAcid = ca * va;
    const nBase = cb * vBase;
    const log10 = (x) => Math.log10(x);

    if (this.pKa === null) {
      if (nBase < nAcid - 1e-9) {
        return -log10((nAcid - nBase) / vTot);
      } else if (Math.abs(nBase - nAcid) < 1e-9) {
        return 7.0;
      } else {
        return 14.0 + log10((nBase - nAcid) / vTot);
      }
    } else {
      if (nBase < nAcid - 1e-9) {
        const ratio = nBase / (nAcid - nBase);
        return this.pKa + log10(ratio > 0 ? ratio : 1e-6);
      } else if (Math.abs(nBase - nAcid) < 1e-9) {
        const cSalt = nAcid / vTot;
        const kb = Math.pow(10, this.pKa - 14);
        return 14.0 + log10(Math.sqrt(kb * cSalt));
      } else {
        return 14.0 + log10((nBase - nAcid) / vTot);
      }
    }
  }
}
