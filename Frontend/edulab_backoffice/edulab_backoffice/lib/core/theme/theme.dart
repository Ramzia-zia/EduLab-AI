// Fichier de theme unique : toutes les couleurs, tailles et espacements viennent d'ici.
import 'package:flutter/material.dart';

class Couleurs {
  Couleurs._();

  // Palette du prompt commun.
  static const fond = Color(0xFFF4F8FA);
  static const texte = Color(0xFF0D2149);
  static const teal = Color(0xFF0E4D5C);
  static const vert = Color(0xFF2FA84F);
  static const orange = Color(0xFFFF8A1F);
  static const bleu = Color(0xFF1A73D1);
  static const violet = Color(0xFF6A4FD0);
  static const rouge = Color(0xFFD6342C);

  // Couleurs relevees sur la maquette.
  static const blanc = Color(0xFFFFFFFF);
  static const menu = Color(0xFF0B5E1F);
  static const menuActif = Color(0xFFFFC72C);
  static const jaune = Color(0xFFFFC72C);
  static const vertGraphique = Color(0xFF1E8E3E);
  static const vertClair = Color(0xFFE6F4EA);
  static const carte = Color(0xFFF1F5F2);
  static const bordure = Color(0xFFDCE3DE);
  static const texteDiscret = Color(0xFF4B5B6B);
  static const bronze = Color(0xFFB8935A);
  static const rose = Color(0xFFC2185B);

  /// Couleur par matiere (prompt commun).
  static Color matiere(String matiere) {
    switch (matiere) {
      case 'physique':
        return bleu;
      case 'chimie':
        return orange;
      case 'svt':
        return vert;
      case 'genie_civil':
        return violet;
      default:
        return teal;
    }
  }

  /// Legende de la carte du Togo : >= 90, 70-89, 50-69, < 50.
  static Color niveauPerformance(double valeur) {
    if (valeur >= 90) return vertGraphique;
    if (valeur >= 70) return jaune;
    if (valeur >= 50) return orange;
    return bronze;
  }
}

/// Grille de 8.
class Espace {
  Espace._();
  static const double xs = 8;
  static const double s = 16;
  static const double m = 24;
  static const double l = 32;
  static const double xl = 48;
}

class Rayon {
  Rayon._();
  static const double carte = 12;
  static const double bouton = 24;
}

class Largeur {
  Largeur._();
  static const double compact = 600; // en dessous : compact
  static const double large = 1024; // au dessus : large
  static const double menu = 248;
  static const double contenuMax = 1360;
}

class Taille {
  Taille._();
  static const double zoneTactile = 48;
  static const double texte = 14;
  static const double titrePage = 28;
  static const double titreSection = 16;
  static const double valeurStat = 28;
}

class Duree {
  Duree._();
  static const court = Duration(milliseconds: 200);
}

ThemeData construireTheme() {
  final base = ColorScheme.fromSeed(
    seedColor: Couleurs.menu,
    primary: Couleurs.menu,
    secondary: Couleurs.jaune,
    error: Couleurs.rouge,
    surface: Couleurs.blanc,
  );
  return ThemeData(
    useMaterial3: true,
    colorScheme: base,
    scaffoldBackgroundColor: Couleurs.blanc,
    canvasColor: Couleurs.blanc,
    dividerColor: Couleurs.bordure,
    textTheme: const TextTheme(
      bodyMedium: TextStyle(fontSize: Taille.texte, color: Couleurs.texte),
      bodyLarge: TextStyle(fontSize: 16, color: Couleurs.texte),
      titleMedium: TextStyle(
          fontSize: Taille.titreSection,
          fontWeight: FontWeight.w700,
          color: Couleurs.texte),
      headlineMedium: TextStyle(
          fontSize: Taille.titrePage,
          fontWeight: FontWeight.w800,
          color: Couleurs.texte),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: Couleurs.menu,
        foregroundColor: Couleurs.blanc,
        elevation: 0,
        minimumSize: const Size(Taille.zoneTactile, Taille.zoneTactile),
        padding: const EdgeInsets.symmetric(horizontal: Espace.m),
        textStyle: const TextStyle(
            fontSize: Taille.texte, fontWeight: FontWeight.w700),
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(Rayon.bouton)),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: Couleurs.menu,
        minimumSize: const Size(Taille.zoneTactile, Taille.zoneTactile),
        textStyle: const TextStyle(
            fontSize: Taille.texte, fontWeight: FontWeight.w700),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Couleurs.blanc,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: Espace.s, vertical: Espace.s),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(Rayon.carte),
        borderSide: const BorderSide(color: Couleurs.bordure),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(Rayon.carte),
        borderSide: const BorderSide(color: Couleurs.bordure),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(Rayon.carte),
        borderSide: const BorderSide(color: Couleurs.menu, width: 2),
      ),
    ),
    dialogTheme: DialogThemeData(
      backgroundColor: Couleurs.blanc,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(Rayon.carte)),
    ),
  );
}
