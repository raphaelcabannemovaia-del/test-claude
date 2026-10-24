# Générateur de la pub mova.ia (bêta)

Fabrique la vidéo 9:16 à partir du script, sans service externe.

1. Voix (Piper, voix d'homme française « tom ») : télécharger
   `https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-fr_FR-tom-medium.tar.bz2`
   et l'extraire dans `video-beta/tts-models/`. Installer `pip install piper-tts playwright numpy`.
2. `python3 -I build_voice.py` : voix, timing des mots, sous-titres `.srt`. Le script est dans la liste `SEGS`.
3. Assembler la page : remplacer `/*TL*/` de `template.html` par le contenu de `timeline.json`, dans `video.html`.
4. `python3 -I build_audio.py` : musique d'ambiance, bruitages, mixage (`mix.wav`).
5. `python3 -I render.py full silent.mp4` : rendu image par image (Chromium), puis
   `ffmpeg -i silent.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest sortie.mp4`.

Pour une voix premium, remplacer la synthèse de `build_voice.py` par l'appel au service choisi.
