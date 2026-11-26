import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final connectivityProvider = Provider<Connectivity>((ref) => Connectivity());

bool _enLigne(List<ConnectivityResult> r) =>
    r.any((x) => x != ConnectivityResult.none);

/// true quand le téléphone a un réseau (ce n'est pas une preuve que le serveur répond).
final enLigneProvider = StreamProvider<bool>((ref) async* {
  final c = ref.watch(connectivityProvider);
  yield _enLigne(await c.checkConnectivity());
  yield* c.onConnectivityChanged.map(_enLigne);
});
