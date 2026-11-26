// Format attendu (CONTRAT.md, modele ImportReponse) :
// colonnes nom, role, classe, email, en-tete obligatoire, UTF-8.
import '../../core/donnees/modeles_provisoires.dart';

class LigneRefusee {
  const LigneRefusee({required this.ligne, required this.code});
  final int ligne;
  final String code;
}

class AnalyseCsv {
  const AnalyseCsv({required this.valides, required this.refusees, this.entete_invalide = false});
  final List<Compte> valides;
  final List<LigneRefusee> refusees;
  final bool entete_invalide;
}

const entete_csv = ['nom', 'role', 'classe', 'email'];

AnalyseCsv analyserCsv(String contenu) {
  final lignes = contenu
      .replaceAll('\r\n', '\n')
      .split('\n')
      .map((l) => l.trim())
      .toList();
  while (lignes.isNotEmpty && lignes.last.isEmpty) {
    lignes.removeLast();
  }
  if (lignes.isEmpty) {
    return const AnalyseCsv(valides: [], refusees: [], entete_invalide: true);
  }
  final entete = lignes.first
      .replaceFirst('﻿', '')
      .split(',')
      .map((c) => c.trim().toLowerCase())
      .toList();
  if (entete.length != entete_csv.length ||
      !List.generate(entete_csv.length, (i) => entete[i] == entete_csv[i])
          .every((b) => b)) {
    return const AnalyseCsv(valides: [], refusees: [], entete_invalide: true);
  }
  final valides = <Compte>[];
  final refusees = <LigneRefusee>[];
  final emails = <String>{};
  for (var i = 1; i < lignes.length; i++) {
    final numero = i + 1;
    final colonnes = lignes[i].split(',').map((c) => c.trim()).toList();
    if (colonnes.length != 4) {
      refusees.add(LigneRefusee(ligne: numero, code: 'donnees_invalides'));
      continue;
    }
    final nom = colonnes[0];
    final role = colonnes[1].toLowerCase();
    final classe = colonnes[2];
    final email = colonnes[3].toLowerCase();
    final roleValide = role == 'eleve' || role == 'enseignant';
    if (nom.isEmpty || !roleValide || !email.contains('@')) {
      refusees.add(LigneRefusee(ligne: numero, code: 'donnees_invalides'));
      continue;
    }
    if (!emails.add(email)) {
      refusees.add(LigneRefusee(ligne: numero, code: 'conflit'));
      continue;
    }
    valides.add(Compte(
      id: 'import_$numero',
      nom: nom,
      email: email,
      role: role,
      classe: classe.isEmpty ? null : classe,
    ));
  }
  return AnalyseCsv(valides: valides, refusees: refusees);
}
