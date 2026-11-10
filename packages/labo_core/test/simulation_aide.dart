import 'dart:convert';
import 'dart:io';

import 'package:labo_core/labo_core.dart';

/// Charge definitions/<id>.json (les tests sont lancés depuis la racine du paquet).
DefinitionExperience definition(String id) => DefinitionExperience.fromJson(
    jsonDecode(File('definitions/$id.json').readAsStringSync())
        as Map<String, dynamic>);

Laboratoire charger(String id) => creerLaboratoire(definition(id));

/// Rejoue des actions d'élève : garde l'état courant et le journal des événements.
class Sim {
  Sim(this.labo) : etat = labo.etatInitial();

  final Laboratoire labo;
  EtatLabo etat;
  final List<Evenement> journal = [];
  int _secondes = 0;

  ResultatAction faire(String action,
      [Map<String, Object?> valeurs = const {}]) {
    final r = labo.appliquer(
      etat,
      action,
      valeurs,
      DateTime.utc(2026, 11, 8, 7, 30).add(Duration(seconds: _secondes++)),
    );
    etat = r.etat;
    journal.add(r.evenement);
    return r;
  }

  ResultatAction placer(String id, [String? emplacement]) =>
      faire('placer_materiel', {
        'materiel_id': id,
        if (emplacement != null) 'emplacement_id': emplacement,
      });

  ResultatAction mesurer(String grandeur, Object valeur, String unite) => faire(
      'mesurer', {'grandeur_id': grandeur, 'valeur': valeur, 'unite': unite});

  void avancer(double s) => etat = labo.avancer(etat, s);

  List<String> get conseils =>
      labo.conseilsActifs(etat).map((c) => c.quand).toList();
  List<String> get erreurs => labo.erreursBilan(etat);
}
