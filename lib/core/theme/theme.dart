// Seul fichier de thème : toutes les couleurs, tailles et espacements viennent d'ici.
import 'package:flutter/material.dart';

abstract final class Couleurs {
  static const fond = Color(0xFFF4F8FA);
  static const texte = Color(0xFF0D2149);
  static const teal = Color(0xFF0E4D5C);
  static const vert = Color(0xFF2FA84F);
  static const orange = Color(0xFFFF8A1F);
  static const bleu = Color(0xFF1A73D1);
  static const violet = Color(0xFF6A4FD0);
  static const rouge = Color(0xFFD6342C);

  // Dérivées neutres de la palette (surfaces, bordures, textes secondaires).
  static const surface = Color(0xFFFFFFFF);
  static const bordure = Color(0xFFD5E1E6);
  static const texteDoux = Color(0xFF4A5B70);
  static const fondTeal = Color(0xFFE6EFF1);
  static const fondRouge = Color(0xFFFDECEA);
  static const liquide = Color(0x331A73D1);

  static Color pourMatiere(String matiere) => switch (matiere) {
        'physique' => bleu,
        'chimie' => orange,
        'svt' => vert,
        'genie_civil' => violet,
        _ => teal,
      };
}

/// Grille de 8.
abstract final class Espace {
  static const double x1 = 8;
  static const double x2 = 16;
  static const double x3 = 24;
  static const double x4 = 32;
  static const double x5 = 40;
  static const double x6 = 48;
  static const double x8 = 64;
}

abstract final class Tailles {
  static const double zoneTactile = 48;
  static const double rayon = 16;
  static const double rayonPetit = 8;
  static const double icone = 24;
  static const double iconeGrande = 48;
  static const double trait = 2;
  static const double traitFin = 1;
  static const double largeurFormulaire = 480;
  static const double largeurContenu = 960;
  static const double hauteurBarreBas = 72;
  static const double hauteurCourbe = 160;
}

abstract final class Durees {
  static const court = Duration(milliseconds: 150);
  static const normal = Duration(milliseconds: 250);
}

enum Largeur {
  compact,
  moyen,
  large;

  static Largeur de(double largeur) {
    if (largeur < 600) return Largeur.compact;
    if (largeur <= 1024) return Largeur.moyen;
    return Largeur.large;
  }

  static Largeur depuis(BuildContext context) =>
      de(MediaQuery.sizeOf(context).width);
}

ThemeData construireTheme() {
  const schema = ColorScheme(
    brightness: Brightness.light,
    primary: Couleurs.teal,
    onPrimary: Couleurs.surface,
    secondary: Couleurs.vert,
    onSecondary: Couleurs.texte,
    error: Couleurs.rouge,
    onError: Couleurs.surface,
    surface: Couleurs.surface,
    onSurface: Couleurs.texte,
  );

  final base = Typography.material2021(platform: TargetPlatform.android)
      .black
      .apply(bodyColor: Couleurs.texte, displayColor: Couleurs.texte);
  final texte = base.copyWith(
    headlineMedium: base.headlineMedium
        ?.copyWith(fontSize: 32, fontWeight: FontWeight.w700),
    titleLarge:
        base.titleLarge?.copyWith(fontSize: 24, fontWeight: FontWeight.w700),
    titleMedium:
        base.titleMedium?.copyWith(fontSize: 18, fontWeight: FontWeight.w600),
    bodyLarge: base.bodyLarge?.copyWith(fontSize: 16),
    bodyMedium: base.bodyMedium?.copyWith(fontSize: 16),
    bodySmall: base.bodySmall
        ?.copyWith(fontSize: 14, color: Couleurs.texteDoux),
    labelLarge:
        base.labelLarge?.copyWith(fontSize: 16, fontWeight: FontWeight.w600),
    labelMedium:
        base.labelMedium?.copyWith(fontSize: 14, fontWeight: FontWeight.w600),
    labelSmall: base.labelSmall?.copyWith(fontSize: 14),
  );

  final forme = RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(Tailles.rayon),
  );
  const tailleMin = Size(Tailles.zoneTactile, Tailles.zoneTactile);
  const marge = EdgeInsets.symmetric(horizontal: Espace.x3);

  return ThemeData(
    useMaterial3: true,
    colorScheme: schema,
    scaffoldBackgroundColor: Couleurs.fond,
    textTheme: texte,
    appBarTheme: AppBarTheme(
      backgroundColor: Couleurs.fond,
      foregroundColor: Couleurs.texte,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      titleTextStyle: texte.titleMedium,
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: Couleurs.vert,
        foregroundColor: Couleurs.texte,
        disabledBackgroundColor: Couleurs.bordure,
        disabledForegroundColor: Couleurs.texteDoux,
        minimumSize: tailleMin,
        padding: marge,
        shape: forme,
        textStyle: texte.labelLarge,
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: Couleurs.teal,
        side: const BorderSide(color: Couleurs.teal),
        minimumSize: tailleMin,
        padding: marge,
        shape: forme,
        textStyle: texte.labelLarge,
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: Couleurs.teal,
        minimumSize: tailleMin,
        textStyle: texte.labelLarge,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Couleurs.surface,
      contentPadding: const EdgeInsets.all(Espace.x2),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(Tailles.rayon),
        borderSide: const BorderSide(color: Couleurs.bordure),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(Tailles.rayon),
        borderSide: const BorderSide(color: Couleurs.bordure),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(Tailles.rayon),
        borderSide:
            const BorderSide(color: Couleurs.teal, width: Tailles.trait),
      ),
      labelStyle: texte.bodyMedium?.copyWith(color: Couleurs.texteDoux),
    ),
    navigationBarTheme: NavigationBarThemeData(
      height: Tailles.hauteurBarreBas,
      backgroundColor: Couleurs.surface,
      indicatorColor: Couleurs.fondTeal,
      labelTextStyle: WidgetStatePropertyAll(texte.labelMedium),
    ),
    navigationRailTheme: NavigationRailThemeData(
      backgroundColor: Couleurs.surface,
      indicatorColor: Couleurs.fondTeal,
      selectedLabelTextStyle: texte.labelMedium,
      unselectedLabelTextStyle:
          texte.labelMedium?.copyWith(color: Couleurs.texteDoux),
    ),
    dividerTheme: const DividerThemeData(
      color: Couleurs.bordure,
      thickness: Tailles.traitFin,
      space: Tailles.traitFin,
    ),
  );
}
