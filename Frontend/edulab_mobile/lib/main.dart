import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app.dart';
import 'core/api_provisoire/api.dart';
import 'core/config.dart';
import 'core/fournisseurs.dart';
import 'features/connexion/session_supabase.dart';
import 'features/horsligne/initialiser_stockage.dart'
    if (dart.library.io) 'features/horsligne/initialiser_stockage_io.dart'
    if (dart.library.js_interop) 'features/horsligne/initialiser_stockage_web.dart'
    as stockage;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(
    url: Config.urlSupabase,
    publishableKey: Config.cleAnonSupabase,
  );

  final depotLocal = await stockage.creerDepotLocal();
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
        depotLocalProvider.overrideWithValue(depotLocal),
      ],
      child: const EduLabApp(),
    ),
  );
}
