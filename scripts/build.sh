#!/bin/bash

BUILD_DIR=../../build/quiz

echo "[INFO] Transpiling and bundling, this may take a while..."

mkdir -p build/quiz
cp -r src/chords build
cp -r templates build
cp app.json build
babel src/index.js | browserify - > build/index.js

(
    cd src/quiz ;

    for quiz in $(ls); do
        DEST="$BUILD_DIR/$quiz"

        mkdir -p $DEST
        babel "$quiz/quiz.js" | browserify - > $DEST/quiz.js

        cp "$quiz/"*.css $DEST
    done

)

