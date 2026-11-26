import 'package:flutter/material.dart';

import '../theme/theme.dart';

/// Page defilante avec marge et largeur maximale.
class PageDefilante extends StatelessWidget {
  const PageDefilante({super.key, required this.enfants});
  final List<Widget> enfants;

  @override
  Widget build(BuildContext context) {
    final largeur = MediaQuery.sizeOf(context).width;
    final marge = largeur < Largeur.compact ? Espace.s : Espace.m;
    return SingleChildScrollView(
      padding: EdgeInsets.all(marge),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: Largeur.contenuMax),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (var i = 0; i < enfants.length; i++) ...[
                if (i > 0) const SizedBox(height: Espace.m),
                enfants[i],
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class EnTetePage extends StatelessWidget {
  const EnTetePage(
      {super.key,
      required this.titre,
      this.sous_titre,
      this.avec_salut = false,
      this.droite});
  final String titre;
  final String? sous_titre;
  final bool avec_salut;
  final Widget? droite;

  @override
  Widget build(BuildContext context) {
    final texte = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Flexible(
              child: Text(titre,
                  style: Theme.of(context).textTheme.headlineMedium),
            ),
            if (avec_salut) ...[
              const SizedBox(width: Espace.xs),
              const ExcludeSemantics(
                  child: Icon(Icons.waving_hand,
                      color: Couleurs.jaune, size: Taille.titrePage)),
            ],
          ],
        ),
        if (sous_titre != null) ...[
          const SizedBox(height: Espace.xs / 2),
          Text(sous_titre!,
              style: const TextStyle(
                  fontSize: Taille.texte, color: Couleurs.texteDiscret)),
        ],
      ],
    );
    return LayoutBuilder(builder: (context, c) {
      if (droite == null) return texte;
      if (c.maxWidth < Largeur.compact) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [texte, const SizedBox(height: Espace.s), droite!],
        );
      }
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [Expanded(child: texte), droite!],
      );
    });
  }
}

class Panneau extends StatelessWidget {
  const Panneau({
    super.key,
    this.titre,
    this.droite,
    this.libelle_lien,
    this.sur_lien,
    required this.enfant,
  });
  final String? titre;
  final Widget? droite;
  final String? libelle_lien;
  final VoidCallback? sur_lien;
  final Widget enfant;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(Espace.s),
      decoration: BoxDecoration(
        color: Couleurs.blanc,
        border: Border.all(color: Couleurs.bordure),
        borderRadius: BorderRadius.circular(Rayon.carte),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (titre != null)
            Row(
              children: [
                Expanded(
                  child: Text(titre!,
                      style: Theme.of(context).textTheme.titleMedium),
                ),
                if (droite != null) droite!,
                if (libelle_lien != null)
                  LienAction(libelle: libelle_lien!, sur_appui: sur_lien),
              ],
            ),
          if (titre != null) const SizedBox(height: Espace.xs),
          enfant,
        ],
      ),
    );
  }
}

class LienAction extends StatelessWidget {
  const LienAction({super.key, required this.libelle, this.sur_appui});
  final String libelle;
  final VoidCallback? sur_appui;

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: sur_appui,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(libelle),
          const SizedBox(width: Espace.xs / 2),
          const Icon(Icons.arrow_forward, size: 16),
        ],
      ),
    );
  }
}

class BoutonFleche extends StatelessWidget {
  const BoutonFleche({super.key, required this.libelle, required this.sur_appui});
  final String libelle;
  final VoidCallback sur_appui;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: sur_appui,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Flexible(child: Text(libelle)),
          const SizedBox(width: Espace.xs),
          const Icon(Icons.arrow_forward, size: 16),
        ],
      ),
    );
  }
}

class TuileStat extends StatelessWidget {
  const TuileStat(
      {super.key,
      required this.icone,
      required this.libelle,
      required this.valeur,
      this.couleur = Couleurs.menu});
  final IconData icone;
  final String libelle;
  final String valeur;
  final Color couleur;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '$libelle : $valeur',
      child: Container(
        padding: const EdgeInsets.symmetric(
            vertical: Espace.s, horizontal: Espace.xs),
        decoration: BoxDecoration(
          color: Couleurs.carte,
          border: Border.all(color: Couleurs.bordure),
          borderRadius: BorderRadius.circular(Rayon.carte),
        ),
        child: ExcludeSemantics(
          child: Column(
            children: [
              Icon(icone, size: Espace.l, color: couleur),
              const SizedBox(height: Espace.xs),
              Text(libelle,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      fontSize: Taille.texte, fontWeight: FontWeight.w600)),
              const SizedBox(height: Espace.xs / 2),
              Text(valeur,
                  style: const TextStyle(
                      fontSize: Taille.valeurStat,
                      fontWeight: FontWeight.w800,
                      color: Couleurs.texte)),
            ],
          ),
        ),
      ),
    );
  }
}

/// Ligne de tuiles : 4 cote a cote sur ecran large, 2 par ligne sinon.
class GrilleStats extends StatelessWidget {
  const GrilleStats({super.key, required this.enfants, this.max_colonnes = 4});
  final List<Widget> enfants;
  final int max_colonnes;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, c) {
      final colonnes = c.maxWidth >= 720 ? max_colonnes : 2;
      final largeur = (c.maxWidth - Espace.s * (colonnes - 1)) / colonnes;
      return Wrap(
        spacing: Espace.s,
        runSpacing: Espace.s,
        children: [
          for (final e in enfants) SizedBox(width: largeur, child: e),
        ],
      );
    });
  }
}

/// Deux panneaux cote a cote sur ecran large, empiles sinon.
class Rangee2 extends StatelessWidget {
  const Rangee2(
      {super.key,
      required this.gauche,
      required this.droite,
      this.flex_gauche = 3,
      this.flex_droite = 2});
  final Widget gauche;
  final Widget droite;
  final int flex_gauche;
  final int flex_droite;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, c) {
      if (c.maxWidth < 900) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [gauche, const SizedBox(height: Espace.m), droite],
        );
      }
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(flex: flex_gauche, child: gauche),
          const SizedBox(width: Espace.m),
          Expanded(flex: flex_droite, child: droite),
        ],
      );
    });
  }
}

/// Liste d'activites recentes (icone, texte, quand).
class ListeActivites extends StatelessWidget {
  const ListeActivites({super.key, required this.lignes});
  final List<({IconData icone, String texte, String quand})> lignes;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        for (var i = 0; i < lignes.length; i++) ...[
          if (i > 0) const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: Espace.xs),
            child: Row(
              children: [
                Container(
                  width: Espace.l,
                  height: Espace.l,
                  decoration: BoxDecoration(
                      color: Couleurs.vertClair,
                      borderRadius: BorderRadius.circular(Espace.xs)),
                  child: Icon(lignes[i].icone,
                      size: 18, color: Couleurs.vertGraphique),
                ),
                const SizedBox(width: Espace.xs),
                Expanded(
                    child: Text(lignes[i].texte,
                        style: const TextStyle(fontSize: Taille.texte))),
                const SizedBox(width: Espace.xs),
                Text(lignes[i].quand,
                    style: const TextStyle(
                        fontSize: Taille.texte, color: Couleurs.texteDiscret)),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
