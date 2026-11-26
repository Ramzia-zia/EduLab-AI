// Stub Android/iOS : IframeLaboratoire n'est jamais instancié sur ces plateformes
// (ecran_laboratoire.dart affiche _NonDisponibleMobile à la place).
import 'package:flutter/widgets.dart';

class IframeLaboratoire extends StatelessWidget {
  const IframeLaboratoire({
    super.key,
    required this.experienceId,
    required this.onComplete,
  });

  final String experienceId;
  final ValueChanged<String> onComplete;

  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}
