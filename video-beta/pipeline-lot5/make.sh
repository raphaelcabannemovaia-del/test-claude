#!/bin/bash
# Fabrique une vidéo du lot : bruitages, mixage, rendu image par image, assemblage.
set -e
cd "$(dirname "$0")"
V=$1
NAME=$(python3 -I -c "import sys; sys.path.insert(0, '.'); from videos import VIDEOS; print(VIDEOS['$V']['name'])")
python3 -I render.py $V events
python3 -I build_audio.py $V
python3 -I render.py $V full
mkdir -p /home/user/test-claude/video-beta/lot-5
ffmpeg -v error -y -i $V/silent.mp4 -i $V/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart /home/user/test-claude/video-beta/lot-5/$NAME.mp4
echo "$V terminé : $NAME.mp4"
