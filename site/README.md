# Site mova.ia

Site statique (HTML/CSS/JS, aucune dépendance). Ouvrir `index.html` dans un navigateur pour le voir.

## À compléter avant la mise en ligne

1. **Lien de réservation** : dans `app.js`, renseigner `CONFIG.bookingUrl`.
   Google Agenda > Créer > Planning des rendez-vous > durée 30 min, lieu Google Meet,
   disponibilités (jeudi 17h30-21h, samedi et dimanche 9h-11h / 15h-20h) > Partager > copier le lien.
2. **Formulaire** : créer un formulaire sur formspree.io (gratuit), renseigner `CONFIG.formEndpoint`
   avec l'URL `https://formspree.io/f/xxxxxxx`. Tant que ce champ est vide, rien n'est envoyé.
3. **Mentions légales et confidentialité** : remplacer tous les champs surlignés « À COMPLÉTER ».
   Un SIREN est nécessaire pour facturer.
4. **Hébergement** : glisser le dossier `site/` sur Netlify ou Cloudflare Pages, puis relier le domaine mova.ia.

## Contenu à valider

- Démo du haut de page : conversation et dossier fictifs, réglés dans `index.html` (attributs `data-t` = moment d'apparition en millisecondes).
- Catalogue « Ce que vous pouvez nous confier » : ne garder que ce qui est réellement livrable.
- Simulateur : hypothèses fixes en haut de la fonction `sim()` dans `app.js` (1 demande sur 50 transformée, 50 % récupérées, 8 min par demande).

## Chiffres affichés

- 42 h, 23 %, ×7 : Harvard Business Review, 2011, « The Short Life of Online Sales Leads » (2 241 entreprises américaines).
- 47 % : Mike DelPrete, enquête client mystère, 2024, États-Unis.
Ne pas ajouter de chiffre sans source vérifiable.
