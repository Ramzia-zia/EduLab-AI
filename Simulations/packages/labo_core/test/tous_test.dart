// Lance tous les tests : dart run test/tous_test.dart
import 'banc_optique_test.dart' as banc;
import 'demo_test.dart' as demo;
import 'dosage_manuel_test.dart' as dosage_manuel;
import 'electricite_test.dart' as electricite;
import 'labo_autres_test.dart' as labo_autres;
import 'labo_dosage_test.dart' as labo_dosage;
import 'labo_electricite_test.dart' as labo_electricite;
import 'labo_svt_test.dart' as labo_svt;
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
  labo_svt.main();
  labo_dosage.main();
  optique.main();
  banc.main();
  dosage_manuel.main();
  oscilloscope.main();
  migration.main();
  reference.main();
  skills.main();
  demo.main();
  resumerEtSortir();
}
