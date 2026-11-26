// Zone 1 : matériel. Pure présentation, sans dépendance au réseau ni à l'état global.
import 'package:flutter/material.dart';

import '../../../core/format.dart';
import '../../../core/theme/theme.dart';

class ZoneMateriel extends StatelessWidget {
  const ZoneMateriel({
    super.key,
    required this.materiel,
    required this.places,
    required this.onPlacer,
    this.aSurveiller,
  });

  final List<String> materiel;
  final Set<String> places;
  final ValueChanged<String> onPlacer;

  /// Pièce exigée par une règle de sécurité qui vient de bloquer une action.
  final String? aSurveiller;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Semantics(
      container: true,
      label: 'Zone matériel',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Semantics(
            header: true,
            child: Text('Matériel', style: theme.textTheme.titleMedium),
          ),
          const SizedBox(height: Espace.x1),
          Wrap(
            spacing: Espace.x1,
            runSpacing: Espace.x1,
            children: [
              for (final id in materiel)
                _Piece(
                  id: id,
                  place: places.contains(id),
                  alerte: aSurveiller == id,
                  onPlacer: onPlacer,
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Piece extends StatelessWidget {
  const _Piece({
    required this.id,
    required this.place,
    required this.alerte,
    required this.onPlacer,
  });

  final String id;
  final bool place;
  final bool alerte;
  final ValueChanged<String> onPlacer;

  @override
  Widget build(BuildContext context) {
    final libelle = libelleMateriel(id);
    final bordure = alerte
        ? Couleurs.rouge
        : place
            ? Couleurs.teal
            : Couleurs.bordure;
    return Semantics(
      button: true,
      selected: place,
      label: '$libelle, ${place ? 'placé' : 'à placer'}',
      excludeSemantics: true,
      child: Material(
        color: place ? Couleurs.fondTeal : Couleurs.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(Tailles.rayon),
          side: BorderSide(color: bordure, width: alerte ? Tailles.trait : Tailles.traitFin),
        ),
        child: InkWell(
          borderRadius: BorderRadius.circular(Tailles.rayon),
          onTap: place ? null : () => onPlacer(id),
          child: ConstrainedBox(
            constraints: const BoxConstraints(
              minHeight: Tailles.zoneTactile,
              minWidth: Tailles.zoneTactile,
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: Espace.x2),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    place ? Icons.check_circle_outline : Icons.add_circle_outline,
                    size: Tailles.icone,
                    color: Couleurs.teal,
                  ),
                  const SizedBox(width: Espace.x1),
                  Text(libelle, style: Theme.of(context).textTheme.labelLarge),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
