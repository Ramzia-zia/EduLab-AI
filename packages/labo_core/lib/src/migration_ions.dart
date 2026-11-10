/// Électrodes du TP « migration des ions ». L'anode est l'électrode reliée à la borne + du
/// générateur, la cathode celle reliée à la borne -.
enum Electrode { anode, cathode }

/// Vers quelle électrode migre un porteur de charge ?
/// Une charge positive (Cu²⁺ : +2) migre vers la cathode (borne -),
/// une charge négative (MnO₄⁻ : -1) migre vers l'anode (borne +).
Electrode electrodeVersLaquelleMigre({required int chargeElementaire}) {
  if (chargeElementaire == 0) {
    throw ArgumentError.value(
        chargeElementaire, 'chargeElementaire', 'ne doit pas être nulle');
  }
  return chargeElementaire > 0 ? Electrode.cathode : Electrode.anode;
}

/// Le sens conventionnel du courant va de la borne + vers la borne - à l'extérieur du
/// générateur, donc de l'anode vers la cathode dans l'électrolyte. Les porteurs positifs
/// vont dans ce sens, les porteurs négatifs (ions négatifs, électrons d'un métal) en sens contraire.
bool memeSensQueCourantConventionnel({required int chargeElementaire}) {
  if (chargeElementaire == 0) {
    throw ArgumentError.value(
        chargeElementaire, 'chargeElementaire', 'ne doit pas être nulle');
  }
  return chargeElementaire > 0;
}
