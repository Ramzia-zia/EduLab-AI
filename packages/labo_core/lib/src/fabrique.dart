import 'labo_electricite.dart';
import 'labo_migration.dart';
import 'labo_optique.dart';
import 'labo_oscilloscope.dart';
import 'noyau.dart';

/// Crée le laboratoire qui correspond à une définition (valeur `calcul` du fichier JSON).
Laboratoire creerLaboratoire(DefinitionExperience definition) {
  switch (definition.calcul) {
    case 'electricite':
      return LaboElectricite(definition);
    case 'oscilloscope':
      return LaboOscilloscope(definition);
    case 'optique':
      return LaboOptique(definition);
    case 'migration_ions':
      return LaboMigration(definition);
  }
  throw ArgumentError.value(
      definition.calcul, 'calcul', 'moteur de calcul inconnu');
}
