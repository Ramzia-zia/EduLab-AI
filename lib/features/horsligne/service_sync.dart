import '../../core/api_provisoire/api.dart';
import '../../core/api_provisoire/modeles.dart';
import 'depot_local.dart';

class ResumeSync {
  const ResumeSync(this.envoyes, {this.interrompu = false});

  /// Lignes que le serveur a traitées (acceptées, déjà reçues ou refusées).
  final int envoyes;

  /// true si l'envoi s'est arrêté avant la fin (réseau coupé, erreur serveur).
  final bool interrompu;
}

/// Envoie la file locale par lots de 50 éléments au plus (CONTRAT.md chapitre 4).
class ServiceSync {
  ServiceSync(this._depot, this._api, {this.tailleLot = tailleLotContrat})
      : assert(tailleLot > 0 && tailleLot <= tailleLotContrat);

  static const tailleLotContrat = 50;

  final DepotLocal _depot;
  final ApiEdulab _api;
  final int tailleLot;
  bool _enCours = false;

  Future<ResumeSync> envoyerTout() async {
    if (_enCours) return const ResumeSync(0);
    _enCours = true;
    var total = 0;
    try {
      while (true) {
        final elements = await _depot.enAttente(tailleLot);
        if (elements.isEmpty) return ResumeSync(total);

        final lot = SyncLot(
          tentatives: [
            for (final e in elements)
              if (e is ElementTentative) e.tentative,
          ],
          evenements: [
            for (final e in elements)
              if (e is ElementEvenement) e.evenement,
          ],
        );

        final List<ResultatSync> resultats;
        try {
          resultats = await _api.sync(lot);
        } on ErreurReseau {
          return ResumeSync(total, interrompu: true);
        } on ErreurApi {
          return ResumeSync(total, interrompu: true);
        }

        final appliques = await _depot.appliquer(resultats);
        // Garde-fou : une réponse qui ne couvre aucun élément ne doit pas boucler.
        if (appliques == 0) return ResumeSync(total, interrompu: true);
        total += appliques;
      }
    } finally {
      _enCours = false;
    }
  }
}
