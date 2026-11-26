// Base locale SQLite (drift). Générer le code avec :
//   dart run build_runner build --delete-conflicting-outputs
// Les colonnes recopient CONTRAT.md chapitre 2 (en snake_case côté SQL par défaut de drift).
import 'package:drift/drift.dart';

part 'base_locale.g.dart';

@DataClassName('LigneTentative')
class TentativesLocales extends Table {
  TextColumn get id => text()();
  TextColumn get experienceId => text()();
  IntColumn get versionExperience => integer()();
  DateTimeColumn get debut => dateTime()();
  DateTimeColumn get fin => dateTime().nullable()();
  TextColumn get statut => text()();
  IntColumn get score => integer().nullable()();
  TextColumn get resultatJson => text().nullable()();
  BoolColumn get envoyee => boolean().withDefault(const Constant(false))();
  TextColumn get codeRefus => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('LigneEvenement')
class EvenementsLocaux extends Table {
  TextColumn get id => text()();
  TextColumn get tentativeId => text()();
  IntColumn get rang => integer()();
  DateTimeColumn get horodatage => dateTime()();
  TextColumn get action => text()();
  TextColumn get valeursJson => text()();
  BoolColumn get envoye => boolean().withDefault(const Constant(false))();
  TextColumn get codeRefus => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};

  @override
  List<Set<Column>> get uniqueKeys => [
        {tentativeId, rang},
      ];
}

@DataClassName('LigneResume')
class ExperiencesLocales extends Table {
  TextColumn get id => text()();
  TextColumn get resumeJson => text()();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('LignePack')
class PacksLocaux extends Table {
  TextColumn get id => text()();
  IntColumn get version => integer()();
  TextColumn get definitionJson => text()();

  @override
  Set<Column> get primaryKey => {id};
}

@DataClassName('LigneProfil')
class ProfilsLocaux extends Table {
  TextColumn get id => text()();
  TextColumn get profilJson => text()();

  @override
  Set<Column> get primaryKey => {id};
}

@DriftDatabase(
  tables: [
    TentativesLocales,
    EvenementsLocaux,
    ExperiencesLocales,
    PacksLocaux,
    ProfilsLocaux,
  ],
)
class BaseLocale extends _$BaseLocale {
  BaseLocale(super.e);

  @override
  int get schemaVersion => 1;
}
