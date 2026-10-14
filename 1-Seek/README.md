# Seek / Flee — cibles autonomes

Ouvrir `index.html` dans un navigateur ou servir ce dossier avec un serveur HTTP local.

- Flee au démarrage : 20 vaisseaux et une cible rouge autonome.
- Vaisseaux : curseur de 1 à 200, actif dans tous les modes.
- Cibles Flee : curseur de 1 à 20, actif dans les deux modes Flee.
- Rayon de détection des cibles : 0 à 300 px, cercle blanc. À 0, fuite désactivée.
- Les cibles accélèrent automatiquement dans leur direction jusqu'à 6 px/image,
  avec une force maximale de 0,1. Une cible au repos repart vers +x.
- Distance de sécurité : 300 px entre les centres, cercle orange.
- Dans le rayon de détection, vitesse désirée à la moitié de `maxSpeed` à
  300 px ou plus, puis augmentation linéaire jusqu'à `maxSpeed` à distance nulle.
  L'accélération respecte `maxForce` ; la locomotion reste celle de Vehicle.
- Superposition : fuite dans la direction courante, ou vers +x au repos.
- Cibles multiples : somme des forces de fuite, limitée à `maxForce`.
- Hors détection : force de fuite nulle, vitesse existante conservée.
- Vitesse max : 0 à 20 ; force max : 0 à 10. Réglages immédiats.
- Réglages initiaux des vaisseaux : vitesse max 14, force max 0,6. La vitesse
  désirée de fuite vaut donc 7 à 14 px/image face aux cibles limitées à 6.
- Seek suit seulement la première cible ; réglages propres à Flee désactivés.
- Changer de mode conserve les effectifs et les instances existantes.
- Les entités traversent les bords avec `Vehicle.edges()`.
- Seek seulement : réapparition des vaisseaux à 16 px ou moins de la cible.

La sécurité est une zone de réaction. La séparation réelle dépend de la vitesse,
de la force et des cibles environnantes ; des forces opposées peuvent s'annuler.
Le pilotage suit le modèle Reynolds : vitesse désirée moins vitesse courante,
force limitée puis locomotion séparée.

`vehicle.js` reste inchangé. `Ship` (`ship.js`) et `Target` héritent de `Vehicle`.
`Ship.steering()` choisit Seek ou Flee ; dessin et locomotion restent hérités.
`flee.js` calcule les
forces ; `targetAcceleration.js` calcule l'accélération autonome des cibles ;
`fleeControls.js` gère les réglages des cibles ; `population.js` gère
les vaisseaux ; `sketch.js` compose les comportements et relie les curseurs.

## Tests

Depuis la racine du dépôt, Node.js 18 ou plus :

```sh
node --test 1-Seek/tests/*.test.mjs
```

Aucune dépendance à installer. Tests du vrai `vehicle.js` avec adaptateur vectoriel
et aléatoire déterministe : forces, accélération, limites, proximité, composition,
effectifs, curseurs et changements de mode. Les tests de scène simulent le DOM
et les appels de dessin ; ils ne constituent pas une vérification visuelle du navigateur.
