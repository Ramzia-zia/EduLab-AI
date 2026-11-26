// MODE DÉMO : fausses données pour voir le rendu du front sans serveur.
// À supprimer (avec main_demo.dart) quand le vrai backend est branché.
import '../core/api_provisoire/modeles.dart';
import '../features/experiences/catalogue_simulations.dart';

const profilDemo =
    Profil(id: 'demo-eleve', nom: 'Kossi Ametoglo', role: 'eleve');

final resumesDemo = simulationsLocales();
