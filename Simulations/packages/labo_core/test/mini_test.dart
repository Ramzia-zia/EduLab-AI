// Petit lanceur de tests sans dépendance (pub.dev n'est pas toujours joignable).
// Même forme que package:test : dans le dépôt, remplace
//   import 'mini_test.dart';
// par
//   import 'package:test/test.dart';
// et ajoute `test: ^1.25.0` dans dev_dependencies. Rien d'autre à changer,
// sauf l'appel final à resumerEtSortir() dans tous_test.dart.
import 'dart:io';

final List<String> _pile = [];
final List<String> _echecs = [];
int _reussis = 0;

void group(String nom, void Function() corps) {
  _pile.add(nom);
  try {
    corps();
  } finally {
    _pile.removeLast();
  }
}

void test(String nom, void Function() corps) {
  final complet = [..._pile, nom].join(' > ');
  try {
    corps();
    _reussis++;
  } catch (e) {
    _echecs.add('$complet : $e');
  }
}

class Matcher {
  const Matcher(this.ok, this.description);
  final bool Function(Object? valeur) ok;
  final String description;
}

void expect(Object? obtenu, Matcher m) {
  if (!m.ok(obtenu)) throw 'attendu ${m.description}, obtenu $obtenu';
}

Matcher closeTo(num attendu, num delta) => Matcher(
      (v) => v is num && (v - attendu).abs() <= delta,
      'proche de $attendu (±$delta)',
    );

Matcher equals(Object? attendu) =>
    Matcher((v) => v == attendu, 'égal à $attendu');

const Matcher isTrue = Matcher(_estVrai, 'vrai');
const Matcher isFalse = Matcher(_estFaux, 'faux');
const Matcher isNull = Matcher(_estNul, 'null');
const Matcher isNotNull = Matcher(_nEstPasNul, 'non null');
const Matcher throwsArgumentError =
    Matcher(_leveArgumentError, 'une ArgumentError');

const Matcher throwsStateError = Matcher(_leveStateError, 'une StateError');

bool _estVrai(Object? v) => v == true;
bool _estFaux(Object? v) => v == false;
bool _estNul(Object? v) => v == null;
bool _nEstPasNul(Object? v) => v != null;
bool _leveArgumentError(Object? v) {
  if (v is! Function) return false;
  try {
    v();
  } on ArgumentError {
    return true;
  } catch (_) {
    return false;
  }
  return false;
}

bool _leveStateError(Object? v) {
  if (v is! Function) return false;
  try {
    v();
  } on StateError {
    return true;
  } catch (_) {
    return false;
  }
  return false;
}

Matcher lessThan(num seuil) =>
    Matcher((v) => v is num && v < seuil, 'inférieur à $seuil');

Matcher greaterThan(num seuil) =>
    Matcher((v) => v is num && v > seuil, 'supérieur à $seuil');

/// Affiche le bilan et termine le programme avec le bon code de sortie.
void resumerEtSortir() {
  for (final e in _echecs) {
    stdout.writeln('ECHEC  $e');
  }
  stdout.writeln('$_reussis tests réussis, ${_echecs.length} échecs.');
  exit(_echecs.isEmpty ? 0 : 1);
}
