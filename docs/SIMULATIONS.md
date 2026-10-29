# Intégrer une simulation scientifique (contrat front-end ↔ simulations)

Le front-end fournit le **conteneur** (page `simulation-detail.html`) : matériel, étapes, boutons Démarrer / Réinitialiser /
Précédent / Suivant, mesures, graphique, consignes, enregistrement du résultat.
Le moteur scientifique est fourni par l'équipe simulations, **indépendamment du reste du site**.
Le modèle à copier est `js/simulations/demo-titrage.js` (⚠ **données fictives**, pas un moteur validé).

## 1. Créer le module de la simulation
Un fichier `js/simulations/ma-simulation.js` qui exporte :

```js
export const definition = {
  id: 'loi-ohm',                       // identique à l'id du catalogue
  instruments: [{ name: 'Résistance', description: '...' }],
  steps: [{ title: 'Brancher le circuit', instruction: '...' }],
  instructions: ['Consigne 1', 'Consigne 2'],
  chart: { xLabel: 'Tension (V)', yLabel: 'Intensité (A)' },  // optionnel : active le graphique
  defaultParams: { resistance: 100 },  // paramètres d'entrée par défaut (optionnel)
};

export function mount(container, { params, onEvent, onError }) {
  // dessiner l'expérience dans "container" (HTML / SVG / Canvas)
  return {
    start()        { /* démarrer */ },
    reset()        { /* remettre à zéro */ },
    goToStep(i)    { /* l'utilisateur change d'étape (0, 1, 2...) */ },
    destroy()      { /* nettoyer */ },
  };
}
```

## 2. Événements envoyés au conteneur (`onEvent({ type, ... })`)

| type | données | effet dans l'interface |
|---|---|---|
| `ready` | — | la simulation est prête |
| `started` | — | l'expérience a démarré |
| `step-changed` | `step` (numéro) | met à jour la liste d'étapes |
| `measurement` | `measurement: { label, value, unit? }` | ajoute une ligne dans « Résultats et mesures » |
| `chart-point` | `point: { x, y }` | ajoute un point à la courbe |
| `finished` | `result: { simulationId, score, measures, durationSec }` | active « Enregistrer le résultat » |

Erreurs : `onError({ code, message })` → message affiché dans le conteneur.

## 3. Brancher la simulation
1. Dans `js/simulations/registry.js`, ajouter : `'loi-ohm': () => import('./ma-simulation.js'),`
2. Dans le catalogue (données ou API), mettre `available: true` pour cette expérience.

Aucune page HTML ni page JavaScript du front-end n'est à modifier.

## 4. Règles
- Ne pas afficher de valeurs inventées comme si elles étaient scientifiques : en attente de moteur, utiliser un module de démonstration clairement signalé (`isDemo: true`, avertissement visible).
- Le moteur doit être testable seul (sans le reste du site).
- Le fonctionnement **hors ligne** d'une simulation doit être implémenté et testé pour chaque expérience (pas automatique).
