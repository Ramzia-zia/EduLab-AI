// Lecture typée de experience.definition (CONTRAT.md chapitre 6).
class RegleSecurite {
  const RegleSecurite({
    required this.regleId,
    required this.avant,
    required this.exige,
    required this.message,
  });

  final String regleId;
  final String avant;
  final String exige;
  final String message;
}

class Conseil {
  const Conseil({required this.quand, required this.niveau, required this.message});

  final String quand;
  final String niveau;
  final String message;
}

class DefinitionExperience {
  const DefinitionExperience({
    required this.materiel,
    required this.securite,
    required this.conseils,
    required this.calcul,
  });

  final List<String> materiel;
  final List<RegleSecurite> securite;
  final List<Conseil> conseils;
  final String calcul;

  factory DefinitionExperience.depuisJson(Map<String, dynamic> j) =>
      DefinitionExperience(
        materiel: [for (final m in (j['materiel'] as List? ?? [])) m as String],
        securite: [
          for (final r in (j['securite'] as List? ?? []))
            RegleSecurite(
              regleId: (r as Map)['regle_id'] as String,
              avant: r['avant'] as String,
              exige: r['exige'] as String,
              message: r['message'] as String,
            ),
        ],
        conseils: [
          for (final c in (j['conseils'] as List? ?? []))
            Conseil(
              quand: (c as Map)['quand'] as String,
              niveau: c['niveau'] as String,
              message: c['message'] as String,
            ),
        ],
        calcul: j['calcul'] as String? ?? '',
      );
}
