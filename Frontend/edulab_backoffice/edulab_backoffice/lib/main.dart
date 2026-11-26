import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/routes/routeur.dart';
import 'core/theme/theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(
    url: const String.fromEnvironment('URL_SUPABASE'),
    publishableKey: const String.fromEnvironment('CLE_ANON_SUPABASE'),
  );
  runApp(const ProviderScope(child: EduLabApp()));
}

class EduLabApp extends ConsumerWidget {
  const EduLabApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'EduLab AI',
      debugShowCheckedModeBanner: false,
      theme: construireTheme(),
      routerConfig: ref.watch(routeurProvider),
    );
  }
}
