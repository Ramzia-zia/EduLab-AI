import 'package:edulab_backoffice/features/comptes/import_csv.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('accepte un CSV valide et refuse les lignes incorrectes', () {
    const csv = 'nom,role,classe,email\n'
        'Koffi Dossou,eleve,Tle D,koffi@csi.tg\n'
        'Mensah Komlan,enseignant,,mensah@csi.tg\n'
        'Sans Email,eleve,Tle D,pas_un_email\n'
        'Doublon,eleve,Tle D,koffi@csi.tg\n';
    final a = analyserCsv(csv);
    expect(a.entete_invalide, isFalse);
    expect(a.valides.length, 2);
    expect(a.refusees.map((l) => l.ligne), [4, 5]);
    expect(a.refusees.first.code, 'donnees_invalides');
    expect(a.refusees.last.code, 'conflit');
  });

  test('refuse un en-tete incorrect', () {
    final a = analyserCsv('prenom,role,classe,email\nA,eleve,,a@b.tg');
    expect(a.entete_invalide, isTrue);
    expect(a.valides, isEmpty);
  });
}
