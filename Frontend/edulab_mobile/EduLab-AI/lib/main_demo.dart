// Lancement de démonstration : aucune base, aucun serveur, aucune clé.
//   flutter run -t lib/main_demo.dart -d chrome
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';
import 'core/fournisseurs.dart';
import 'core/labo/moteur.dart';
import 'demo/faux_serveur_demo.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    ProviderScope(
      overrides: [
        depotSessionProvider.overrideWithValue(SessionDemo()),
        apiProvider.overrideWithValue(ApiDemo()),
        depotLocalProvider.overrideWithValue(DepotDemo()),
        moteurTitrageProvider.overrideWithValue(const MoteurDemo()),
      ],
      child: const EduLabApp(),
    ),
  );
}
