import 'dart:math' as math;

import 'validation.dart';

/// Volume de base versé à l'équivalence : Ca·Va = Cb·Vb, donc Vb = Ca·Va / Cb (mL).
double volumeEquivalentMl({
  required double caMolL,
  required double vaMl,
  required double cbMolL,
}) {
  exigerPositif('caMolL', caMolL);
  exigerPositif('vaMl', vaMl);
  exigerPositif('cbMolL', cbMolL);
  return caMolL * vaMl / cbMolL;
}

/// pH par la neutralité électrique : d = (Ca·Va − Cb·V)/(Va + V),
/// [H+] = (d + √(d² + 4·10⁻¹⁴)) / 2. Acide fort dosé par une base forte.
double phTitrage({
  required double caMolL,
  required double vaMl,
  required double cbMolL,
  required double volumeVerseMl,
}) {
  exigerPositif('caMolL', caMolL);
  exigerPositif('vaMl', vaMl);
  exigerPositif('cbMolL', cbMolL);
  exigerPositifOuNul('volumeVerseMl', volumeVerseMl);
  final d = (caMolL * vaMl - cbMolL * volumeVerseMl) / (vaMl + volumeVerseMl);
  final h = (d + math.sqrt(d * d + 4e-14)) / 2;
  return -math.log(h) / math.ln10;
}

/// Concentration de l'acide déduite d'un volume équivalent : Ca = Cb·Vb / Va (mol/L).
double concentrationAcideMolL({
  required double cbMolL,
  required double vbMl,
  required double vaMl,
}) {
  exigerPositif('cbMolL', cbMolL);
  exigerPositifOuNul('vbMl', vbMl);
  exigerPositif('vaMl', vaMl);
  return cbMolL * vbMl / vaMl;
}
