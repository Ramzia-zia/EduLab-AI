/// Affichage seulement : la virgule décimale n'existe jamais dans les données.
String formaterNombre(double valeur, int decimales) =>
    valeur.toStringAsFixed(decimales).replaceAll('.', ',');

String formaterDate(DateTime date) {
  final d = date.toLocal();
  String deux(int n) => n.toString().padLeft(2, '0');
  return '${deux(d.day)}/${deux(d.month)}/${d.year} ${deux(d.hour)}:${deux(d.minute)}';
}

String libelleMatiere(String matiere) => switch (matiere) {
      'physique' => 'Physique',
      'chimie' => 'Chimie',
      'svt' => 'SVT',
      'genie_civil' => 'Génie civil',
      _ => matiere,
    };

String libelleDifficulte(String difficulte) => switch (difficulte) {
      'facile' => 'Facile',
      'moyen' => 'Moyen',
      'difficile' => 'Difficile',
      _ => difficulte,
    };

String libelleEtat(String etat) => switch (etat) {
      'a_commencer' => 'À commencer',
      'en_cours' => 'En cours',
      'termine' => 'Terminé',
      _ => etat,
    };

String libelleStatutTentative(String statut) => switch (statut) {
      'en_cours' => 'En cours',
      'terminee' => 'Terminée',
      'abandonnee' => 'Abandonnée',
      _ => statut,
    };

const _libellesMateriel = {
  'lunettes': 'Lunettes',
  'gants': 'Gants',
  'burette': 'Burette',
  'soude': 'Soude',
  'erlenmeyer': 'Erlenmeyer',
  'becher': 'Bécher',
  'pipette': 'Pipette',
  'phenolphtaleine': 'Phénolphtaléine',
};

String libelleMateriel(String id) {
  final connu = _libellesMateriel[id];
  if (connu != null) return connu;
  final texte = id.replaceAll('_', ' ');
  return texte.isEmpty ? id : texte[0].toUpperCase() + texte.substring(1);
}
