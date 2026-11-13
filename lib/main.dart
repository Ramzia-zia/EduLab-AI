import 'dart:io';

import 'package:drift/native.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app.dart';
import 'core/api_provisoire/api.dart';
import 'core/config.dart';
import 'core/fournisseurs.dart';
import 'features/connexion/session_supabase.dart';
import 'features/horsligne/base_locale.dart';
import 'features/horsligne/depot_drift.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(
    url: Config.urlSupabase,
    publishableKey: Config.cleAnonSupabase,
  );

  final dossier = await getApplicationDocumentsDirectory();
  final base = BaseLocale(
    NativeDatabase.createInBackground(File(p.join(dossier.path, 'edulab.sqlite'))),
  );
  final session = SessionSupabase(Supabase.instance.client.auth);
  final api = ClientApiProvisoire(
    urlBase: Config.urlApi,
    jeton: () => session.jeton,
  );

  runApp(
    ProviderScope(
      overrides: [
        depotSessionProvider.overrideWithValue(session),
        apiProvider.overrideWithValue(api),
        depotLocalProvider.overrideWithValue(DepotDrift(base)),
      ],
      child: const EduLabApp(),
    ),
  );
}
