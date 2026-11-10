import 'dart:io';

import 'mini_test.dart';
import 'simulation_aide.dart';

/// Codes d'erreur du bilan que chaque expérience peut produire (contrat, chapitre 5).
const _codes = {
  'mesure_intensite': [
    'amperemetre_en_derivation',
    'court_circuit_generateur',
    'grand_calibre_oublie',
    'calibre_trop_petit',
    'lecture_cadran',
  ],
  'lois_courant': [
    'amperemetre_en_derivation',
    'court_circuit_generateur',
    'grand_calibre_oublie',
    'calibre_trop_petit',
    'lecture_cadran',
  ],
  'mesure_tension_masse': [
    'voltmetre_en_serie',
    'court_circuit_generateur',
    'grand_calibre_oublie',
    'calibre_trop_petit',
    'lecture_cadran',
  ],
  'lois_tensions': [
    'voltmetre_en_serie',
    'court_circuit_generateur',
    'grand_calibre_oublie',
    'calibre_trop_petit',
    'lecture_cadran',
  ],
  'oscilloscope_tension': [
    'masse_oscilloscope_oubliee',
    'trace_hors_ecran',
    'lecture_oscillogramme',
    'confusion_maximale_efficace',
  ],
  'focale_lentille': [
    'distance_objet_ecran_trop_petite',
    'image_non_nette',
    'signe_distance_algebrique',
  ],
  'migration_ions': [
    'gants_oublies',
    'court_circuit_generateur',
    'grand_calibre_oublie',
    'electrode_inversee',
  ],
};

// Valeurs et réponses qu'aucun skill ne doit contenir : le corrigé n'est jamais envoyé à l'IA.
const _interdits = [
  '0,024',
  '0.024',
  '24 div',
  '2,4 V',
  '3,6 V',
  '2.4 V',
  '3.6 V',
  '2,7 V',
  '15 cm',
  '6,67',
  '6.67',
  '200 Hz',
  '4,24',
  '4.24',
  'vers la cathode',
  'vers l\'anode',
  'c\'est la loi d\'unicité',
  'est égale à la somme',
];

void main() {
  group('skills de l\'assistant (un fichier .md par labo)', () {
    for (final entree in _codes.entries) {
      final id = entree.key;
      test('$id : skill présent, complet, sans corrigé', () {
        final f = File('skills/$id.md');
        expect(f.existsSync(), isTrue);
        final t = f.readAsStringSync();
        expect(t.startsWith('---\nname: $id\n'), isTrue);
        for (final section in [
          '## Garde-fous',
          '## Objectifs du TP',
          '## Matériel',
          '## Sécurité',
          '## Interdit de révéler',
          '## Erreurs détectées',
          '## Limites de la simulation',
        ]) {
          expect(t.contains(section), isTrue);
        }
        for (final code in entree.value) {
          expect(t.contains('### `$code`'), isTrue);
        }
        for (final m in _interdits) {
          expect(t.contains(m), isFalse);
        }
      });

      test(
          '$id : le skill reprend toutes les règles de sécurité et tous les conseils du JSON',
          () {
        final t = File('skills/$id.md').readAsStringSync();
        final d = definition(id);
        for (final r in d.securite) {
          expect(t.contains(r.message), isTrue);
        }
        for (final c in d.conseils) {
          expect(t.contains(c.message), isTrue);
        }
        for (final m in d.materiel) {
          expect(t.contains('`$m`'), isTrue);
        }
      });
    }
  });
}
