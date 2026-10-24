# Analyse de la vidéo de référence (1 min 30, ~8 fragments)

Créateur d'une autre niche (agence IA, données sensibles). Ce qui plaît à l'utilisateur : voix, animations, texte à l'écran, transitions, style des schémas. L'accroche est à adapter, pas à copier.

Méthode : captures à 4 images par seconde et zooms. Le son n'est pas écouté (seulement le volume).

## Partie 1 (0 à 9,7 s) – analysée
Fichier : 1170×2532, HEVC, audio AAC stéréo. Volume moyen −15,9 dB, pic −2,6 dB, aucun silence supérieur à 0,25 s (voix continue et dense).

| Temps | Ce qu'on voit |
|---|---|
| 0 – 2,5 s | Fond noir. Texte blanc central, petit, qui apparaît mot à mot (1 puis 2 lignes), s'efface vers 2,5 s. Tableau de bord vert incliné en 3D, cartes flottantes floues sur les côtés. |
| 2,5 – 6 s | Plus de texte. Le tableau de bord dérive lentement (travelling), teinté de vert, profondeur de champ marquée. |
| ≈ 6 s | Bascule au rouge : flash, flou, lueur rouge sur les bords. |
| 6,75 – 9 s | Pastilles d'alerte rouges (messages d'erreur) décalées dans le temps, de tailles et de flous différents. |
| ≈ 9 s | Coupe franche vers un écran noir propre : barre de saisie type chat, un fichier déposé par un curseur. Début de la solution. |

Styles clés : décor sombre, interfaces 3D avec flou, couleur qui raconte (vert = tout va bien, rouge = ce qui cloche), texte minimal mot à mot, pastilles d'alerte, coupe nette problème → solution.

## Idée d'adaptation pour Mova ia (à valider)
- Vert : faux CRM d'agence, propre. Rouge : pastilles fictives reprenant les 4 pertes (demande sans réponse, double saisie, vendeur sans nouvelles, fichier acquéreur inactif). Coupe : interface Mova ia propre, agent qui répond. Mention « Exemple ».
- Ne pas imiter l'interface d'une application tierce vue dans la référence.

## Partie 2 (0 à 10,2 s) – analysée (fichier 9 Mo)
Volume moyen −15,9 dB, pic −2,0 dB, aucun silence supérieur à 0,25 s. Ordre dans la vidéo : suite probable de la partie 1 (introduit la solution), à confirmer.

| Temps | Ce qu'on voit |
|---|---|
| 0 – 2,2 s | Fond noir avec grille très discrète. Texte blanc central, mot à mot, sur 2 lignes (« Sauf qu'il existe une meilleure façon / de faire »). Le texte rétrécit légèrement avant de disparaître. |
| 2,3 – 3,3 s | Le texte se **transforme en logo** : une petite forme blanche devient l'icône de la marque du créateur, puis le nom s'écrit lettre par lettre. |
| 3,3 – 6 s | Le logo est fixe au centre, une lueur verte douce apparaît derrière, léger travelling. |
| 6 s | **Coupe franche** vers un paysage sombre (montagnes, prairie, lueur verte type aurore, image générée) avec une grande zone de saisie en gros plan, au texte indicatif. |
| 6 – 10 s | **Recul de caméra** : la zone de saisie rétrécit et flotte au centre du paysage. Un curseur apparaît à la fin. |

## Partie 3 (0 à 9,7 s) – analysée (fichier 20 Mo)
Volume moyen −15,5 dB, pic −1,8 dB, aucun silence supérieur à 0,25 s.

| Temps | Ce qu'on voit |
|---|---|
| 0 – 3 s | Écrans d'un produit en 3D inclinés, qui glissent et se succèdent (liste de projets, page d'intégrations, réglages). En haut, une **liste de mots avec coche verte** s'écrit un par un, au rythme de la voix (« les specs », « les accès », « le budget »). |
| ≈ 3,3 s | **Coupe franche** vers le paysage vert avec un gros bouton verre « Accepter » en gros plan. |
| 3,3 – 5 s | **Recul de caméra** : le bouton flotte dans le décor, un curseur arrive et clique (cercle d'onde au clic). |
| 5,3 – 8 s | Une **carte verre** apparaît : « L'agent travaille actuellement sur votre projet », avec une icône animée en anneau. |
| 8,3 – 9,7 s | **Avancée de caméra** sur la carte : une liste de tâches s'écrit ligne par ligne avec coches et petits chargements (génération, vérification des erreurs, contrôle de la qualité, enregistrement). |

## Constantes de style (parties 1 à 3)
1. **Décor** : noir et vert profond, lueur verte (aurore), paysage sombre généré, grille très discrète. Le rouge sert aux problèmes.
2. **Éléments d'interface en verre** (translucides, bord lumineux, flottants), avec un curseur qui clique et une onde au clic.
3. **Mouvements de caméra** : travelling lent, inclinaison 3D, et surtout **plan serré qui recule** pour révéler l'élément dans le décor.
4. **Coupes franches** entre deux univers (problème / solution, écrans produit / paysage), pas de fondu long.
5. **Texte** : petit, central, **mot à mot**, souvent avec **coches vertes** qui s'écrivent au rythme de la voix. Il disparaît vite, le visuel prend le relais. Un texte peut se **transformer en logo**.
6. **Cartes de progression** : titre, icône animée, liste de tâches avec coches qui se remplissent.
7. **Voix** : continue, dense, sans silence de plus de 0,25 s, volume moyen autour de −15,5 à −16 dB.
8. Les écrans de produit de la référence sont **blancs** et très lumineux. Pour Mova ia, je les fais **sombres** (règle « pas de blanc éclatant »).

## Adaptation pour Mova ia (à valider)
- Problème : faux CRM d'agence vert qui bascule au rouge, avec pastilles d'alerte (les 4 pertes), mention « Exemple ».
- Transition : coupe vers le décor sombre, le texte se transforme en logo « mova.ia » (icône maison, le nom s'écrit lettre par lettre).
- Solution : gros plan sur une demande de lead qui recule pour révéler l'interface Mova ia dans le décor ; liste avec coches vertes de ce que prend en charge l'agent (réponse aux demandes, relances, fichier acquéreur…), carte de progression « L'agent Mova ia traite vos demandes… » avec tâches qui se cochent.
- Rien de copié : ni texte, ni logo « Maleus », ni interface de l'autre créateur.

## Partie 4 (0 à 10,4 s) – analysée (fichier 19,7 Mo)
Volume moyen −16,5 dB, pic −1,5 dB, aucun silence supérieur à 0,25 s. Suite directe de la partie 3 (même carte de progression au début).

| Temps | Ce qu'on voit |
|---|---|
| 0 – 1,5 s | La carte « L'agent travaille actuellement sur votre projet » termine : les 4 tâches se cochent, l'anneau passe au vert. |
| 1,7 – 7,5 s | Coupe vers un écran de produit incliné qui entre par le bas à droite : des notes en cercle (« A+ » qualité, sécurité…), tableaux de chiffres. **Travelling latéral lent** le long de l'écran (3D). |
| 7,7 s | Coupe vers le paysage : un bouton verre « Déployer maintenant » (avec une petite fusée) et un curseur. |
| 8 – 10,4 s | Un flou net, puis une **fenêtre de formulaire** (« Connecter un dépôt ») apparaît en gros plan et **recule** dans le décor, avec un cercle de clic. Elle reste à l'écran jusqu'à la fin. |

## Partie 5 (0 à 13 s) – analysée, c'est la fin (fichier 12,9 Mo)
Volume moyen −18,3 dB, pic −1,3 dB. Silence à partir de 12,4 s : c'est la fin de la voix. Les dernières images (centre de contrôle de l'iPhone) sont l'arrêt de l'enregistrement d'écran, pas la vidéo.

| Temps | Ce qu'on voit |
|---|---|
| 0 – 2,2 s | Phrase mot à mot au-dessus de l'écran de scores, qui reste dans le décor : « Et vous, une véritable gouvernance IT » (les derniers mots apparaissent en teinte plus claire avant de s'allumer). |
| 2,3 – 3,7 s | Tout disparaît sur un flash : une forme blanche s'assemble en **icône du logo**, puis le nom s'écrit lettre par lettre. Fond noir avec grille discrète. |
| 4 – 7,7 s | Sous le logo, une **phrase de promesse** s'écrit mot à mot sur 2 lignes (« Vos collaborateurs créent, pendant que vous gardez le contrôle »). Le bloc logo + texte monte à mesure que le texte grandit. |
| 7,7 – 9 s | Un **bouton vert « Réserver une démo → »** apparaît sous le texte. Un curseur arrive du bas gauche, le bouton devient blanc au survol, un cercle marque le clic. |
| 9 – 12 s | Carte finale **fixe** (logo, promesse, bouton), la voix termine. |

## Ordre des parties et fragments manquants
- Les parties se suivent : 1 (accroche : problème) → 2 (« il existe une meilleure façon », logo) → 3 (démonstration) → 4 (résultats) → 5 (carte finale avec bouton).
- Entre certaines parties, il manque du contenu (cassures de continuité entre 2 et 3, et entre 4 et 5). Le Drive contient 8 fichiers : il en manque donc 3 (les fichiers du Drive de 20,6 Mo, 11,4 Mo et 19,7 Mo), à ajouter pour la vidéo complète d'environ 90 s.
- Les pièces jointes jusqu'à environ 20 Mo passent dans le chat.

## Constantes complémentaires (parties 4 et 5)
9. **Structure de la référence** : problème (rouge) → « il existe une meilleure façon » → logo → démonstration dans un décor cinématographique → résultats chiffrés → phrase de promesse → bouton d'action avec curseur qui clique → carte finale fixe.
10. **Appel à l'action** : bouton unique « Réserver une démo », curseur animé, onde au clic, carte finale tenue environ 3 secondes. Pour Mova ia : « Réserver mon diagnostic offert », avec lien en bio ou domaine affiché.
11. **Cartes de résultat** : notes en cercle (type « A+ ») et tableaux de chiffres en 3D. Pour Mova ia : indicateurs d'agence illustrés (exemple).
12. Le **logo se construit** à chaque fois (forme blanche → icône → nom lettre par lettre), c'est un motif de marque.

## Parties à recevoir
Les 3 fragments manquants, avec la transcription de la voix et, si possible, l'ordre exact.

## Synthèse du style global
À rédiger après toutes les parties : rythme des coupes, types de schémas, transitions récurrentes, évolution de la voix et des couleurs, structure (accroche, problème, solution, appel à l'action).
