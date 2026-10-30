# Générateur du lot de 5 vidéos mova.ia

Un moteur d'animation commun (`engine.html`) et un fichier de scènes par vidéo (`scenes/v1.js` à `v5.js`).

## Fichiers
- `videos.py` : les 5 scripts. Une entrée par phrase de la voix, avec le texte affiché (« * » vert, « ^ » rouge, « affiché|lu »).
- `voix/` : les prises ElevenLabs (voix « Hugo from Paris », modèle eleven_v4), deux par vidéo.
- `build_voice.py` : choisit la meilleure prise (transcription Whisper hors ligne comparée au script), la découpe en phrases d'après les pauses, ajoute les respirations, calcule le minutage mot à mot et écrit les sous-titres dans `video-beta/lot-5/`.
- `engine.html` : décor, tableau de bord en fond (vues Demandes, Vendeurs, Acquéreurs), cartes, carte de l'agent, bouton cliqué, listes inclinées, « Avant / Avec mova.ia », logo, carte finale, texte mot à mot, curseur.
- `scenes/vN.js` : les scènes de chaque vidéo, leurs moments clés (calés sur les mots de la voix), les bruitages et les repères de musique.
- `build_audio.py` : musique (tension, bascule rouge, groove au logo), bruitages, baisse de la musique sous la voix, normalisation à −15 LUFS.
- `render.py` : rendu image par image avec Chromium (30 i/s).
- `make.sh vN` : bruitages, mixage, rendu et assemblage final dans `video-beta/lot-5/`.

## Refaire une vidéo
1. Placer ce dossier dans un répertoire de travail et y créer les dossiers `v1` à `v5`.
2. `WHISPER_DIR=<modèle sherpa-onnx-whisper-small> python3 -I build_voice.py v1 voix/v1_a.mp3 voix/v1_b.mp3`
   (modèle : `https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2`, `pip install sherpa-onnx`). Sans `WHISPER_DIR`, la première prise est utilisée.
3. `python3 -I render.py v1 stills 2.0 10.5` pour vérifier des images, puis `./make.sh v1`.

Pour changer un texte : modifier `videos.py`, régénérer la voix dans ElevenLabs avec la même phrase lue, puis relancer les étapes 2 et 3.
