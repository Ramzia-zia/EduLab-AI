import 'dart:convert';
import 'dart:js_interop';
import 'dart:ui_web' as ui_web;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import 'package:web/web.dart' as web;

import '../../core/api_provisoire/modeles.dart';
import '../../core/fournisseurs.dart';
import '../experiences/etat_experiences.dart';

const _identifiantsLaboratoires = {
  'focale_lentille',
  'lois_courant',
  'lois_tensions',
  'mesure_intensite',
  'mesure_tension_masse',
  'migration_ions',
  'oscilloscope_tension',
  'osmose_pomme_de_terre',
  'sol_constituants',
  'titrage_acide_base',
};

class IframeLaboratoire extends ConsumerStatefulWidget {
  const IframeLaboratoire({
    super.key,
    required this.experienceId,
    required this.onComplete,
  });

  final String experienceId;
  final ValueChanged<String> onComplete;

  @override
  ConsumerState<IframeLaboratoire> createState() => _IframeLaboratoireState();
}

class _IframeLaboratoireState extends ConsumerState<IframeLaboratoire> {
  static const _uuid = Uuid();
  static int _prochainViewId = 0;

  late final String _viewId;
  late final JSFunction _messageListener;
  web.HTMLIFrameElement? _iframe;
  Future<void> _fileMessages = Future.value();
  final Map<String, _TentativeSimulation> _tentatives = {};
  String? _erreur;

  @override
  void initState() {
    super.initState();
    _viewId = 'labo-iframe-${_prochainViewId++}';
    if (!_identifiantsLaboratoires.contains(widget.experienceId)) {
      _erreur = 'Cette simulation n’existe pas dans le catalogue.';
    }

    _messageListener = ((web.Event event) {
      final messageEvent = event as web.MessageEvent;
      if (messageEvent.origin != web.window.location.origin ||
          !identical(messageEvent.source, _iframe?.contentWindow)) {
        return;
      }
      final Object? data = messageEvent.data;
      if (data is! JSString) return;
      try {
        final message = jsonDecode(data.toDart);
        if (message is! Map<String, dynamic> ||
            message['source'] != 'edulab-laboratoire') {
          return;
        }
        _enfilerMessage(message);
      } on FormatException catch (error) {
        _afficherErreur('Message de simulation invalide : ${error.message}');
      }
    }).toJS;
    web.window.addEventListener('message', _messageListener);

    ui_web.platformViewRegistry.registerViewFactory(_viewId, (int viewId) {
      final iframe =
          web.document.createElement('iframe') as web.HTMLIFrameElement;
      iframe.src = _identifiantsLaboratoires.contains(widget.experienceId)
          ? _urlLaboratoire
          : 'about:blank';
      iframe.title = 'Simulation ${widget.experienceId}';
      iframe.style.display = 'block';
      iframe.style.border = 'none';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.setAttribute('allow', 'fullscreen');
      _iframe = iframe;
      return iframe;
    });
  }

  @override
  void didUpdateWidget(covariant IframeLaboratoire oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.experienceId == widget.experienceId) return;
    _tentatives.clear();
    final disponible = _identifiantsLaboratoires.contains(widget.experienceId);
    _erreur =
        disponible ? null : 'Cette simulation n’existe pas dans le catalogue.';
    _iframe?.src = disponible ? _urlLaboratoire : 'about:blank';
  }

  String get _urlLaboratoire =>
      'labos/index.html#${Uri.encodeComponent(widget.experienceId)}';

  void _enfilerMessage(Map<String, dynamic> message) {
    _fileMessages = _fileMessages
        .then((_) => _traiterMessage(message))
        .catchError((Object error) {
      _afficherErreur('La tentative n’a pas pu être enregistrée : $error');
    });
  }

  Future<void> _traiterMessage(Map<String, dynamic> message) async {
    final type = message['type'];
    final runId = message['run_id'];
    final experienceId = message['experience_id'];
    if (runId is! String ||
        runId.isEmpty ||
        experienceId != widget.experienceId) {
      throw const FormatException('Identifiant de simulation incorrect.');
    }

    final depot = ref.read(depotLocalProvider);
    if (type == 'demarree') {
      if (_tentatives.containsKey(runId)) return;
      final debut = _date(message['debut_le']);
      final tentative = Tentative(
        id: _uuid.v4(),
        experienceId: widget.experienceId,
        versionExperience: 1,
        debut: debut,
        statut: 'en_cours',
      );
      await depot.creerTentative(tentative);
      _tentatives[runId] = _TentativeSimulation(tentative.id);
      return;
    }

    final tentative = _tentatives[runId];
    if (tentative == null) {
      throw const FormatException(
          'La simulation n’a pas envoyé son démarrage.');
    }

    if (type == 'action') {
      final action = message['action'];
      final valeurs = message['valeurs'];
      if (action is! String || valeurs is! Map) {
        throw const FormatException('Action de simulation mal formée.');
      }
      final rang = await depot.prochainRang(tentative.id);
      await depot.ajouterEvenement(EvenementTentative(
        id: _uuid.v4(),
        tentativeId: tentative.id,
        rang: rang,
        horodatage: _date(message['horodatage']),
        action: action,
        valeurs: valeurs.cast<String, dynamic>(),
      ));
      return;
    }

    if (type == 'terminee') {
      if (tentative.terminee) return;
      final resultat = message['resultat'];
      if (resultat is! Map) {
        throw const FormatException('Compte rendu de simulation mal formé.');
      }
      final score = message['score'];
      await depot.terminerTentative(
        id: tentative.id,
        fin: _date(message['fin_le']),
        statut: 'terminee',
        score: score is num ? score.round() : null,
        resultat: resultat.cast<String, dynamic>(),
      );
      tentative.terminee = true;
      await ref.read(serviceSyncProvider).envoyerTout();
      if (mounted) {
        ref.invalidate(resumesProvider);
        widget.onComplete(tentative.id);
      }
      return;
    }

    throw FormatException('Type de message de simulation inconnu : $type');
  }

  DateTime _date(Object? value) {
    if (value is! String) {
      throw const FormatException('Date absente du message de simulation.');
    }
    return DateTime.parse(value).toUtc();
  }

  void _afficherErreur(String message) {
    if (mounted) setState(() => _erreur = message);
  }

  @override
  void dispose() {
    web.window.removeEventListener('message', _messageListener);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        HtmlElementView(viewType: _viewId),
        if (_erreur != null)
          Align(
            alignment: Alignment.topCenter,
            child: Material(
              color: Theme.of(context).colorScheme.errorContainer,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Text(
                  _erreur!,
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onErrorContainer,
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _TentativeSimulation {
  _TentativeSimulation(this.id);

  final String id;
  bool terminee = false;
}
