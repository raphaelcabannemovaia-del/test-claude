# Site mova.ia

Site statique (HTML/CSS/JS, aucune dépendance externe, polices hébergées dans `fonts/`). Ouvrir `index.html` dans un navigateur pour le voir.

## À compléter avant la mise en ligne

1. **Demande de diagnostic** : le bouton de la section « Diagnostic offert » ouvre un e-mail prérempli vers `CONFIG.contactEmail` (dans `app.js`). Le visiteur doit appuyer sur « Envoyer » dans sa messagerie ; s'il n'en a pas de configurée, l'adresse s'affiche avec un bouton « Copier ». Pour répondre avec un lien de visio, créez un Planning des rendez-vous Google Agenda (30 min, Google Meet) et collez le lien dans votre réponse.
2. *(supprimé : l'ancien formulaire avec n8n n'est plus utilisé)*
3. **Mentions légales** (`mentions-legales.html`) : garder un seul cas (société ou entrepreneur individuel) et remplir tous les champs surlignés.
   Le directeur de la publication est le représentant légal de la société éditrice, ou l'entrepreneur lui-même s'il est majeur.
4. **Confidentialité** (`confidentialite.html`) : remplir la date, l'email de contact, la liste des prestataires et, pour chacun hors UE, la garantie de transfert.
5. **Hébergement** : glisser le dossier `site/` sur Netlify, Cloudflare Pages ou un hébergeur européen, puis relier le domaine.

## Ancien formulaire (n8n), conservé à titre facultatif

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
- Information sous le bouton de demande (responsable, finalité, base légale, durée, droits, lien vers la politique).
- Base légale de la demande de diagnostic : mesures précontractuelles (art. 6.1.b). Pas de case de consentement obligatoire.
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

## Conformité France et Union européenne

Pages du site : mentions légales, politique de confidentialité, politique de cookies, conditions d'utilisation, conditions générales de vente (CGV), annulation et remboursement. Elles sont liées dans le pied de page.

À faire avant la mise en ligne (les champs sont surlignés en jaune dans chaque page) :

1. Mentions légales : éditeur (société ou entrepreneur individuel), SIREN, hébergeur.
2. Confidentialité : hébergeur, outil de visioconférence, garanties pour les prestataires hors UE.
3. CGV et remboursement : acompte, délais, taux de pénalités, clause de propriété intellectuelle, tribunal compétent, plafond de responsabilité. Ces deux pages sont des modèles : à faire relire par un juriste avant le premier client.
4. Supprimer les blocs « Modèle à valider » une fois les pages relues.
5. Mettre à jour la date « Version du » à chaque modification de fond.

Cookies : le site ne dépose aucun cookie et n'a donc pas de bandeau. Le bandeau de consentement est déjà écrit et reste inactif tant qu'aucun traceur n'est ajouté. Pour ajouter un pixel ou un outil d'audience :

1. Insérer le script avec `type="text/plain"` et `data-consent="publicite"` (ou `"mesure"`), avant `app.js`. Il ne s'exécute qu'après accord.
2. Mettre à jour `cookies.html` (liste des traceurs, finalité, durée) et la politique de confidentialité (destinataires, transferts hors UE).
3. Ajouter le domaine du traceur dans la politique de sécurité de `_headers`, sinon le navigateur le bloque.
4. Le bandeau présente « Tout refuser » et « Tout accepter » au même niveau, conserve le choix 6 mois et ajoute le lien « Gérer mes cookies » dans le pied de page.

Accessibilité : lien d'évitement, contrastes de couleurs vérifiés (texte blanc sur vert profond `#007a5c`, le vert du logo `#00a87d` sert aux fonds sans texte), bouton de pause des animations, respect de « réduire les animations ». Contrôle automatique avec axe-core : aucune violation sur les sept pages. Un audit manuel (lecteur d'écran, zoom 200 %) reste recommandé.

En-têtes de sécurité : le fichier `_headers` est lu par Netlify et Cloudflare Pages. Sur un autre hébergeur, reprendre ces valeurs dans sa configuration.

## Guides et référencement

Cinq guides dans `guides/` (agents IA, leads portails, RGPD, suivi vendeur, calcul du temps gagné) et une page qui les regroupe (`guides/index.html`). Ils sont liés depuis la page d'accueil (section « Pour aller plus loin », entre la FAQ et la réservation), le menu mobile et le pied de page.

Pour corriger un guide, modifiez directement son fichier HTML.

Avant la mise en ligne :

1. Remplacer `https://www.votre-domaine.fr/` par le vrai domaine dans `sitemap.xml` et `robots.txt`.
2. Déclarer le site et le plan du site dans Google Search Console.
3. Enrichir chaque guide avec votre expérience réelle dès les premiers clients (cas concrets, chiffres mesurés, avec leur accord). C'est ce qui distingue un guide utile d'un texte générique pour les moteurs de recherche.
4. Publier un nouveau guide seulement s'il répond à une question différente des existants.
