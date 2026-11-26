import 'package:edulab_backoffice/main.dart';
import 'package:edulab_backoffice/core/auth/session.dart';
import 'package:edulab_backoffice/core/donnees/depot.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('connexion puis tableau de bord etablissement', (tester) async {
    tester.view.physicalSize = const Size(1440, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authentificationProvider.overrideWithValue(_FausseAuthentification()),
          depotProvider.overrideWithValue(DepotDemo()),
        ],
        child: const EduLabApp(),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Connexion'), findsWidgets);

    await tester.enterText(find.byType(TextFormField).first, 'a@b.tg');
    await tester.enterText(find.byType(TextFormField).at(1), 'secret');
    await tester.tap(find.text('Se connecter'));
    await tester.pumpAndSettle(const Duration(seconds: 1));

    expect(find.text('Mon établissement'), findsWidgets);
    expect(find.text('Gestion des comptes'), findsOneWidget);
  });
}

class _FausseAuthentification extends AuthentificationEdulab {
  @override
  Future<Session> connecter(String email, String motDePasse) async => Session(
        nom: 'Lycée Moderne',
        email: email,
        role: Role.etablissement,
        jeton: 'test',
      );
}
