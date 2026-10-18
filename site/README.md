# Site mova.ia

Site statique (HTML/CSS/JS, aucune dépendance externe, polices hébergées dans `fonts/`). Ouvrir `index.html` dans un navigateur pour le voir.

## À compléter avant la mise en ligne

1. **Lien de réservation** : dans `app.js`, renseigner `CONFIG.bookingUrl`.
   Google Agenda > Créer > Planning des rendez-vous > durée 30 min, lieu Google Meet, vos disponibilités > Partager > copier le lien.
2. **Formulaire** : renseigner `CONFIG.formEndpoint` (et, si vous voulez, `CONFIG.contactEmail`). Tant que `formEndpoint` est vide, rien n'est envoyé. Voir « Recevoir les demandes par email » ci-dessous.
3. **Mentions légales** (`mentions-legales.html`) : garder un seul cas (société ou entrepreneur individuel) et remplir tous les champs surlignés.
   Le directeur de la publication est le représentant légal de la société éditrice, ou l'entrepreneur lui-même s'il est majeur.
4. **Confidentialité** (`confidentialite.html`) : remplir la date, l'email de contact, la liste des prestataires et, pour chacun hors UE, la garantie de transfert.
5. **Hébergement** : glisser le dossier `site/` sur Netlify, Cloudflare Pages ou un hébergeur européen, puis relier le domaine.

## Recevoir les demandes par email (n8n)

Scénario prêt à importer : `automations/n8n-formulaire-diagnostic.json` (à la racine du dépôt, hors du dossier publié).
Il fait trois choses : vous envoie la demande par email, répond au site, puis envoie un email de confirmation au prospect avec votre lien de réservation.

1. Dans n8n : Workflows > Import from File > choisir le fichier.
2. Nœuds « Email pour moi » et « Confirmation au prospect » : créer l'identifiant Gmail (Credentials > Gmail OAuth2) en vous connectant avec raphaelcabanne.mova.ia@gmail.com. Les deux emails partent de cette adresse.
3. « Email pour moi » envoie déjà les demandes à raphaelcabanne.mova.ia@gmail.com : rien à changer.
4. « Confirmation au prospect » : remplacer `COLLER_ICI_LE_LIEN_DE_RESERVATION_GOOGLE_AGENDA` par votre lien.
5. Nœud « Formulaire du site » : vérifier que « Allowed Origins (CORS) » vaut `*` ou le domaine du site.
6. Activer le workflow (interrupteur Active), copier la **Production URL** du nœud Webhook et la coller dans `app.js`, `CONFIG.formEndpoint`.

Tester : ouvrir le site déployé (ou `index.html` sur votre ordinateur), remplir le formulaire avec votre propre email, puis vérifier dans n8n l'onglet Executions et votre boîte mail (et les spams).
L'aperçu sur claude.ai bloque tout envoi vers un autre site : aucun test d'envoi n'y fonctionne.

Le site envoie les champs en `application/x-www-form-urlencoded` : `name`, `agency`, `email`, `phone`, `city`, `team_size`, `revenue`, `tools`, `message`, `source`, `sent_at`.
Le même format fonctionne avec un webhook Make ou Formspree.

Problèmes fréquents :
- Le site affiche « L'envoi n'a pas abouti » : workflow non activé, URL de test collée au lieu de la Production URL, ou CORS mal réglé.
- n8n reçoit la demande mais aucun email n'arrive : identifiant Gmail non autorisé, ou email classé en spam.

## RGPD : ce qui est déjà en place

- Aucun cookie, aucun traceur, aucune mesure d'audience : pas de bandeau cookies nécessaire tant que rien de tel n'est ajouté.
- Polices auto-hébergées (`fonts.css`) : aucune adresse IP transmise à Google pendant la consultation.
- Champ piège invisible contre les robots : les envois automatiques sont ignorés sans gêner les visiteurs.
- Information sous le formulaire (responsable, finalité, base légale, durée, droits, lien vers la politique).
- Base légale du formulaire : mesures précontractuelles (art. 6.1.b). Pas de case de consentement obligatoire.
- Politique de confidentialité structurée selon l'article 13 du RGPD, avec la section sous-traitance (art. 28) pour les données des agences clientes.

Si vous ajoutez Google Analytics, un pixel publicitaire ou une vidéo YouTube intégrée, un bandeau de consentement devient obligatoire.

## Contenu à valider

- Outils cités (bandeau et FAQ) : n8n, Make, Zapier, Claude, Claude Code, Mistral AI, OpenAI. Retirer ceux que vous n'utilisez pas réellement.
- Procédé (5 étapes) et services (audit, automatisations sur mesure, support client 24h/24) : ne promettre que ce qui est réellement livrable.
- FAQ « données » : l'hébergement UE et l'exclusion de l'entraînement des modèles doivent être vérifiés dans les conditions de chaque outil utilisé.
- Simulateur : mesure le temps passé aujourd'hui (leads × minutes + administratif × 4,33 semaines). Aucun gain annoncé.

## Chiffres affichés

- 68 % : Pied Piper, *Real Estate Lead Handling Effectiveness Study* 2026 (2 198 demandes, 21 réseaux, États-Unis) : demandes web sans réponse sous 24 h. Source : Real Estate News, 6 octobre 2026.
- 82 % : Realtors Property Resource (NAR), février 2026, 225 agents (États-Unis) : agents qui utilisent l'IA. Source : HousingWire.
- 40 % : Baromètre France Num 2026 (economie.gouv.fr, septembre 2026) : TPE et PME utilisant une solution d'IA ; 26 % dans l'édition 2025.
- −80 % : Anthropic, *Estimating AI productivity gains from Claude conversations*, novembre 2025 : temps de tâche estimé sur 100 000 conversations, hors temps de vérification.

Ne pas ajouter de chiffre sans source vérifiable. Revérifier chaque source dans sa publication d'origine avant la mise en ligne.
