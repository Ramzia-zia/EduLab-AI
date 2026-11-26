// Régénère demo/definitions.js à partir de definitions/*.json.
// Lancer depuis la racine du paquet : dart run tool/generer_demo.dart
import 'dart:convert';
import 'dart:io';

void main() {
  final fichiers = Directory('definitions')
      .listSync()
      .whereType<File>()
      .where((f) => f.path.endsWith('.json'))
      .toList()
    ..sort((a, b) => a.path.compareTo(b.path));
  final definitions = <String, Object?>{
    for (final f in fichiers)
      f.uri.pathSegments.last.replaceAll('.json', ''):
          jsonDecode(f.readAsStringSync()),
  };
  final json = const JsonEncoder.withIndent(' ').convert(definitions);
  File('demo/definitions.js').writeAsStringSync(
    '// Généré depuis definitions/*.json (ne pas modifier à la main)\n'
    'var DEFINITIONS = $json;\n',
  );
  stdout.writeln(
      'demo/definitions.js écrit (${definitions.length} expériences).');
}
