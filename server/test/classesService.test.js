import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { computeStudentStatus } from '../src/services/classesService.js';

describe('computeStudentStatus', () => {
  it('inactive sans essai', () => {
    assert.equal(computeStudentStatus({ attempts_count: 0, average_score: null }), 'inactive');
  });
  it('on_track à partir de 70', () => {
    assert.equal(computeStudentStatus({ attempts_count: 3, average_score: 70 }), 'on_track');
  });
  it('watch entre 50 et 69', () => {
    assert.equal(computeStudentStatus({ attempts_count: 3, average_score: 55 }), 'watch');
  });
  it('struggling sous 50', () => {
    assert.equal(computeStudentStatus({ attempts_count: 3, average_score: 30 }), 'struggling');
  });
});
