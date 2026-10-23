import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { findBestAnswer } from '../src/assistant/offlineAssistant.js';
import { normalizeText, tokenize } from '../src/assistant/text.js';

const FAQ = [
  {
    id: 'rose',
    question: 'Pourquoi la solution devient-elle rose avec la phénolphtaléine ?',
    answer: 'La phénolphtaléine est rose en milieu basique.',
    keywords: ['rose', 'phénolphtaléine', 'indicateur', 'couleur', 'basique'],
  },
  {
    id: 'equivalence',
    question: 'Qu\'est-ce que le point d\'équivalence ?',
    answer: 'C\'est quand n(acide) = n(base).',
    keywords: ['équivalence', 'point', 'titrage', 'dosage', 'burette'],
  },
  {
    id: 'equilibrer',
    question: 'Comment équilibrer une équation chimique ?',
    answer: 'Mets des coefficients devant les formules.',
    keywords: ['équilibrer', 'équation', 'chimique', 'coefficients', 'atomes'],
  },
];

describe('text', () => {
  it('normalise accents, casse et ponctuation', () => {
    assert.equal(normalizeText('  Phénolphtaléine ? '), 'phenolphtaleine');
  });
  it('retire les mots vides et met au singulier', () => {
    assert.deepEqual(tokenize('Les solutions de la burette'), ['solution', 'burette']);
  });
});

describe('findBestAnswer', () => {
  it('retrouve la bonne entrée malgré les accents manquants', () => {
    const match = findBestAnswer('pourquoi la solution est devenue rose ?', FAQ);
    assert.equal(match?.entryId, 'rose');
  });
  it('retrouve une question formulée autrement', () => {
    assert.equal(findBestAnswer('comment equilibrer une equation', FAQ)?.entryId, 'equilibrer');
  });
  it('renvoie null pour une question hors sujet', () => {
    assert.equal(findBestAnswer('qui a gagné le match hier ?', FAQ), null);
  });
  it('renvoie null pour une question vide', () => {
    assert.equal(findBestAnswer('   ', FAQ), null);
  });
  it('renvoie null sans entrée de FAQ', () => {
    assert.equal(findBestAnswer('point équivalence', []), null);
  });
});
