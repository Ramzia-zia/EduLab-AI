/// Vérifications communes. Les erreurs sont des [ArgumentError] avec un message en français.
void exigerPositif(String nom, double valeur) {
  if (!(valeur > 0) || valeur.isInfinite) {
    throw ArgumentError.value(valeur, nom, 'doit être strictement positif');
  }
}

void exigerPositifOuNul(String nom, double valeur) {
  if (!(valeur >= 0) || valeur.isInfinite) {
    throw ArgumentError.value(valeur, nom, 'doit être positif ou nul');
  }
}

void exigerNonNul(String nom, double valeur) {
  if (valeur == 0 || valeur.isNaN || valeur.isInfinite) {
    throw ArgumentError.value(valeur, nom, 'ne doit pas être nul');
  }
}
