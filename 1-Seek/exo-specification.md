# Exercice 1 — spécification des trois tâches

## Objectif

L’exemple montre un véhicule qui applique `seek` pour rejoindre une cible mobile. Le calcul reste local : vitesse désirée vers la cible, `steering = desiredVelocity - currentVelocity`, limitation par `maxForce`, puis application via `applyForce` et locomotion fournie par `Vehicle`.

## Tâche 1 — curseurs de pilotage

Deux curseurs HTML sont mis à jour avec l’événement `input` :

| Curseur | Propriété | Intervalle | Valeur initiale |
|---|---|---:|---:|
| Vitesse maximale | `vehicle.maxSpeed` | 0 à 20 inclus | 4 |
| Force maximale | `vehicle.maxForce` | 0 à 10 inclus | 0,1 |

Chaque changement est appliqué immédiatement aux véhicules existants et aux véhicules ajoutés ensuite. La valeur courante est affichée à côté du curseur. `vehicle.js` reste inchangé.

## Tâche 2 — suivre la cible

La souris ne pilote plus le steering. La scène instancie `Target`, une entité qui étend `Vehicle`, et les véhicules utilisent `target.pos` comme objectif commun. La cible reste visible en rouge et conserve son mouvement autonome.

Ordre d’une image :

1. mettre à jour et reboucler la cible ;
2. appeler `seek(target.pos)` pour chaque véhicule ;
3. appliquer la force avec `applyForce` ;
4. exécuter `update()` puis `edges()` ;
5. dessiner les véhicules et la cible.

La souris peut manipuler les contrôles, mais ne modifie pas `target.pos`.

## Tâche 3 — gradient radial animé

Le fond est un gradient radial arc-en-ciel composé de cercles concentriques. Son centre se déplace lentement avec le temps et les teintes parcourent progressivement le spectre. Le rendu est dans `background.js`, avant les entités, et ne modifie aucun état de steering.

## Organisation

| Fichier | Rôle |
|---|---|
| `sketch.js` | orchestration p5, cible autonome, contrôles et rendu |
| `settings.js` | bornes et application des réglages des véhicules |
| `background.js` | gradient radial animé |
| `target.js` | cible, sous-classe de `Vehicle` |
| `population.js` | population, réapparition et rebouclage |
| `vehicle.js` | code fourni, non modifié |
| `tests/population.test.mjs` | tests unitaires reproductibles |

## Critères d’acceptation

- Le curseur de vitesse est borné à `[0, 20]`.
- Le curseur de force est borné à `[0, 10]`.
- Les valeurs sont appliquées avec `input`, sans attendre le relâchement.
- Les véhicules suivent `Target`, jamais la position de la souris.
- La cible visible étend `Vehicle`.
- Le gradient radial arc-en-ciel est animé et placé derrière les entités.
- Les règles existantes de population, de réapparition et de rebouclage restent opérationnelles.
- `vehicle.js` reste inchangé.

## Test

Depuis `1-Seek` :

```sh
node --test tests/*.test.mjs
```

Les tests couvrent les bornes et l’application des réglages, la limite de `maxForce`, la conservation de la cible pendant `seek`, ainsi que les règles existantes de la scène.
