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

## Parties à recevoir
Les autres fragments (environ 5 de plus), avec leur numéro et leur transcription. Ordre exact des parties à confirmer.

## Synthèse du style global
À rédiger après toutes les parties : rythme des coupes, types de schémas, transitions récurrentes, évolution de la voix et des couleurs, structure (accroche, problème, solution, appel à l'action).
