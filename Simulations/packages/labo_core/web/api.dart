// Pont entre labo_core et la page de démonstration (navigateur).
// Toute la physique reste dans labo_core : la page (JavaScript) ne fait que dessiner et envoyer
// les actions de l'élève. Compilation : dart compile js -O2 web/api.dart -o demo/labo_core.js
import 'dart:convert';
import 'dart:js_interop';
import 'dart:js_interop_unsafe';
import 'dart:math' as math;

import 'package:labo_core/labo_core.dart';

Laboratoire? _labo;
EtatLabo? _etat;

Map<String, Object?> _meta(Laboratoire l) {
  final options = <String, Object?>{};
  final lab = l;
  if (lab is LaboElectricite) {
    options['calibre_a'] = lab.parametres.calibresAmperemetreA;
    options['calibre_v'] = lab.parametres.calibresVoltmetreV;
    options['tension_max_v'] = lab.parametres.tensionMaxV;
  } else if (lab is LaboOscilloscope) {
    options['sensibilites'] = lab.parametres.sensibilitesVParDiv;
    options['bases_temps'] = lab.parametres.basesTempsSParDiv;
    options['frequence_min_hz'] = lab.parametres.frequenceMinHz;
    options['frequence_max_hz'] = lab.parametres.frequenceMaxHz;
    options['tension_max_v'] = lab.parametres.tensionMaxV;
    options['demi_hauteur_div'] = lab.parametres.demiHauteurEcranDiv;
    options['largeur_div'] = lab.parametres.largeurEcranDiv;
  } else if (lab is LaboOptique) {
    options['longueur_banc_cm'] = lab.parametres.longueurBancCm;
  } else if (lab is LaboMigration) {
    options['calibre_a'] = lab.parametres.calibresAmperemetreA;
    options['rheostat_max_ohm'] = lab.parametres.rheostatMaxOhm;
    options['tension_max_v'] = lab.parametres.tensionMaxV;
  }
  return {
    'id': l.definition.id,
    'materiel': l.definition.materiel,
    'actions': l.actions.toList()..sort(),
    'grandeurs': l.grandeursMesurables.toList()..sort(),
    'emplacements': {
      for (final e in l.emplacementsAutorises.entries)
        e.key: e.value.toList()..sort(),
    },
    'options': options,
  };
}

Map<String, Object?> _vue(Laboratoire l, EtatLabo e) {
  final vue = <String, Object?>{
    'rang': e.rang,
    'termine': e.termine,
    'tempsS': e.tempsS,
    'materiel': e.materiel,
    'reglages': e.reglages,
    'mesures': [
      for (final m in e.mesures)
        {'grandeur': m.grandeurId, 'saisie': m.saisie, 'unite': m.unite},
    ],
    'conseils': [
      for (final c in l.conseilsActifs(e))
        {'quand': c.quand, 'niveau': c.niveau.name, 'message': c.message},
    ],
    'erreurs': l.erreursBilan(e),
    'resultat': l.resultat(e),
  };
  final lab = l;
  if (lab is LaboElectricite) {
    final appareils = <String, Object?>{};
    for (final id in e.materiel.keys) {
      final r = lab.lectureAppareil(e, id);
      if (r.valeur == null) continue;
      appareils[id] = {
        'valeur': r.valeur,
        'affichage': r.affichage,
        'aiguilleDiv': r.aiguilleDiv,
        'horsEchelle': r.horsEchelle,
        'sensInverse': r.sensInverse,
        'calibre': e.nombre('calibre_$id'),
        'emplacement': e.materiel[id],
      };
    }
    vue['appareils'] = appareils;
  } else if (lab is LaboOscilloscope) {
    final a = lab.affichage(e);
    final sv = e.nombre('sensibilite_v_par_div')!;
    final sb = e.nombre('base_temps_s_par_div')!;
    final f = e.nombre('frequence_gbf_hz')!;
    final trace = <List<double>>[];
    if (!a.signalPresent) {
      trace.addAll([
        [0.0, 0.0],
        [lab.parametres.largeurEcranDiv, 0.0],
      ]);
    } else if (a.source == 'alimentation') {
      trace.addAll([
        [0.0, a.deviationDiv],
        [lab.parametres.largeurEcranDiv, a.deviationDiv],
      ]);
    } else {
      for (var i = 0; i <= 400; i++) {
        final x = i * lab.parametres.largeurEcranDiv / 400;
        trace.add([
          x,
          tensionSinusoidaleV(
                valeurMaximaleV: a.amplitudeV,
                frequenceHz: f,
                tempsS: x * sb,
              ) /
              sv,
        ]);
      }
    }
    vue['ecran'] = {
      'source': a.source,
      'couplage': a.couplage,
      'signalPresent': a.signalPresent,
      'amplitudeV': a.amplitudeV,
      'deviationDiv': a.deviationDiv,
      'divisionsParPeriode': a.divisionsParPeriode,
      'traceVisible': a.traceVisible,
      'trace': trace,
    };
  } else if (lab is LaboOptique) {
    final a = lab.affichage(e);
    vue['banc'] = {
      'oaCm': a.oaCm,
      'oaPrimeCm': a.oaPrimeCm,
      'positionImageCm': a.positionImageCm,
      'nette': a.nette,
      'objet': e.materiel.containsKey('objet_lumineux')
          ? e.nombre('position_objet_lumineux_cm')
          : null,
      'lentille': e.materiel.containsKey('lentille_convergente')
          ? e.nombre('position_lentille_convergente_cm')
          : null,
      'ecran': e.materiel.containsKey('ecran')
          ? e.nombre('position_ecran_cm')
          : null,
      'miroir': e.materiel['miroir_plan'] == 'derriere_lentille',
    };
  } else if (lab is LaboDosage) {
    final a = lab.affichage(e);
    vue['dosage'] = {
      'volumeMl': a.volumeVerseMl,
      'ph': a.ph,
      'couleur': a.couleur,
      'debit': a.debit,
      'volumeAcideMl': e.nombre('volume_acide_ml') ?? 0.0,
      'soude': e.materiel.containsKey('soude'),
      'burette': e.materiel.containsKey('burette'),
      'erlenmeyer': e.materiel.containsKey('erlenmeyer'),
      'lunettes': e.materiel.containsKey('lunettes'),
      'buretteMl': lab.parametres.buretteMl,
    };
  } else if (lab is LaboOsmose) {
    vue['tubes'] = {
      for (final t in LaboOsmose.tubes)
        t: {
          'solution': e.materiel[t],
          'longueurCm': lab.longueurMoyenneCm(e, t),
          'tranches': e.nombre('debut_$t') != null,
        },
    };
  } else if (lab is LaboSol) {
    vue['bocal'] = {
      'terre': e.materiel.containsKey('terre'),
      'eau': e.materiel.containsKey('eau'),
      'agitationS': e.nombre('agitation_s') ?? 0.0,
      'fraction': lab.fraction(e),
      'sable': lab.hauteurCouchesCm(e, 'sable'),
      'limon': lab.hauteurCouchesCm(e, 'limon'),
      'argile': lab.hauteurCouchesCm(e, 'argile'),
    };
  } else if (lab is LaboMigration) {
    final a = lab.affichage(e);
    vue['papier'] = {
      'courantA': a.courantA,
      'positionCuivre': a.positionCuivre,
      'positionPermanganate': a.positionPermanganate,
      'aiguilleDiv': a.aiguilleDiv,
      'horsEchelle': a.horsEchelle,
      'cuivreDepose': e.materiel.containsKey('cristal_sulfate_cuivre'),
      'permanganateDepose': e.materiel.containsKey('cristal_permanganate'),
      'electrodeA': e.materiel['electrode_a'],
      'electrodeB': e.materiel['electrode_b'],
    };
  }
  return vue;
}

String _reponse(Map<String, Object?> corps) => jsonEncode(corps);

String _creer(String definitionJson) {
  final d = DefinitionExperience.fromJson(
    jsonDecode(definitionJson) as Map<String, dynamic>,
  );
  final labo = creerLaboratoire(d);
  _labo = labo;
  _etat = labo.etatInitial();
  return _reponse({'meta': _meta(labo), 'vue': _vue(labo, _etat!)});
}

String _appliquer(String action, String valeursJson, String horodatage) {
  final labo = _labo!;
  try {
    final r = labo.appliquer(
      _etat!,
      action,
      Map<String, Object?>.from(jsonDecode(valeursJson) as Map),
      DateTime.parse(horodatage).toUtc(),
    );
    _etat = r.etat;
    return _reponse({
      'bloquee': r.bloquee,
      'message': r.message,
      'evenement': r.evenement.toJson(),
      'vue': _vue(labo, _etat!),
    });
  } on ArgumentError catch (e) {
    return _reponse({
      'erreurInterface': e.toString(),
      'vue': _vue(labo, _etat!),
    });
  } on StateError catch (e) {
    return _reponse({'erreurInterface': e.message, 'vue': _vue(labo, _etat!)});
  }
}

String _avancer(double secondes) {
  final labo = _labo!;
  try {
    _etat = labo.avancer(_etat!, math.max(0.0, secondes));
    return _reponse({'vue': _vue(labo, _etat!)});
  } on ArgumentError catch (e) {
    return _reponse({
      'erreurInterface': e.toString(),
      'vue': _vue(labo, _etat!),
    });
  }
}

void main() {
  final api = JSObject();
  api.setProperty('creer'.toJS, ((JSString d) => _creer(d.toDart).toJS).toJS);
  api.setProperty(
    'appliquer'.toJS,
    ((JSString a, JSString v, JSString t) => _appliquer(
          a.toDart,
          v.toDart,
          t.toDart,
        ).toJS).toJS,
  );
  api.setProperty(
    'avancer'.toJS,
    ((JSNumber s) => _avancer(s.toDartDouble).toJS).toJS,
  );
  globalContext.setProperty('LaboCore'.toJS, api);
}
