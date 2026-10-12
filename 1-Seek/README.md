# Seek — cible autonome, population et paramètres de pilotage

Ouvrir `index.html` dans un navigateur (ou servir ce dossier avec un serveur HTTP local).

- 20 véhicules au démarrage, réglables de 1 à 200 avec le slider, pendant le glissement.
- Les véhicules suivent la cible rouge autonome ; la souris ne pilote plus la cible.
- Les curseurs règlent en direct `maxSpeed` entre 0 et 20 et `maxForce` entre 0 et 10.
- Un gradient radial arc-en-ciel animé est rendu en arrière-plan.
- Les véhicules réapparaissent au bord opposé grâce à `Vehicle.edges()`.
- À 16 px ou moins de la cible, le véhicule réapparaît ailleurs avec une vitesse et une accélération nulles.
- Les véhicules conservés lors d'un changement d'effectif gardent leur état.

`vehicle.js` et `target.js` restent inchangés. `MouseTarget` remplace la cible autonome pour cette scène. Les fonctions de gestion de population sont dans `population.js` ; la boucle p5 et les interactions sont dans `sketch.js`.

## Tests

Depuis ce dossier, avec Node.js (18 ou plus) :

```sh
node --test tests/*.test.mjs
```

Aucune dépendance à installer. Les tests exécutent le vrai `vehicle.js` avec un adaptateur vectoriel minimal et un aléatoire déterministe. La validation du rendu avec p5 et du glissement réel se fait également dans le navigateur.

La [spécification](exo-specification.md) décrit les trois tâches demandées, les bornes et les critères de validation.
