import { describe, test, expect, beforeEach } from 'vitest';
import { TitrationModel } from '../../web/src/features/simulation/model/titration-model.js';

describe('TitrationModel HCl/NaOH', () => {
  let model;
  beforeEach(() => {
    model = new TitrationModel({
      acidConcentration: 0.1,
      initialAcidVolume: 20.0,
      baseConcentration: 0.1,
      indicatorName: 'phenolphtaleine',
    });
  });

  test('pH initial ≈ 1.0', () => {
    expect(model.ph).toBeCloseTo(1.0, 1);
  });

  test('volume équivalent = 20 mL', () => {
    expect(model.equivalenceVolume).toBeCloseTo(20.0, 1);
  });

  test("pH = 7 à l'équivalence", () => {
    model.addBase(20.0);
    expect(model.ph).toBeCloseTo(7.0, 1);
    expect(model.equivalenceReached).toBe(true);
  });

  test('reset ramène à zéro', () => {
    model.addBase(15);
    model.reset();
    expect(model.volumeBase).toBe(0);
    expect(model.ph).toBeCloseTo(1.0, 1);
  });
});
