// Lance tous les tests : dart run test/tous_test.dart
import 'electricite_test.dart' as electricite;
import 'labo_autres_test.dart' as labo_autres;
import 'labo_electricite_test.dart' as labo_electricite;
import 'migration_ions_test.dart' as migration;
import 'mini_test.dart';
import 'optique_test.dart' as optique;
import 'oscilloscope_test.dart' as oscilloscope;
import 'reference_values_test.dart' as reference;
import 'skills_test.dart' as skills;

void main() {
  electricite.main();
  labo_electricite.main();
  labo_autres.main();
  optique.main();
  oscilloscope.main();
  migration.main();
  reference.main();
  skills.main();
  resumerEtSortir();
}
