import 'dart:convert';
import 'dart:io';

import 'mini_test.dart';

void main() {
  group('démo navigateur', () {
    test(
        'demo/definitions.js contient exactement les définitions JSON (sinon : dart run tool/generer_demo.dart)',
        () {
      final js = File('demo/definitions.js').readAsStringSync();
      final debut =
          js.indexOf('var DEFINITIONS = ') + 'var DEFINITIONS = '.length;
      final fin = js.lastIndexOf(';');
      final dansLaDemo =
          jsonDecode(js.substring(debut, fin)) as Map<String, dynamic>;
      final fichiers = Directory('definitions')
          .listSync()
          .whereType<File>()
          .where((f) => f.path.endsWith('.json'));
      expect(dansLaDemo.length, equals(fichiers.length));
      for (final f in fichiers) {
        final id = f.uri.pathSegments.last.replaceAll('.json', '');
        expect(jsonEncode(dansLaDemo[id]),
            equals(jsonEncode(jsonDecode(f.readAsStringSync()))));
      }
    });

    test('la démo compilée existe', () {
      expect(File('demo/labo_core.js').existsSync(), isTrue);
      expect(File('demo/index.html').existsSync(), isTrue);
    });
  });
}
