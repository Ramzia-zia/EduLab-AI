// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'base_locale.dart';

// ignore_for_file: type=lint
class $TentativesLocalesTable extends TentativesLocales
    with TableInfo<$TentativesLocalesTable, LigneTentative> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $TentativesLocalesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _experienceIdMeta =
      const VerificationMeta('experienceId');
  @override
  late final GeneratedColumn<String> experienceId = GeneratedColumn<String>(
      'experience_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _versionExperienceMeta =
      const VerificationMeta('versionExperience');
  @override
  late final GeneratedColumn<int> versionExperience = GeneratedColumn<int>(
      'version_experience', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _debutMeta = const VerificationMeta('debut');
  @override
  late final GeneratedColumn<DateTime> debut = GeneratedColumn<DateTime>(
      'debut', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _finMeta = const VerificationMeta('fin');
  @override
  late final GeneratedColumn<DateTime> fin = GeneratedColumn<DateTime>(
      'fin', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _statutMeta = const VerificationMeta('statut');
  @override
  late final GeneratedColumn<String> statut = GeneratedColumn<String>(
      'statut', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _scoreMeta = const VerificationMeta('score');
  @override
  late final GeneratedColumn<int> score = GeneratedColumn<int>(
      'score', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _resultatJsonMeta =
      const VerificationMeta('resultatJson');
  @override
  late final GeneratedColumn<String> resultatJson = GeneratedColumn<String>(
      'resultat_json', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _envoyeeMeta =
      const VerificationMeta('envoyee');
  @override
  late final GeneratedColumn<bool> envoyee = GeneratedColumn<bool>(
      'envoyee', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("envoyee" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _codeRefusMeta =
      const VerificationMeta('codeRefus');
  @override
  late final GeneratedColumn<String> codeRefus = GeneratedColumn<String>(
      'code_refus', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        experienceId,
        versionExperience,
        debut,
        fin,
        statut,
        score,
        resultatJson,
        envoyee,
        codeRefus
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'tentatives_locales';
  @override
  VerificationContext validateIntegrity(Insertable<LigneTentative> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('experience_id')) {
      context.handle(
          _experienceIdMeta,
          experienceId.isAcceptableOrUnknown(
              data['experience_id']!, _experienceIdMeta));
    } else if (isInserting) {
      context.missing(_experienceIdMeta);
    }
    if (data.containsKey('version_experience')) {
      context.handle(
          _versionExperienceMeta,
          versionExperience.isAcceptableOrUnknown(
              data['version_experience']!, _versionExperienceMeta));
    } else if (isInserting) {
      context.missing(_versionExperienceMeta);
    }
    if (data.containsKey('debut')) {
      context.handle(
          _debutMeta, debut.isAcceptableOrUnknown(data['debut']!, _debutMeta));
    } else if (isInserting) {
      context.missing(_debutMeta);
    }
    if (data.containsKey('fin')) {
      context.handle(
          _finMeta, fin.isAcceptableOrUnknown(data['fin']!, _finMeta));
    }
    if (data.containsKey('statut')) {
      context.handle(_statutMeta,
          statut.isAcceptableOrUnknown(data['statut']!, _statutMeta));
    } else if (isInserting) {
      context.missing(_statutMeta);
    }
    if (data.containsKey('score')) {
      context.handle(
          _scoreMeta, score.isAcceptableOrUnknown(data['score']!, _scoreMeta));
    }
    if (data.containsKey('resultat_json')) {
      context.handle(
          _resultatJsonMeta,
          resultatJson.isAcceptableOrUnknown(
              data['resultat_json']!, _resultatJsonMeta));
    }
    if (data.containsKey('envoyee')) {
      context.handle(_envoyeeMeta,
          envoyee.isAcceptableOrUnknown(data['envoyee']!, _envoyeeMeta));
    }
    if (data.containsKey('code_refus')) {
      context.handle(_codeRefusMeta,
          codeRefus.isAcceptableOrUnknown(data['code_refus']!, _codeRefusMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LigneTentative map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LigneTentative(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      experienceId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}experience_id'])!,
      versionExperience: attachedDatabase.typeMapping.read(
          DriftSqlType.int, data['${effectivePrefix}version_experience'])!,
      debut: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}debut'])!,
      fin: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}fin']),
      statut: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}statut'])!,
      score: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}score']),
      resultatJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}resultat_json']),
      envoyee: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}envoyee'])!,
      codeRefus: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}code_refus']),
    );
  }

  @override
  $TentativesLocalesTable createAlias(String alias) {
    return $TentativesLocalesTable(attachedDatabase, alias);
  }
}

class LigneTentative extends DataClass implements Insertable<LigneTentative> {
  final String id;
  final String experienceId;
  final int versionExperience;
  final DateTime debut;
  final DateTime? fin;
  final String statut;
  final int? score;
  final String? resultatJson;
  final bool envoyee;
  final String? codeRefus;
  const LigneTentative(
      {required this.id,
      required this.experienceId,
      required this.versionExperience,
      required this.debut,
      this.fin,
      required this.statut,
      this.score,
      this.resultatJson,
      required this.envoyee,
      this.codeRefus});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['experience_id'] = Variable<String>(experienceId);
    map['version_experience'] = Variable<int>(versionExperience);
    map['debut'] = Variable<DateTime>(debut);
    if (!nullToAbsent || fin != null) {
      map['fin'] = Variable<DateTime>(fin);
    }
    map['statut'] = Variable<String>(statut);
    if (!nullToAbsent || score != null) {
      map['score'] = Variable<int>(score);
    }
    if (!nullToAbsent || resultatJson != null) {
      map['resultat_json'] = Variable<String>(resultatJson);
    }
    map['envoyee'] = Variable<bool>(envoyee);
    if (!nullToAbsent || codeRefus != null) {
      map['code_refus'] = Variable<String>(codeRefus);
    }
    return map;
  }

  TentativesLocalesCompanion toCompanion(bool nullToAbsent) {
    return TentativesLocalesCompanion(
      id: Value(id),
      experienceId: Value(experienceId),
      versionExperience: Value(versionExperience),
      debut: Value(debut),
      fin: fin == null && nullToAbsent ? const Value.absent() : Value(fin),
      statut: Value(statut),
      score:
          score == null && nullToAbsent ? const Value.absent() : Value(score),
      resultatJson: resultatJson == null && nullToAbsent
          ? const Value.absent()
          : Value(resultatJson),
      envoyee: Value(envoyee),
      codeRefus: codeRefus == null && nullToAbsent
          ? const Value.absent()
          : Value(codeRefus),
    );
  }

  factory LigneTentative.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LigneTentative(
      id: serializer.fromJson<String>(json['id']),
      experienceId: serializer.fromJson<String>(json['experienceId']),
      versionExperience: serializer.fromJson<int>(json['versionExperience']),
      debut: serializer.fromJson<DateTime>(json['debut']),
      fin: serializer.fromJson<DateTime?>(json['fin']),
      statut: serializer.fromJson<String>(json['statut']),
      score: serializer.fromJson<int?>(json['score']),
      resultatJson: serializer.fromJson<String?>(json['resultatJson']),
      envoyee: serializer.fromJson<bool>(json['envoyee']),
      codeRefus: serializer.fromJson<String?>(json['codeRefus']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'experienceId': serializer.toJson<String>(experienceId),
      'versionExperience': serializer.toJson<int>(versionExperience),
      'debut': serializer.toJson<DateTime>(debut),
      'fin': serializer.toJson<DateTime?>(fin),
      'statut': serializer.toJson<String>(statut),
      'score': serializer.toJson<int?>(score),
      'resultatJson': serializer.toJson<String?>(resultatJson),
      'envoyee': serializer.toJson<bool>(envoyee),
      'codeRefus': serializer.toJson<String?>(codeRefus),
    };
  }

  LigneTentative copyWith(
          {String? id,
          String? experienceId,
          int? versionExperience,
          DateTime? debut,
          Value<DateTime?> fin = const Value.absent(),
          String? statut,
          Value<int?> score = const Value.absent(),
          Value<String?> resultatJson = const Value.absent(),
          bool? envoyee,
          Value<String?> codeRefus = const Value.absent()}) =>
      LigneTentative(
        id: id ?? this.id,
        experienceId: experienceId ?? this.experienceId,
        versionExperience: versionExperience ?? this.versionExperience,
        debut: debut ?? this.debut,
        fin: fin.present ? fin.value : this.fin,
        statut: statut ?? this.statut,
        score: score.present ? score.value : this.score,
        resultatJson:
            resultatJson.present ? resultatJson.value : this.resultatJson,
        envoyee: envoyee ?? this.envoyee,
        codeRefus: codeRefus.present ? codeRefus.value : this.codeRefus,
      );
  LigneTentative copyWithCompanion(TentativesLocalesCompanion data) {
    return LigneTentative(
      id: data.id.present ? data.id.value : this.id,
      experienceId: data.experienceId.present
          ? data.experienceId.value
          : this.experienceId,
      versionExperience: data.versionExperience.present
          ? data.versionExperience.value
          : this.versionExperience,
      debut: data.debut.present ? data.debut.value : this.debut,
      fin: data.fin.present ? data.fin.value : this.fin,
      statut: data.statut.present ? data.statut.value : this.statut,
      score: data.score.present ? data.score.value : this.score,
      resultatJson: data.resultatJson.present
          ? data.resultatJson.value
          : this.resultatJson,
      envoyee: data.envoyee.present ? data.envoyee.value : this.envoyee,
      codeRefus: data.codeRefus.present ? data.codeRefus.value : this.codeRefus,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LigneTentative(')
          ..write('id: $id, ')
          ..write('experienceId: $experienceId, ')
          ..write('versionExperience: $versionExperience, ')
          ..write('debut: $debut, ')
          ..write('fin: $fin, ')
          ..write('statut: $statut, ')
          ..write('score: $score, ')
          ..write('resultatJson: $resultatJson, ')
          ..write('envoyee: $envoyee, ')
          ..write('codeRefus: $codeRefus')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, experienceId, versionExperience, debut,
      fin, statut, score, resultatJson, envoyee, codeRefus);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LigneTentative &&
          other.id == this.id &&
          other.experienceId == this.experienceId &&
          other.versionExperience == this.versionExperience &&
          other.debut == this.debut &&
          other.fin == this.fin &&
          other.statut == this.statut &&
          other.score == this.score &&
          other.resultatJson == this.resultatJson &&
          other.envoyee == this.envoyee &&
          other.codeRefus == this.codeRefus);
}

class TentativesLocalesCompanion extends UpdateCompanion<LigneTentative> {
  final Value<String> id;
  final Value<String> experienceId;
  final Value<int> versionExperience;
  final Value<DateTime> debut;
  final Value<DateTime?> fin;
  final Value<String> statut;
  final Value<int?> score;
  final Value<String?> resultatJson;
  final Value<bool> envoyee;
  final Value<String?> codeRefus;
  final Value<int> rowid;
  const TentativesLocalesCompanion({
    this.id = const Value.absent(),
    this.experienceId = const Value.absent(),
    this.versionExperience = const Value.absent(),
    this.debut = const Value.absent(),
    this.fin = const Value.absent(),
    this.statut = const Value.absent(),
    this.score = const Value.absent(),
    this.resultatJson = const Value.absent(),
    this.envoyee = const Value.absent(),
    this.codeRefus = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  TentativesLocalesCompanion.insert({
    required String id,
    required String experienceId,
    required int versionExperience,
    required DateTime debut,
    this.fin = const Value.absent(),
    required String statut,
    this.score = const Value.absent(),
    this.resultatJson = const Value.absent(),
    this.envoyee = const Value.absent(),
    this.codeRefus = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        experienceId = Value(experienceId),
        versionExperience = Value(versionExperience),
        debut = Value(debut),
        statut = Value(statut);
  static Insertable<LigneTentative> custom({
    Expression<String>? id,
    Expression<String>? experienceId,
    Expression<int>? versionExperience,
    Expression<DateTime>? debut,
    Expression<DateTime>? fin,
    Expression<String>? statut,
    Expression<int>? score,
    Expression<String>? resultatJson,
    Expression<bool>? envoyee,
    Expression<String>? codeRefus,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (experienceId != null) 'experience_id': experienceId,
      if (versionExperience != null) 'version_experience': versionExperience,
      if (debut != null) 'debut': debut,
      if (fin != null) 'fin': fin,
      if (statut != null) 'statut': statut,
      if (score != null) 'score': score,
      if (resultatJson != null) 'resultat_json': resultatJson,
      if (envoyee != null) 'envoyee': envoyee,
      if (codeRefus != null) 'code_refus': codeRefus,
      if (rowid != null) 'rowid': rowid,
    });
  }

  TentativesLocalesCompanion copyWith(
      {Value<String>? id,
      Value<String>? experienceId,
      Value<int>? versionExperience,
      Value<DateTime>? debut,
      Value<DateTime?>? fin,
      Value<String>? statut,
      Value<int?>? score,
      Value<String?>? resultatJson,
      Value<bool>? envoyee,
      Value<String?>? codeRefus,
      Value<int>? rowid}) {
    return TentativesLocalesCompanion(
      id: id ?? this.id,
      experienceId: experienceId ?? this.experienceId,
      versionExperience: versionExperience ?? this.versionExperience,
      debut: debut ?? this.debut,
      fin: fin ?? this.fin,
      statut: statut ?? this.statut,
      score: score ?? this.score,
      resultatJson: resultatJson ?? this.resultatJson,
      envoyee: envoyee ?? this.envoyee,
      codeRefus: codeRefus ?? this.codeRefus,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (experienceId.present) {
      map['experience_id'] = Variable<String>(experienceId.value);
    }
    if (versionExperience.present) {
      map['version_experience'] = Variable<int>(versionExperience.value);
    }
    if (debut.present) {
      map['debut'] = Variable<DateTime>(debut.value);
    }
    if (fin.present) {
      map['fin'] = Variable<DateTime>(fin.value);
    }
    if (statut.present) {
      map['statut'] = Variable<String>(statut.value);
    }
    if (score.present) {
      map['score'] = Variable<int>(score.value);
    }
    if (resultatJson.present) {
      map['resultat_json'] = Variable<String>(resultatJson.value);
    }
    if (envoyee.present) {
      map['envoyee'] = Variable<bool>(envoyee.value);
    }
    if (codeRefus.present) {
      map['code_refus'] = Variable<String>(codeRefus.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('TentativesLocalesCompanion(')
          ..write('id: $id, ')
          ..write('experienceId: $experienceId, ')
          ..write('versionExperience: $versionExperience, ')
          ..write('debut: $debut, ')
          ..write('fin: $fin, ')
          ..write('statut: $statut, ')
          ..write('score: $score, ')
          ..write('resultatJson: $resultatJson, ')
          ..write('envoyee: $envoyee, ')
          ..write('codeRefus: $codeRefus, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $EvenementsLocauxTable extends EvenementsLocaux
    with TableInfo<$EvenementsLocauxTable, LigneEvenement> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $EvenementsLocauxTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _tentativeIdMeta =
      const VerificationMeta('tentativeId');
  @override
  late final GeneratedColumn<String> tentativeId = GeneratedColumn<String>(
      'tentative_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _rangMeta = const VerificationMeta('rang');
  @override
  late final GeneratedColumn<int> rang = GeneratedColumn<int>(
      'rang', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _horodatageMeta =
      const VerificationMeta('horodatage');
  @override
  late final GeneratedColumn<DateTime> horodatage = GeneratedColumn<DateTime>(
      'horodatage', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _actionMeta = const VerificationMeta('action');
  @override
  late final GeneratedColumn<String> action = GeneratedColumn<String>(
      'action', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _valeursJsonMeta =
      const VerificationMeta('valeursJson');
  @override
  late final GeneratedColumn<String> valeursJson = GeneratedColumn<String>(
      'valeurs_json', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _envoyeMeta = const VerificationMeta('envoye');
  @override
  late final GeneratedColumn<bool> envoye = GeneratedColumn<bool>(
      'envoye', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("envoye" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _codeRefusMeta =
      const VerificationMeta('codeRefus');
  @override
  late final GeneratedColumn<String> codeRefus = GeneratedColumn<String>(
      'code_refus', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        tentativeId,
        rang,
        horodatage,
        action,
        valeursJson,
        envoye,
        codeRefus
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'evenements_locaux';
  @override
  VerificationContext validateIntegrity(Insertable<LigneEvenement> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('tentative_id')) {
      context.handle(
          _tentativeIdMeta,
          tentativeId.isAcceptableOrUnknown(
              data['tentative_id']!, _tentativeIdMeta));
    } else if (isInserting) {
      context.missing(_tentativeIdMeta);
    }
    if (data.containsKey('rang')) {
      context.handle(
          _rangMeta, rang.isAcceptableOrUnknown(data['rang']!, _rangMeta));
    } else if (isInserting) {
      context.missing(_rangMeta);
    }
    if (data.containsKey('horodatage')) {
      context.handle(
          _horodatageMeta,
          horodatage.isAcceptableOrUnknown(
              data['horodatage']!, _horodatageMeta));
    } else if (isInserting) {
      context.missing(_horodatageMeta);
    }
    if (data.containsKey('action')) {
      context.handle(_actionMeta,
          action.isAcceptableOrUnknown(data['action']!, _actionMeta));
    } else if (isInserting) {
      context.missing(_actionMeta);
    }
    if (data.containsKey('valeurs_json')) {
      context.handle(
          _valeursJsonMeta,
          valeursJson.isAcceptableOrUnknown(
              data['valeurs_json']!, _valeursJsonMeta));
    } else if (isInserting) {
      context.missing(_valeursJsonMeta);
    }
    if (data.containsKey('envoye')) {
      context.handle(_envoyeMeta,
          envoye.isAcceptableOrUnknown(data['envoye']!, _envoyeMeta));
    }
    if (data.containsKey('code_refus')) {
      context.handle(_codeRefusMeta,
          codeRefus.isAcceptableOrUnknown(data['code_refus']!, _codeRefusMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  List<Set<GeneratedColumn>> get uniqueKeys => [
        {tentativeId, rang},
      ];
  @override
  LigneEvenement map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LigneEvenement(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      tentativeId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}tentative_id'])!,
      rang: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}rang'])!,
      horodatage: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}horodatage'])!,
      action: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}action'])!,
      valeursJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}valeurs_json'])!,
      envoye: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}envoye'])!,
      codeRefus: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}code_refus']),
    );
  }

  @override
  $EvenementsLocauxTable createAlias(String alias) {
    return $EvenementsLocauxTable(attachedDatabase, alias);
  }
}

class LigneEvenement extends DataClass implements Insertable<LigneEvenement> {
  final String id;
  final String tentativeId;
  final int rang;
  final DateTime horodatage;
  final String action;
  final String valeursJson;
  final bool envoye;
  final String? codeRefus;
  const LigneEvenement(
      {required this.id,
      required this.tentativeId,
      required this.rang,
      required this.horodatage,
      required this.action,
      required this.valeursJson,
      required this.envoye,
      this.codeRefus});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['tentative_id'] = Variable<String>(tentativeId);
    map['rang'] = Variable<int>(rang);
    map['horodatage'] = Variable<DateTime>(horodatage);
    map['action'] = Variable<String>(action);
    map['valeurs_json'] = Variable<String>(valeursJson);
    map['envoye'] = Variable<bool>(envoye);
    if (!nullToAbsent || codeRefus != null) {
      map['code_refus'] = Variable<String>(codeRefus);
    }
    return map;
  }

  EvenementsLocauxCompanion toCompanion(bool nullToAbsent) {
    return EvenementsLocauxCompanion(
      id: Value(id),
      tentativeId: Value(tentativeId),
      rang: Value(rang),
      horodatage: Value(horodatage),
      action: Value(action),
      valeursJson: Value(valeursJson),
      envoye: Value(envoye),
      codeRefus: codeRefus == null && nullToAbsent
          ? const Value.absent()
          : Value(codeRefus),
    );
  }

  factory LigneEvenement.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LigneEvenement(
      id: serializer.fromJson<String>(json['id']),
      tentativeId: serializer.fromJson<String>(json['tentativeId']),
      rang: serializer.fromJson<int>(json['rang']),
      horodatage: serializer.fromJson<DateTime>(json['horodatage']),
      action: serializer.fromJson<String>(json['action']),
      valeursJson: serializer.fromJson<String>(json['valeursJson']),
      envoye: serializer.fromJson<bool>(json['envoye']),
      codeRefus: serializer.fromJson<String?>(json['codeRefus']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'tentativeId': serializer.toJson<String>(tentativeId),
      'rang': serializer.toJson<int>(rang),
      'horodatage': serializer.toJson<DateTime>(horodatage),
      'action': serializer.toJson<String>(action),
      'valeursJson': serializer.toJson<String>(valeursJson),
      'envoye': serializer.toJson<bool>(envoye),
      'codeRefus': serializer.toJson<String?>(codeRefus),
    };
  }

  LigneEvenement copyWith(
          {String? id,
          String? tentativeId,
          int? rang,
          DateTime? horodatage,
          String? action,
          String? valeursJson,
          bool? envoye,
          Value<String?> codeRefus = const Value.absent()}) =>
      LigneEvenement(
        id: id ?? this.id,
        tentativeId: tentativeId ?? this.tentativeId,
        rang: rang ?? this.rang,
        horodatage: horodatage ?? this.horodatage,
        action: action ?? this.action,
        valeursJson: valeursJson ?? this.valeursJson,
        envoye: envoye ?? this.envoye,
        codeRefus: codeRefus.present ? codeRefus.value : this.codeRefus,
      );
  LigneEvenement copyWithCompanion(EvenementsLocauxCompanion data) {
    return LigneEvenement(
      id: data.id.present ? data.id.value : this.id,
      tentativeId:
          data.tentativeId.present ? data.tentativeId.value : this.tentativeId,
      rang: data.rang.present ? data.rang.value : this.rang,
      horodatage:
          data.horodatage.present ? data.horodatage.value : this.horodatage,
      action: data.action.present ? data.action.value : this.action,
      valeursJson:
          data.valeursJson.present ? data.valeursJson.value : this.valeursJson,
      envoye: data.envoye.present ? data.envoye.value : this.envoye,
      codeRefus: data.codeRefus.present ? data.codeRefus.value : this.codeRefus,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LigneEvenement(')
          ..write('id: $id, ')
          ..write('tentativeId: $tentativeId, ')
          ..write('rang: $rang, ')
          ..write('horodatage: $horodatage, ')
          ..write('action: $action, ')
          ..write('valeursJson: $valeursJson, ')
          ..write('envoye: $envoye, ')
          ..write('codeRefus: $codeRefus')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, tentativeId, rang, horodatage, action,
      valeursJson, envoye, codeRefus);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LigneEvenement &&
          other.id == this.id &&
          other.tentativeId == this.tentativeId &&
          other.rang == this.rang &&
          other.horodatage == this.horodatage &&
          other.action == this.action &&
          other.valeursJson == this.valeursJson &&
          other.envoye == this.envoye &&
          other.codeRefus == this.codeRefus);
}

class EvenementsLocauxCompanion extends UpdateCompanion<LigneEvenement> {
  final Value<String> id;
  final Value<String> tentativeId;
  final Value<int> rang;
  final Value<DateTime> horodatage;
  final Value<String> action;
  final Value<String> valeursJson;
  final Value<bool> envoye;
  final Value<String?> codeRefus;
  final Value<int> rowid;
  const EvenementsLocauxCompanion({
    this.id = const Value.absent(),
    this.tentativeId = const Value.absent(),
    this.rang = const Value.absent(),
    this.horodatage = const Value.absent(),
    this.action = const Value.absent(),
    this.valeursJson = const Value.absent(),
    this.envoye = const Value.absent(),
    this.codeRefus = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  EvenementsLocauxCompanion.insert({
    required String id,
    required String tentativeId,
    required int rang,
    required DateTime horodatage,
    required String action,
    required String valeursJson,
    this.envoye = const Value.absent(),
    this.codeRefus = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        tentativeId = Value(tentativeId),
        rang = Value(rang),
        horodatage = Value(horodatage),
        action = Value(action),
        valeursJson = Value(valeursJson);
  static Insertable<LigneEvenement> custom({
    Expression<String>? id,
    Expression<String>? tentativeId,
    Expression<int>? rang,
    Expression<DateTime>? horodatage,
    Expression<String>? action,
    Expression<String>? valeursJson,
    Expression<bool>? envoye,
    Expression<String>? codeRefus,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (tentativeId != null) 'tentative_id': tentativeId,
      if (rang != null) 'rang': rang,
      if (horodatage != null) 'horodatage': horodatage,
      if (action != null) 'action': action,
      if (valeursJson != null) 'valeurs_json': valeursJson,
      if (envoye != null) 'envoye': envoye,
      if (codeRefus != null) 'code_refus': codeRefus,
      if (rowid != null) 'rowid': rowid,
    });
  }

  EvenementsLocauxCompanion copyWith(
      {Value<String>? id,
      Value<String>? tentativeId,
      Value<int>? rang,
      Value<DateTime>? horodatage,
      Value<String>? action,
      Value<String>? valeursJson,
      Value<bool>? envoye,
      Value<String?>? codeRefus,
      Value<int>? rowid}) {
    return EvenementsLocauxCompanion(
      id: id ?? this.id,
      tentativeId: tentativeId ?? this.tentativeId,
      rang: rang ?? this.rang,
      horodatage: horodatage ?? this.horodatage,
      action: action ?? this.action,
      valeursJson: valeursJson ?? this.valeursJson,
      envoye: envoye ?? this.envoye,
      codeRefus: codeRefus ?? this.codeRefus,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (tentativeId.present) {
      map['tentative_id'] = Variable<String>(tentativeId.value);
    }
    if (rang.present) {
      map['rang'] = Variable<int>(rang.value);
    }
    if (horodatage.present) {
      map['horodatage'] = Variable<DateTime>(horodatage.value);
    }
    if (action.present) {
      map['action'] = Variable<String>(action.value);
    }
    if (valeursJson.present) {
      map['valeurs_json'] = Variable<String>(valeursJson.value);
    }
    if (envoye.present) {
      map['envoye'] = Variable<bool>(envoye.value);
    }
    if (codeRefus.present) {
      map['code_refus'] = Variable<String>(codeRefus.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('EvenementsLocauxCompanion(')
          ..write('id: $id, ')
          ..write('tentativeId: $tentativeId, ')
          ..write('rang: $rang, ')
          ..write('horodatage: $horodatage, ')
          ..write('action: $action, ')
          ..write('valeursJson: $valeursJson, ')
          ..write('envoye: $envoye, ')
          ..write('codeRefus: $codeRefus, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $ExperiencesLocalesTable extends ExperiencesLocales
    with TableInfo<$ExperiencesLocalesTable, LigneResume> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ExperiencesLocalesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _resumeJsonMeta =
      const VerificationMeta('resumeJson');
  @override
  late final GeneratedColumn<String> resumeJson = GeneratedColumn<String>(
      'resume_json', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [id, resumeJson];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'experiences_locales';
  @override
  VerificationContext validateIntegrity(Insertable<LigneResume> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('resume_json')) {
      context.handle(
          _resumeJsonMeta,
          resumeJson.isAcceptableOrUnknown(
              data['resume_json']!, _resumeJsonMeta));
    } else if (isInserting) {
      context.missing(_resumeJsonMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LigneResume map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LigneResume(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      resumeJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}resume_json'])!,
    );
  }

  @override
  $ExperiencesLocalesTable createAlias(String alias) {
    return $ExperiencesLocalesTable(attachedDatabase, alias);
  }
}

class LigneResume extends DataClass implements Insertable<LigneResume> {
  final String id;
  final String resumeJson;
  const LigneResume({required this.id, required this.resumeJson});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['resume_json'] = Variable<String>(resumeJson);
    return map;
  }

  ExperiencesLocalesCompanion toCompanion(bool nullToAbsent) {
    return ExperiencesLocalesCompanion(
      id: Value(id),
      resumeJson: Value(resumeJson),
    );
  }

  factory LigneResume.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LigneResume(
      id: serializer.fromJson<String>(json['id']),
      resumeJson: serializer.fromJson<String>(json['resumeJson']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'resumeJson': serializer.toJson<String>(resumeJson),
    };
  }

  LigneResume copyWith({String? id, String? resumeJson}) => LigneResume(
        id: id ?? this.id,
        resumeJson: resumeJson ?? this.resumeJson,
      );
  LigneResume copyWithCompanion(ExperiencesLocalesCompanion data) {
    return LigneResume(
      id: data.id.present ? data.id.value : this.id,
      resumeJson:
          data.resumeJson.present ? data.resumeJson.value : this.resumeJson,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LigneResume(')
          ..write('id: $id, ')
          ..write('resumeJson: $resumeJson')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, resumeJson);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LigneResume &&
          other.id == this.id &&
          other.resumeJson == this.resumeJson);
}

class ExperiencesLocalesCompanion extends UpdateCompanion<LigneResume> {
  final Value<String> id;
  final Value<String> resumeJson;
  final Value<int> rowid;
  const ExperiencesLocalesCompanion({
    this.id = const Value.absent(),
    this.resumeJson = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  ExperiencesLocalesCompanion.insert({
    required String id,
    required String resumeJson,
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        resumeJson = Value(resumeJson);
  static Insertable<LigneResume> custom({
    Expression<String>? id,
    Expression<String>? resumeJson,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (resumeJson != null) 'resume_json': resumeJson,
      if (rowid != null) 'rowid': rowid,
    });
  }

  ExperiencesLocalesCompanion copyWith(
      {Value<String>? id, Value<String>? resumeJson, Value<int>? rowid}) {
    return ExperiencesLocalesCompanion(
      id: id ?? this.id,
      resumeJson: resumeJson ?? this.resumeJson,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (resumeJson.present) {
      map['resume_json'] = Variable<String>(resumeJson.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ExperiencesLocalesCompanion(')
          ..write('id: $id, ')
          ..write('resumeJson: $resumeJson, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $PacksLocauxTable extends PacksLocaux
    with TableInfo<$PacksLocauxTable, LignePack> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $PacksLocauxTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _versionMeta =
      const VerificationMeta('version');
  @override
  late final GeneratedColumn<int> version = GeneratedColumn<int>(
      'version', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _definitionJsonMeta =
      const VerificationMeta('definitionJson');
  @override
  late final GeneratedColumn<String> definitionJson = GeneratedColumn<String>(
      'definition_json', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [id, version, definitionJson];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'packs_locaux';
  @override
  VerificationContext validateIntegrity(Insertable<LignePack> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('version')) {
      context.handle(_versionMeta,
          version.isAcceptableOrUnknown(data['version']!, _versionMeta));
    } else if (isInserting) {
      context.missing(_versionMeta);
    }
    if (data.containsKey('definition_json')) {
      context.handle(
          _definitionJsonMeta,
          definitionJson.isAcceptableOrUnknown(
              data['definition_json']!, _definitionJsonMeta));
    } else if (isInserting) {
      context.missing(_definitionJsonMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LignePack map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LignePack(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      version: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}version'])!,
      definitionJson: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}definition_json'])!,
    );
  }

  @override
  $PacksLocauxTable createAlias(String alias) {
    return $PacksLocauxTable(attachedDatabase, alias);
  }
}

class LignePack extends DataClass implements Insertable<LignePack> {
  final String id;
  final int version;
  final String definitionJson;
  const LignePack(
      {required this.id, required this.version, required this.definitionJson});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['version'] = Variable<int>(version);
    map['definition_json'] = Variable<String>(definitionJson);
    return map;
  }

  PacksLocauxCompanion toCompanion(bool nullToAbsent) {
    return PacksLocauxCompanion(
      id: Value(id),
      version: Value(version),
      definitionJson: Value(definitionJson),
    );
  }

  factory LignePack.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LignePack(
      id: serializer.fromJson<String>(json['id']),
      version: serializer.fromJson<int>(json['version']),
      definitionJson: serializer.fromJson<String>(json['definitionJson']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'version': serializer.toJson<int>(version),
      'definitionJson': serializer.toJson<String>(definitionJson),
    };
  }

  LignePack copyWith({String? id, int? version, String? definitionJson}) =>
      LignePack(
        id: id ?? this.id,
        version: version ?? this.version,
        definitionJson: definitionJson ?? this.definitionJson,
      );
  LignePack copyWithCompanion(PacksLocauxCompanion data) {
    return LignePack(
      id: data.id.present ? data.id.value : this.id,
      version: data.version.present ? data.version.value : this.version,
      definitionJson: data.definitionJson.present
          ? data.definitionJson.value
          : this.definitionJson,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LignePack(')
          ..write('id: $id, ')
          ..write('version: $version, ')
          ..write('definitionJson: $definitionJson')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, version, definitionJson);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LignePack &&
          other.id == this.id &&
          other.version == this.version &&
          other.definitionJson == this.definitionJson);
}

class PacksLocauxCompanion extends UpdateCompanion<LignePack> {
  final Value<String> id;
  final Value<int> version;
  final Value<String> definitionJson;
  final Value<int> rowid;
  const PacksLocauxCompanion({
    this.id = const Value.absent(),
    this.version = const Value.absent(),
    this.definitionJson = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  PacksLocauxCompanion.insert({
    required String id,
    required int version,
    required String definitionJson,
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        version = Value(version),
        definitionJson = Value(definitionJson);
  static Insertable<LignePack> custom({
    Expression<String>? id,
    Expression<int>? version,
    Expression<String>? definitionJson,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (version != null) 'version': version,
      if (definitionJson != null) 'definition_json': definitionJson,
      if (rowid != null) 'rowid': rowid,
    });
  }

  PacksLocauxCompanion copyWith(
      {Value<String>? id,
      Value<int>? version,
      Value<String>? definitionJson,
      Value<int>? rowid}) {
    return PacksLocauxCompanion(
      id: id ?? this.id,
      version: version ?? this.version,
      definitionJson: definitionJson ?? this.definitionJson,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (version.present) {
      map['version'] = Variable<int>(version.value);
    }
    if (definitionJson.present) {
      map['definition_json'] = Variable<String>(definitionJson.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('PacksLocauxCompanion(')
          ..write('id: $id, ')
          ..write('version: $version, ')
          ..write('definitionJson: $definitionJson, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $ProfilsLocauxTable extends ProfilsLocaux
    with TableInfo<$ProfilsLocauxTable, LigneProfil> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ProfilsLocauxTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _profilJsonMeta =
      const VerificationMeta('profilJson');
  @override
  late final GeneratedColumn<String> profilJson = GeneratedColumn<String>(
      'profil_json', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [id, profilJson];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'profils_locaux';
  @override
  VerificationContext validateIntegrity(Insertable<LigneProfil> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('profil_json')) {
      context.handle(
          _profilJsonMeta,
          profilJson.isAcceptableOrUnknown(
              data['profil_json']!, _profilJsonMeta));
    } else if (isInserting) {
      context.missing(_profilJsonMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LigneProfil map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LigneProfil(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      profilJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}profil_json'])!,
    );
  }

  @override
  $ProfilsLocauxTable createAlias(String alias) {
    return $ProfilsLocauxTable(attachedDatabase, alias);
  }
}

class LigneProfil extends DataClass implements Insertable<LigneProfil> {
  final String id;
  final String profilJson;
  const LigneProfil({required this.id, required this.profilJson});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['profil_json'] = Variable<String>(profilJson);
    return map;
  }

  ProfilsLocauxCompanion toCompanion(bool nullToAbsent) {
    return ProfilsLocauxCompanion(
      id: Value(id),
      profilJson: Value(profilJson),
    );
  }

  factory LigneProfil.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LigneProfil(
      id: serializer.fromJson<String>(json['id']),
      profilJson: serializer.fromJson<String>(json['profilJson']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'profilJson': serializer.toJson<String>(profilJson),
    };
  }

  LigneProfil copyWith({String? id, String? profilJson}) => LigneProfil(
        id: id ?? this.id,
        profilJson: profilJson ?? this.profilJson,
      );
  LigneProfil copyWithCompanion(ProfilsLocauxCompanion data) {
    return LigneProfil(
      id: data.id.present ? data.id.value : this.id,
      profilJson:
          data.profilJson.present ? data.profilJson.value : this.profilJson,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LigneProfil(')
          ..write('id: $id, ')
          ..write('profilJson: $profilJson')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, profilJson);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LigneProfil &&
          other.id == this.id &&
          other.profilJson == this.profilJson);
}

class ProfilsLocauxCompanion extends UpdateCompanion<LigneProfil> {
  final Value<String> id;
  final Value<String> profilJson;
  final Value<int> rowid;
  const ProfilsLocauxCompanion({
    this.id = const Value.absent(),
    this.profilJson = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  ProfilsLocauxCompanion.insert({
    required String id,
    required String profilJson,
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        profilJson = Value(profilJson);
  static Insertable<LigneProfil> custom({
    Expression<String>? id,
    Expression<String>? profilJson,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (profilJson != null) 'profil_json': profilJson,
      if (rowid != null) 'rowid': rowid,
    });
  }

  ProfilsLocauxCompanion copyWith(
      {Value<String>? id, Value<String>? profilJson, Value<int>? rowid}) {
    return ProfilsLocauxCompanion(
      id: id ?? this.id,
      profilJson: profilJson ?? this.profilJson,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (profilJson.present) {
      map['profil_json'] = Variable<String>(profilJson.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ProfilsLocauxCompanion(')
          ..write('id: $id, ')
          ..write('profilJson: $profilJson, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$BaseLocale extends GeneratedDatabase {
  _$BaseLocale(QueryExecutor e) : super(e);
  $BaseLocaleManager get managers => $BaseLocaleManager(this);
  late final $TentativesLocalesTable tentativesLocales =
      $TentativesLocalesTable(this);
  late final $EvenementsLocauxTable evenementsLocaux =
      $EvenementsLocauxTable(this);
  late final $ExperiencesLocalesTable experiencesLocales =
      $ExperiencesLocalesTable(this);
  late final $PacksLocauxTable packsLocaux = $PacksLocauxTable(this);
  late final $ProfilsLocauxTable profilsLocaux = $ProfilsLocauxTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
        tentativesLocales,
        evenementsLocaux,
        experiencesLocales,
        packsLocaux,
        profilsLocaux
      ];
}

typedef $$TentativesLocalesTableCreateCompanionBuilder
    = TentativesLocalesCompanion Function({
  required String id,
  required String experienceId,
  required int versionExperience,
  required DateTime debut,
  Value<DateTime?> fin,
  required String statut,
  Value<int?> score,
  Value<String?> resultatJson,
  Value<bool> envoyee,
  Value<String?> codeRefus,
  Value<int> rowid,
});
typedef $$TentativesLocalesTableUpdateCompanionBuilder
    = TentativesLocalesCompanion Function({
  Value<String> id,
  Value<String> experienceId,
  Value<int> versionExperience,
  Value<DateTime> debut,
  Value<DateTime?> fin,
  Value<String> statut,
  Value<int?> score,
  Value<String?> resultatJson,
  Value<bool> envoyee,
  Value<String?> codeRefus,
  Value<int> rowid,
});

class $$TentativesLocalesTableFilterComposer
    extends Composer<_$BaseLocale, $TentativesLocalesTable> {
  $$TentativesLocalesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get experienceId => $composableBuilder(
      column: $table.experienceId, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get versionExperience => $composableBuilder(
      column: $table.versionExperience,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get debut => $composableBuilder(
      column: $table.debut, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get fin => $composableBuilder(
      column: $table.fin, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get statut => $composableBuilder(
      column: $table.statut, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get score => $composableBuilder(
      column: $table.score, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get resultatJson => $composableBuilder(
      column: $table.resultatJson, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get envoyee => $composableBuilder(
      column: $table.envoyee, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get codeRefus => $composableBuilder(
      column: $table.codeRefus, builder: (column) => ColumnFilters(column));
}

class $$TentativesLocalesTableOrderingComposer
    extends Composer<_$BaseLocale, $TentativesLocalesTable> {
  $$TentativesLocalesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get experienceId => $composableBuilder(
      column: $table.experienceId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get versionExperience => $composableBuilder(
      column: $table.versionExperience,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get debut => $composableBuilder(
      column: $table.debut, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get fin => $composableBuilder(
      column: $table.fin, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get statut => $composableBuilder(
      column: $table.statut, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get score => $composableBuilder(
      column: $table.score, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get resultatJson => $composableBuilder(
      column: $table.resultatJson,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get envoyee => $composableBuilder(
      column: $table.envoyee, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get codeRefus => $composableBuilder(
      column: $table.codeRefus, builder: (column) => ColumnOrderings(column));
}

class $$TentativesLocalesTableAnnotationComposer
    extends Composer<_$BaseLocale, $TentativesLocalesTable> {
  $$TentativesLocalesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get experienceId => $composableBuilder(
      column: $table.experienceId, builder: (column) => column);

  GeneratedColumn<int> get versionExperience => $composableBuilder(
      column: $table.versionExperience, builder: (column) => column);

  GeneratedColumn<DateTime> get debut =>
      $composableBuilder(column: $table.debut, builder: (column) => column);

  GeneratedColumn<DateTime> get fin =>
      $composableBuilder(column: $table.fin, builder: (column) => column);

  GeneratedColumn<String> get statut =>
      $composableBuilder(column: $table.statut, builder: (column) => column);

  GeneratedColumn<int> get score =>
      $composableBuilder(column: $table.score, builder: (column) => column);

  GeneratedColumn<String> get resultatJson => $composableBuilder(
      column: $table.resultatJson, builder: (column) => column);

  GeneratedColumn<bool> get envoyee =>
      $composableBuilder(column: $table.envoyee, builder: (column) => column);

  GeneratedColumn<String> get codeRefus =>
      $composableBuilder(column: $table.codeRefus, builder: (column) => column);
}

class $$TentativesLocalesTableTableManager extends RootTableManager<
    _$BaseLocale,
    $TentativesLocalesTable,
    LigneTentative,
    $$TentativesLocalesTableFilterComposer,
    $$TentativesLocalesTableOrderingComposer,
    $$TentativesLocalesTableAnnotationComposer,
    $$TentativesLocalesTableCreateCompanionBuilder,
    $$TentativesLocalesTableUpdateCompanionBuilder,
    (
      LigneTentative,
      BaseReferences<_$BaseLocale, $TentativesLocalesTable, LigneTentative>
    ),
    LigneTentative,
    PrefetchHooks Function()> {
  $$TentativesLocalesTableTableManager(
      _$BaseLocale db, $TentativesLocalesTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$TentativesLocalesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$TentativesLocalesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$TentativesLocalesTableAnnotationComposer(
                  $db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> experienceId = const Value.absent(),
            Value<int> versionExperience = const Value.absent(),
            Value<DateTime> debut = const Value.absent(),
            Value<DateTime?> fin = const Value.absent(),
            Value<String> statut = const Value.absent(),
            Value<int?> score = const Value.absent(),
            Value<String?> resultatJson = const Value.absent(),
            Value<bool> envoyee = const Value.absent(),
            Value<String?> codeRefus = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              TentativesLocalesCompanion(
            id: id,
            experienceId: experienceId,
            versionExperience: versionExperience,
            debut: debut,
            fin: fin,
            statut: statut,
            score: score,
            resultatJson: resultatJson,
            envoyee: envoyee,
            codeRefus: codeRefus,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String experienceId,
            required int versionExperience,
            required DateTime debut,
            Value<DateTime?> fin = const Value.absent(),
            required String statut,
            Value<int?> score = const Value.absent(),
            Value<String?> resultatJson = const Value.absent(),
            Value<bool> envoyee = const Value.absent(),
            Value<String?> codeRefus = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              TentativesLocalesCompanion.insert(
            id: id,
            experienceId: experienceId,
            versionExperience: versionExperience,
            debut: debut,
            fin: fin,
            statut: statut,
            score: score,
            resultatJson: resultatJson,
            envoyee: envoyee,
            codeRefus: codeRefus,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$TentativesLocalesTableProcessedTableManager = ProcessedTableManager<
    _$BaseLocale,
    $TentativesLocalesTable,
    LigneTentative,
    $$TentativesLocalesTableFilterComposer,
    $$TentativesLocalesTableOrderingComposer,
    $$TentativesLocalesTableAnnotationComposer,
    $$TentativesLocalesTableCreateCompanionBuilder,
    $$TentativesLocalesTableUpdateCompanionBuilder,
    (
      LigneTentative,
      BaseReferences<_$BaseLocale, $TentativesLocalesTable, LigneTentative>
    ),
    LigneTentative,
    PrefetchHooks Function()>;
typedef $$EvenementsLocauxTableCreateCompanionBuilder
    = EvenementsLocauxCompanion Function({
  required String id,
  required String tentativeId,
  required int rang,
  required DateTime horodatage,
  required String action,
  required String valeursJson,
  Value<bool> envoye,
  Value<String?> codeRefus,
  Value<int> rowid,
});
typedef $$EvenementsLocauxTableUpdateCompanionBuilder
    = EvenementsLocauxCompanion Function({
  Value<String> id,
  Value<String> tentativeId,
  Value<int> rang,
  Value<DateTime> horodatage,
  Value<String> action,
  Value<String> valeursJson,
  Value<bool> envoye,
  Value<String?> codeRefus,
  Value<int> rowid,
});

class $$EvenementsLocauxTableFilterComposer
    extends Composer<_$BaseLocale, $EvenementsLocauxTable> {
  $$EvenementsLocauxTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get tentativeId => $composableBuilder(
      column: $table.tentativeId, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get rang => $composableBuilder(
      column: $table.rang, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get horodatage => $composableBuilder(
      column: $table.horodatage, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get action => $composableBuilder(
      column: $table.action, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get valeursJson => $composableBuilder(
      column: $table.valeursJson, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get envoye => $composableBuilder(
      column: $table.envoye, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get codeRefus => $composableBuilder(
      column: $table.codeRefus, builder: (column) => ColumnFilters(column));
}

class $$EvenementsLocauxTableOrderingComposer
    extends Composer<_$BaseLocale, $EvenementsLocauxTable> {
  $$EvenementsLocauxTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get tentativeId => $composableBuilder(
      column: $table.tentativeId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get rang => $composableBuilder(
      column: $table.rang, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get horodatage => $composableBuilder(
      column: $table.horodatage, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get action => $composableBuilder(
      column: $table.action, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get valeursJson => $composableBuilder(
      column: $table.valeursJson, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get envoye => $composableBuilder(
      column: $table.envoye, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get codeRefus => $composableBuilder(
      column: $table.codeRefus, builder: (column) => ColumnOrderings(column));
}

class $$EvenementsLocauxTableAnnotationComposer
    extends Composer<_$BaseLocale, $EvenementsLocauxTable> {
  $$EvenementsLocauxTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get tentativeId => $composableBuilder(
      column: $table.tentativeId, builder: (column) => column);

  GeneratedColumn<int> get rang =>
      $composableBuilder(column: $table.rang, builder: (column) => column);

  GeneratedColumn<DateTime> get horodatage => $composableBuilder(
      column: $table.horodatage, builder: (column) => column);

  GeneratedColumn<String> get action =>
      $composableBuilder(column: $table.action, builder: (column) => column);

  GeneratedColumn<String> get valeursJson => $composableBuilder(
      column: $table.valeursJson, builder: (column) => column);

  GeneratedColumn<bool> get envoye =>
      $composableBuilder(column: $table.envoye, builder: (column) => column);

  GeneratedColumn<String> get codeRefus =>
      $composableBuilder(column: $table.codeRefus, builder: (column) => column);
}

class $$EvenementsLocauxTableTableManager extends RootTableManager<
    _$BaseLocale,
    $EvenementsLocauxTable,
    LigneEvenement,
    $$EvenementsLocauxTableFilterComposer,
    $$EvenementsLocauxTableOrderingComposer,
    $$EvenementsLocauxTableAnnotationComposer,
    $$EvenementsLocauxTableCreateCompanionBuilder,
    $$EvenementsLocauxTableUpdateCompanionBuilder,
    (
      LigneEvenement,
      BaseReferences<_$BaseLocale, $EvenementsLocauxTable, LigneEvenement>
    ),
    LigneEvenement,
    PrefetchHooks Function()> {
  $$EvenementsLocauxTableTableManager(
      _$BaseLocale db, $EvenementsLocauxTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$EvenementsLocauxTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$EvenementsLocauxTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$EvenementsLocauxTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> tentativeId = const Value.absent(),
            Value<int> rang = const Value.absent(),
            Value<DateTime> horodatage = const Value.absent(),
            Value<String> action = const Value.absent(),
            Value<String> valeursJson = const Value.absent(),
            Value<bool> envoye = const Value.absent(),
            Value<String?> codeRefus = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              EvenementsLocauxCompanion(
            id: id,
            tentativeId: tentativeId,
            rang: rang,
            horodatage: horodatage,
            action: action,
            valeursJson: valeursJson,
            envoye: envoye,
            codeRefus: codeRefus,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String tentativeId,
            required int rang,
            required DateTime horodatage,
            required String action,
            required String valeursJson,
            Value<bool> envoye = const Value.absent(),
            Value<String?> codeRefus = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              EvenementsLocauxCompanion.insert(
            id: id,
            tentativeId: tentativeId,
            rang: rang,
            horodatage: horodatage,
            action: action,
            valeursJson: valeursJson,
            envoye: envoye,
            codeRefus: codeRefus,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$EvenementsLocauxTableProcessedTableManager = ProcessedTableManager<
    _$BaseLocale,
    $EvenementsLocauxTable,
    LigneEvenement,
    $$EvenementsLocauxTableFilterComposer,
    $$EvenementsLocauxTableOrderingComposer,
    $$EvenementsLocauxTableAnnotationComposer,
    $$EvenementsLocauxTableCreateCompanionBuilder,
    $$EvenementsLocauxTableUpdateCompanionBuilder,
    (
      LigneEvenement,
      BaseReferences<_$BaseLocale, $EvenementsLocauxTable, LigneEvenement>
    ),
    LigneEvenement,
    PrefetchHooks Function()>;
typedef $$ExperiencesLocalesTableCreateCompanionBuilder
    = ExperiencesLocalesCompanion Function({
  required String id,
  required String resumeJson,
  Value<int> rowid,
});
typedef $$ExperiencesLocalesTableUpdateCompanionBuilder
    = ExperiencesLocalesCompanion Function({
  Value<String> id,
  Value<String> resumeJson,
  Value<int> rowid,
});

class $$ExperiencesLocalesTableFilterComposer
    extends Composer<_$BaseLocale, $ExperiencesLocalesTable> {
  $$ExperiencesLocalesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get resumeJson => $composableBuilder(
      column: $table.resumeJson, builder: (column) => ColumnFilters(column));
}

class $$ExperiencesLocalesTableOrderingComposer
    extends Composer<_$BaseLocale, $ExperiencesLocalesTable> {
  $$ExperiencesLocalesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get resumeJson => $composableBuilder(
      column: $table.resumeJson, builder: (column) => ColumnOrderings(column));
}

class $$ExperiencesLocalesTableAnnotationComposer
    extends Composer<_$BaseLocale, $ExperiencesLocalesTable> {
  $$ExperiencesLocalesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get resumeJson => $composableBuilder(
      column: $table.resumeJson, builder: (column) => column);
}

class $$ExperiencesLocalesTableTableManager extends RootTableManager<
    _$BaseLocale,
    $ExperiencesLocalesTable,
    LigneResume,
    $$ExperiencesLocalesTableFilterComposer,
    $$ExperiencesLocalesTableOrderingComposer,
    $$ExperiencesLocalesTableAnnotationComposer,
    $$ExperiencesLocalesTableCreateCompanionBuilder,
    $$ExperiencesLocalesTableUpdateCompanionBuilder,
    (
      LigneResume,
      BaseReferences<_$BaseLocale, $ExperiencesLocalesTable, LigneResume>
    ),
    LigneResume,
    PrefetchHooks Function()> {
  $$ExperiencesLocalesTableTableManager(
      _$BaseLocale db, $ExperiencesLocalesTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ExperiencesLocalesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ExperiencesLocalesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ExperiencesLocalesTableAnnotationComposer(
                  $db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> resumeJson = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ExperiencesLocalesCompanion(
            id: id,
            resumeJson: resumeJson,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String resumeJson,
            Value<int> rowid = const Value.absent(),
          }) =>
              ExperiencesLocalesCompanion.insert(
            id: id,
            resumeJson: resumeJson,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$ExperiencesLocalesTableProcessedTableManager = ProcessedTableManager<
    _$BaseLocale,
    $ExperiencesLocalesTable,
    LigneResume,
    $$ExperiencesLocalesTableFilterComposer,
    $$ExperiencesLocalesTableOrderingComposer,
    $$ExperiencesLocalesTableAnnotationComposer,
    $$ExperiencesLocalesTableCreateCompanionBuilder,
    $$ExperiencesLocalesTableUpdateCompanionBuilder,
    (
      LigneResume,
      BaseReferences<_$BaseLocale, $ExperiencesLocalesTable, LigneResume>
    ),
    LigneResume,
    PrefetchHooks Function()>;
typedef $$PacksLocauxTableCreateCompanionBuilder = PacksLocauxCompanion
    Function({
  required String id,
  required int version,
  required String definitionJson,
  Value<int> rowid,
});
typedef $$PacksLocauxTableUpdateCompanionBuilder = PacksLocauxCompanion
    Function({
  Value<String> id,
  Value<int> version,
  Value<String> definitionJson,
  Value<int> rowid,
});

class $$PacksLocauxTableFilterComposer
    extends Composer<_$BaseLocale, $PacksLocauxTable> {
  $$PacksLocauxTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get version => $composableBuilder(
      column: $table.version, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get definitionJson => $composableBuilder(
      column: $table.definitionJson,
      builder: (column) => ColumnFilters(column));
}

class $$PacksLocauxTableOrderingComposer
    extends Composer<_$BaseLocale, $PacksLocauxTable> {
  $$PacksLocauxTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get version => $composableBuilder(
      column: $table.version, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get definitionJson => $composableBuilder(
      column: $table.definitionJson,
      builder: (column) => ColumnOrderings(column));
}

class $$PacksLocauxTableAnnotationComposer
    extends Composer<_$BaseLocale, $PacksLocauxTable> {
  $$PacksLocauxTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<int> get version =>
      $composableBuilder(column: $table.version, builder: (column) => column);

  GeneratedColumn<String> get definitionJson => $composableBuilder(
      column: $table.definitionJson, builder: (column) => column);
}

class $$PacksLocauxTableTableManager extends RootTableManager<
    _$BaseLocale,
    $PacksLocauxTable,
    LignePack,
    $$PacksLocauxTableFilterComposer,
    $$PacksLocauxTableOrderingComposer,
    $$PacksLocauxTableAnnotationComposer,
    $$PacksLocauxTableCreateCompanionBuilder,
    $$PacksLocauxTableUpdateCompanionBuilder,
    (LignePack, BaseReferences<_$BaseLocale, $PacksLocauxTable, LignePack>),
    LignePack,
    PrefetchHooks Function()> {
  $$PacksLocauxTableTableManager(_$BaseLocale db, $PacksLocauxTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$PacksLocauxTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$PacksLocauxTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$PacksLocauxTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<int> version = const Value.absent(),
            Value<String> definitionJson = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              PacksLocauxCompanion(
            id: id,
            version: version,
            definitionJson: definitionJson,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required int version,
            required String definitionJson,
            Value<int> rowid = const Value.absent(),
          }) =>
              PacksLocauxCompanion.insert(
            id: id,
            version: version,
            definitionJson: definitionJson,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$PacksLocauxTableProcessedTableManager = ProcessedTableManager<
    _$BaseLocale,
    $PacksLocauxTable,
    LignePack,
    $$PacksLocauxTableFilterComposer,
    $$PacksLocauxTableOrderingComposer,
    $$PacksLocauxTableAnnotationComposer,
    $$PacksLocauxTableCreateCompanionBuilder,
    $$PacksLocauxTableUpdateCompanionBuilder,
    (LignePack, BaseReferences<_$BaseLocale, $PacksLocauxTable, LignePack>),
    LignePack,
    PrefetchHooks Function()>;
typedef $$ProfilsLocauxTableCreateCompanionBuilder = ProfilsLocauxCompanion
    Function({
  required String id,
  required String profilJson,
  Value<int> rowid,
});
typedef $$ProfilsLocauxTableUpdateCompanionBuilder = ProfilsLocauxCompanion
    Function({
  Value<String> id,
  Value<String> profilJson,
  Value<int> rowid,
});

class $$ProfilsLocauxTableFilterComposer
    extends Composer<_$BaseLocale, $ProfilsLocauxTable> {
  $$ProfilsLocauxTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get profilJson => $composableBuilder(
      column: $table.profilJson, builder: (column) => ColumnFilters(column));
}

class $$ProfilsLocauxTableOrderingComposer
    extends Composer<_$BaseLocale, $ProfilsLocauxTable> {
  $$ProfilsLocauxTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get profilJson => $composableBuilder(
      column: $table.profilJson, builder: (column) => ColumnOrderings(column));
}

class $$ProfilsLocauxTableAnnotationComposer
    extends Composer<_$BaseLocale, $ProfilsLocauxTable> {
  $$ProfilsLocauxTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get profilJson => $composableBuilder(
      column: $table.profilJson, builder: (column) => column);
}

class $$ProfilsLocauxTableTableManager extends RootTableManager<
    _$BaseLocale,
    $ProfilsLocauxTable,
    LigneProfil,
    $$ProfilsLocauxTableFilterComposer,
    $$ProfilsLocauxTableOrderingComposer,
    $$ProfilsLocauxTableAnnotationComposer,
    $$ProfilsLocauxTableCreateCompanionBuilder,
    $$ProfilsLocauxTableUpdateCompanionBuilder,
    (
      LigneProfil,
      BaseReferences<_$BaseLocale, $ProfilsLocauxTable, LigneProfil>
    ),
    LigneProfil,
    PrefetchHooks Function()> {
  $$ProfilsLocauxTableTableManager(_$BaseLocale db, $ProfilsLocauxTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ProfilsLocauxTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ProfilsLocauxTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ProfilsLocauxTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> profilJson = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ProfilsLocauxCompanion(
            id: id,
            profilJson: profilJson,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String profilJson,
            Value<int> rowid = const Value.absent(),
          }) =>
              ProfilsLocauxCompanion.insert(
            id: id,
            profilJson: profilJson,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$ProfilsLocauxTableProcessedTableManager = ProcessedTableManager<
    _$BaseLocale,
    $ProfilsLocauxTable,
    LigneProfil,
    $$ProfilsLocauxTableFilterComposer,
    $$ProfilsLocauxTableOrderingComposer,
    $$ProfilsLocauxTableAnnotationComposer,
    $$ProfilsLocauxTableCreateCompanionBuilder,
    $$ProfilsLocauxTableUpdateCompanionBuilder,
    (
      LigneProfil,
      BaseReferences<_$BaseLocale, $ProfilsLocauxTable, LigneProfil>
    ),
    LigneProfil,
    PrefetchHooks Function()>;

class $BaseLocaleManager {
  final _$BaseLocale _db;
  $BaseLocaleManager(this._db);
  $$TentativesLocalesTableTableManager get tentativesLocales =>
      $$TentativesLocalesTableTableManager(_db, _db.tentativesLocales);
  $$EvenementsLocauxTableTableManager get evenementsLocaux =>
      $$EvenementsLocauxTableTableManager(_db, _db.evenementsLocaux);
  $$ExperiencesLocalesTableTableManager get experiencesLocales =>
      $$ExperiencesLocalesTableTableManager(_db, _db.experiencesLocales);
  $$PacksLocauxTableTableManager get packsLocaux =>
      $$PacksLocauxTableTableManager(_db, _db.packsLocaux);
  $$ProfilsLocauxTableTableManager get profilsLocaux =>
      $$ProfilsLocauxTableTableManager(_db, _db.profilsLocaux);
}
