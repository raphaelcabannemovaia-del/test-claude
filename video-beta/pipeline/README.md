# Générateur de la pub mova.ia (bêta)

Fabrique la vidéo 9:16 à partir d'une prise de voix et du script.

1. Voix : prise ElevenLabs (voix « Hugo from Paris », modèle eleven_v4), enregistrée dans `voice-v4-hugo.mp3`.
   Installer `pip install playwright numpy`.
2. `python3 -I build_voice.py [prise.mp3]` : découpe la prise en phrases d'après les pauses, ajoute des respirations,
   calcule le timing des mots et écrit les sous-titres `.srt`. Le texte affiché est dans la liste `CHUNKS`,
   une entrée par phrase de la prise, dans l'ordre. Avec une nouvelle prise, garder le même nombre de phrases.
3. Assembler la page : remplacer `/*TL*/` de `template.html` par le contenu de `timeline.json`, dans `video.html`.
4. `python3 -I build_audio.py` : musique, bruitages, mixage (`mix.wav`).
5. `python3 -I render.py full silent.mp4` : rendu image par image (Chromium), puis
   `ffmpeg -i silent.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest sortie.mp4`.

Voix hors ligne de secours (v1 à v3) : Piper, voix « Pierre » du modèle UPMC
(`https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-fr_FR-upmc-medium.tar.bz2`).
