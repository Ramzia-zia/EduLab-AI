// Écran : lib/features/laboratoire/ecran_laboratoire.dart
// Routes appelées : GET /experiences/{id}/pack (lu d'abord en local), POST /assistant,
// POST /tentatives/sync (en arrière-plan, via la file hors-ligne). Calculs : labo_core.
// États : chargement (pack), vide (n/a : le pack existe ou non), erreur (pack introuvable
// ou simulation indisponible, avec « Réessayer »).
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api_provisoire/modeles.dart';
import '../../core/reseau/reseau.dart';
import '../../core/routes/routes.dart';
import '../../core/theme/theme.dart';
import '../../core/widgets/vue_async.dart';
import '../experiences/etat_experiences.dart';
import 'definition.dart';
import 'etat_laboratoire.dart';
import 'widgets/carte_assistant.dart';
import 'widgets/zone_manipulation.dart';
import 'widgets/zone_materiel.dart';
import 'widgets/zone_resultat.dart';
import 'widgets/zone_securite.dart';

class EcranLaboratoire extends ConsumerWidget {
  const EcranLaboratoire({super.key, required this.experienceId});

  final String experienceId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Laboratoire'),
        leading: IconButton(
          tooltip: 'Retour aux expériences',
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go(Routes.experiences),
        ),
      ),
      body: SafeArea(
        child: VueAsync<ExperiencePack>(
          valeur: ref.watch(packProvider(experienceId)),
          onReessayer: () => ref.invalidate(packProvider(experienceId)),
          donnees: (pack) => _Corps(experienceId: experienceId, pack: pack),
        ),
      ),
    );
  }
}

class _Corps extends ConsumerStatefulWidget {
  const _Corps({required this.experienceId, required this.pack});

  final String experienceId;
  final ExperiencePack pack;

  @override
  ConsumerState<_Corps> createState() => _EtatCorps();
}

class _EtatCorps extends ConsumerState<_Corps>
    with SingleTickerProviderStateMixin {
  late final Ticker _ticker = createTicker(_tic);
  late final DefinitionExperience _definition =
      DefinitionExperience.depuisJson(widget.pack.definition);
  Duration _dernier = Duration.zero;

  LaboratoireNotifier get _labo =>
      ref.read(laboratoireProvider(widget.experienceId).notifier);

  void _tic(Duration ecoule) {
    final dt = (ecoule - _dernier).inMicroseconds / Duration.microsecondsPerSecond;
    _dernier = ecoule;
    _labo.avancer(dt);
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  Future<void> _terminer() async {
    final id = await _labo.terminer();
    if (id != null && mounted) context.go(Routes.resultat(id));
  }

  @override
  Widget build(BuildContext context) {
    final f = laboratoireProvider(widget.experienceId);

    // Le Ticker ne tourne que robinet ouvert : pas d'image inutile le reste du temps.
    ref.listen<double>(f.select((e) => e.niveauRobinet), (_, niveau) {
      if (niveau > 0 && !_ticker.isActive) {
        _dernier = Duration.zero;
        _ticker.start();
      } else if (niveau == 0 && _ticker.isActive) {
        _ticker.stop();
      }
    });

    final indisponible = ref.watch(f.select((e) => e.indisponible));
    if (indisponible != null) return EtatErreur(message: indisponible);

    final materiel = Consumer(builder: (context, ref, _) {
      final places = ref.watch(f.select((e) => e.materielPlace));
      final surveille = ref.watch(f.select((e) => e.exigeManquant));
      return ZoneMateriel(
        materiel: _definition.materiel,
        places: places,
        aSurveiller: surveille,
        onPlacer: _labo.placerMateriel,
      );
    });

    final securite = Consumer(builder: (context, ref, _) {
      return ZoneSecurite(message: ref.watch(f.select((e) => e.blocage)));
    });

    final manipulation = Consumer(builder: (context, ref, _) {
      return ZoneManipulation(
        niveau: ref.watch(f.select((e) => e.niveauRobinet)),
        volumeMl: ref.watch(f.select((e) => e.volumeVerseMl)),
        volumeMaxMl: ref.watch(f.select((e) => e.volumeMaxMl)),
        desactive: ref.watch(f.select((e) => e.termine)),
        onChoisir: _labo.choisirRobinet,
      );
    });

    final assistant = Consumer(builder: (context, ref, _) {
      return CarteAssistant(
        conseil: ref.watch(f.select((e) => e.conseil)),
        reponse: ref.watch(f.select((e) => e.reponseAssistant)),
        erreur: ref.watch(f.select((e) => e.erreurAssistant)),
        enCours: ref.watch(f.select((e) => e.assistantEnCours)),
        niveauIndice: ref.watch(f.select((e) => e.niveauIndice)),
        enLigne: ref.watch(enLigneProvider).valueOrNull ?? true,
        onDemander: _labo.demanderIndice,
      );
    });

    final resultat = Consumer(builder: (context, ref, _) {
      return ZoneResultat(
        volumeMl: ref.watch(f.select((e) => e.volumeVerseMl)),
        ph: ref.watch(f.select((e) => e.ph)),
        tempsS: ref.watch(f.select((e) => e.tempsS)),
        courbe: ref.watch(f.select((e) => e.courbe)),
        enCours: ref.watch(f.select((e) => e.niveauRobinet > 0)),
        termine: ref.watch(f.select((e) => e.termine)),
      );
    });

    final terminer = Consumer(builder: (context, ref, _) {
      final actif = ref.watch(f.select((e) => e.volumeVerseMl > 0 && !e.termine));
      return FilledButton(
        onPressed: actif ? _terminer : null,
        child: const Text('Terminer l\'expérience'),
      );
    });

    const ecart = SizedBox(height: Espace.x2);
    final compact = Largeur.depuis(context) == Largeur.compact;

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: Tailles.largeurContenu),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(Espace.x2),
          child: compact
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    materiel,
                    ecart,
                    securite,
                    ecart,
                    manipulation,
                    ecart,
                    assistant,
                    ecart,
                    resultat,
                    ecart,
                    terminer,
                  ],
                )
              : Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [materiel, ecart, securite, ecart, manipulation],
                      ),
                    ),
                    const SizedBox(width: Espace.x2),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [assistant, ecart, resultat, ecart, terminer],
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
