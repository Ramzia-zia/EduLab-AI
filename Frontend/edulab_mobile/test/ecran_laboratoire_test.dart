import 'package:edulab_mobile/features/laboratoire/ecran_laboratoire.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('affiche l’indisponibilité des simulations hors navigateur',
      (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: EcranLaboratoire(experienceId: 'focale_lentille'),
      ),
    );

    expect(
      find.text('Simulation disponible sur le web uniquement'),
      findsOneWidget,
    );
    expect(find.text('Matériel'), findsNothing);
    expect(find.text('Manipulations'), findsNothing);
    expect(find.text('Mes observations'), findsNothing);
  });
}
