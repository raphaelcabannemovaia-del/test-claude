# Site mova.ia

Site statique (HTML/CSS/JS, aucune dépendance externe, polices hébergées dans `fonts/`). Ouvrir `index.html` dans un navigateur pour le voir.

## À compléter avant la mise en ligne

1. **Lien de réservation** : dans `app.js`, renseigner `CONFIG.bookingUrl`.
   Google Agenda > Créer > Planning des rendez-vous > durée 30 min, lieu Google Meet, vos disponibilités > Partager > copier le lien.
2. **Formulaire** : renseigner `CONFIG.formEndpoint`. Tant que ce champ est vide, rien n'est envoyé.
   - Option recommandée pour le RGPD : un webhook n8n (n8n Cloud hébergé dans l'UE, ou n8n auto-hébergé en Europe).
     Nœud Webhook en POST, réponse JSON, « Allowed Origins (CORS) » réglé sur le domaine du site, puis envoi d'un email et ajout à un tableur.
   - Option rapide : Formspree (stockage aux États-Unis ; vérifier la certification Data Privacy Framework et le contrat de sous-traitance avant usage).
3. **Mentions légales** (`mentions-legales.html`) : garder un seul cas (société ou entrepreneur individuel) et remplir tous les champs surlignés.
   Le directeur de la publication est le représentant légal de la société éditrice, ou l'entrepreneur lui-même s'il est majeur.
4. **Confidentialité** (`confidentialite.html`) : remplir la date, l'email de contact, la liste des prestataires et, pour chacun hors UE, la garantie de transfert.
5. **Hébergement** : glisser le dossier `site/` sur Netlify, Cloudflare Pages ou un hébergeur européen, puis relier le domaine.

## RGPD : ce qui est déjà en place

- Aucun cookie, aucun traceur, aucune mesure d'audience : pas de bandeau cookies nécessaire tant que rien de tel n'est ajouté.
- Polices auto-hébergées (`fonts.css`) : aucune adresse IP transmise à Google pendant la consultation.
- Information sous le formulaire (responsable, finalité, base légale, durée, droits, lien vers la politique).
- Base légale du formulaire : mesures précontractuelles (art. 6.1.b). Pas de case de consentement obligatoire.
- Politique de confidentialité structurée selon l'article 13 du RGPD, avec la section sous-traitance (art. 28) pour les données des agences clientes.

Si vous ajoutez Google Analytics, un pixel publicitaire ou une vidéo YouTube intégrée, un bandeau de consentement devient obligatoire.

## Contenu à valider

- Outils cités (bandeau et FAQ) : n8n, Make, Zapier, Claude, Claude Code, Mistral AI, OpenAI. Retirer ceux que vous n'utilisez pas réellement.
- Exemples : six automatisations types. Ne garder que ce qui est réellement livrable.
- FAQ « données » : l'hébergement UE et l'exclusion de l'entraînement des modèles doivent être vérifiés dans les conditions de chaque outil utilisé.
- Simulateur : mesure le temps passé aujourd'hui (leads × minutes + administratif × 4,33 semaines). Aucun gain annoncé.

## Chiffres affichés

- 68 % : Pied Piper, *Real Estate Lead Handling Effectiveness Study* 2026 (2 198 demandes, 21 réseaux, États-Unis) : demandes web sans réponse sous 24 h. Source : Real Estate News, 6 octobre 2026.
- 82 % : Realtors Property Resource (NAR), février 2026, 225 agents (États-Unis) : agents qui utilisent l'IA. Source : HousingWire.
- 40 % : Baromètre France Num 2026 (economie.gouv.fr, septembre 2026) : TPE et PME utilisant une solution d'IA ; 26 % dans l'édition 2025.
- −80 % : Anthropic, *Estimating AI productivity gains from Claude conversations*, novembre 2025 : temps de tâche estimé sur 100 000 conversations, hors temps de vérification.

Ne pas ajouter de chiffre sans source vérifiable. Revérifier chaque source dans sa publication d'origine avant la mise en ligne.
