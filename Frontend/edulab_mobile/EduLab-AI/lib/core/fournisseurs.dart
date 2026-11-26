// Points d'injection : branchés dans main.dart, remplacés par des faux dans les tests.
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../features/connexion/depot_session.dart';
import '../features/horsligne/depot_local.dart';
import '../features/horsligne/service_sync.dart';
import 'api_provisoire/api.dart';

final apiProvider = Provider<ApiEdulab>(
  (ref) => throw UnimplementedError('apiProvider non branché'),
);

final depotLocalProvider = Provider<DepotLocal>(
  (ref) => throw UnimplementedError('depotLocalProvider non branché'),
);

final depotSessionProvider = Provider<DepotSession>(
  (ref) => throw UnimplementedError('depotSessionProvider non branché'),
);

final serviceSyncProvider = Provider<ServiceSync>(
  (ref) => ServiceSync(ref.watch(depotLocalProvider), ref.watch(apiProvider)),
);
