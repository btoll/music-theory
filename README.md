### The Big Idea
When I lived in the Bay Area, I took jazz guitar lessons. Very often, I found myself unable to immediately recall the correct makeup of a particular chord, and, as I am a perfectionist, this was a continual source of annoyance.

My first solution was to carry around a packet of index cards bound by a rubber band.  I liked it at first, because it hearkened back to the days when I would do the same to help learn assorted Latin and Italian verb conjugations, but it quickly became unwieldy and/or I would forget to bring them with me.

When I thought about it, it just made sense to make this into a web application. For one, I always have my phone with me, so I could access the quizzes whenever I had a free moment. And two, why not?

### Examples
![ScreenShot](https://raw.github.com/btoll/i/master/music_theory/chord_quizzes.png)
![ScreenShot](https://raw.github.com/btoll/i/master/music_theory/key_signature_quiz.png)

+ Live [demo]
[demo]: http://music-theory.theowlsnestfarm.com/

### Creating a New Quiz
Each quiz exists in its own sandbox (an iframe). Because of this, each quiz is expected to provide its own stylesheet as well as its own JavaScript script, which are expected to be named quiz.css and quiz.js, respectively.  This uniformity will allow the app to easily bootstrap each sandboxed quiz when activated.

For example, the structure of a new quiz would look like the following:

    ./app/quizzes/NEW_QUIZ
        /quiz.css
        /quiz.js

After creating the static assets, simply tell the app about it. This is done by adding an entry in `app.json`. Note that the name of the new entry must match that of the new directory containing the new assets in the `quizzes/` directory tree, and this mapping establishes the point of entry for the new quiz:

    {
        "name": "NEW_QUIZ",
        "data": {
            "width": 600,
            "height": 270
        }
    }

(The data config currently only contains the quiz's dimensions, but that is extensible.)

This will create a new link in the quiz menu when the app is bootstrapped which will activate the new quiz.

    <a href="#NEW_QUIZ" title="New Quiz">New Quiz</a>

### Future Development
I've tried to make it easy to add new chords for the existing challenges. The process for adding them is as easy as adding the new directory in `app/chords/`. For example:

    ./app/chords/ninths/

This new chord directory is expected to have at least one `JSON` config file name `basic.json`. If there is a desire for more advanced chords, then add them in an `advanced.json` config file.  These names are mandatory.

Please see the `sevenths` chord directory for an example.

