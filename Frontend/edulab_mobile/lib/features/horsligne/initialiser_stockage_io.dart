import 'dart:io';

import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import 'base_locale.dart';
import 'depot_drift.dart';
import 'depot_local.dart';

Future<DepotLocal> creerDepotLocal() async {
  final dossier = await getApplicationDocumentsDirectory();
  final base = BaseLocale(
    NativeDatabase.createInBackground(
      File(p.join(dossier.path, 'edulab.sqlite')),
    ),
  );
  return DepotDrift(base);
}
