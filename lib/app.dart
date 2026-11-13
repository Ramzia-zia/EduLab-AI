import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/routes/routes.dart';
import 'core/theme/theme.dart';
import 'features/horsligne/etat_sync.dart';

class EduLabApp extends ConsumerWidget {
  const EduLabApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.watch(syncAutomatiqueProvider);
    return MaterialApp.router(
      title: 'EduLab AI',
      debugShowCheckedModeBanner: false,
      theme: construireTheme(),
      routerConfig: ref.watch(routeurProvider),
      locale: const Locale('fr'),
      supportedLocales: const [Locale('fr')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
    );
  }
}
