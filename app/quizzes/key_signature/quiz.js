(function () {
    // Gather the note names that will be used to build the dom elements.
    var notes = [],
        // Gather the chord names that will be used to build the dom elements.
        chords = [],
        // Holds the permutations.
        quizzes = [],

        notesObj = {
            'A': ['F&#9839;', 'C&#9839;', 'G&#9839;'],
            'B': ['F&#9839;', 'C&#9839;', 'G&#9839;', 'D&#9839;', 'A&#9839;'],
            'C': ['No &#9839;s or &#9837;s'],
            'D': ['F&#9839;', 'C&#9839;'],
            'E': ['F&#9839;', 'C&#9839;', 'G&#9839;', 'D&#9839;'],
            'F': ['B&#9837;'],
            'G': ['F&#9839;'],
            'A&#9837;': ['B&#9837;', 'E&#9837;', 'A&#9837;', 'D&#9837;'],
            'B&#9837;': ['B&#9837;', 'E&#9837;'],
            'C&#9837;': ['B&#9837;', 'E&#9837;', 'A&#9837;', 'D&#9837;', 'G&#9837;', 'C&#9837;', 'F&#9837;'],
            'D&#9837;': ['B&#9837;', 'E&#9837;', 'A&#9837;', 'D&#9837;', 'G&#9837;'],
            'E&#9837;': ['B&#9837;', 'E&#9837;', 'A&#9837;'],
            'G&#9837;': ['B&#9837;', 'E&#9837;', 'A&#9837;', 'D&#9837;', 'G&#9837;', 'C&#9837;'],
            'C&#9839;': ['F&#9839;', 'C&#9839;', 'G&#9839;', 'D&#9839;', 'A&#9839;', 'E&#9839;', 'B&#9839;'],
            'F&#9839;': ['F&#9839;', 'C&#9839;', 'G&#9839;', 'D&#9839;', 'A&#9839;', 'E&#9839;']
        },

        random = function () {
            return (Math.round(Math.random()) - 0.5);
        },

        // Collect all of the arrays from within the notesObj object.
        getArrays = function () {
            var arr = [],
                prop;

            for (prop in notesObj) {
                if (notesObj.hasOwnProperty(prop)) {
                    // Get each note to use later when we build the dom elements.
                    notes.push(prop);
                    quizzes.push(notesObj[prop]);
                }

                quizzes.sort(random);
            }

            // Randomize them.
            //notes.sort(random);
        },

        n = 0,

        // Get the current chord to display to the user.
        getChord = function () {
            if (n === notes.length) {
                n = 0;
            }

            //Pete.getDom("currentKeySignature").innerHTML = "<span>" + notesObj[notes[n]].join("</span><span>");
            //Pete.getDom("currentKeySignature").currentKeySignature = notesObj[notes[n]]; //we need to attach the array to an expando property since we need another way of comparing than the value of the currentChord dom element (since the browser converts the entity when displaying it and it no longer matches the entity when comparing the values in the event handler);

            Pete.getDom('currentKeySignature').innerHTML = '<span>' + quizzes[n].join('</span><span>');

            // We need to attach the array to an expando property since we need another way of comparing than
            // the value of the currentChord dom element (since the browser converts the entity when displaying
            // it and it no longer matches the entity when comparing the values in the event handler).
            Pete.getDom('currentKeySignature').currentKeySignature = quizzes[n];

            n++;
        };

    getArrays();

    Pete.ready(function () {
        var i, len;

        Pete.Element.create({
            tag: 'div',
            id: 'keySignatureQuiz',
            items: [{
                tag: 'h3',
                attr: {
                    'innerHTML': 'Guess the key signature below by selecting the Key'
                }
            }, {
                tag: 'p',
                attr: {
                    'innerHTML': 'Key'
                }
            }, {
                tag: 'div',
                id: 'currentKeySignature',
                attr: {
                    'className': 'clearfix'
                }
            }, {
                tag: 'div',
                id: 'keySignatures',
                attr: {
                    'className': 'clearfix'
                }
            }],
            parent: document.body
        });

        for (i = 0, len = notes.length; i < len; i++) {
            Pete.Element.create({tag: 'a',
                attr: {
                    href: '#'
                },
                items: [{
                    tag: 'span',
                    attr: {
                        innerHTML: notes[i],
                        // Bind an expando property for when comparing values in the event handler.
                        note: notes[i]
                    }
                }],
                parent: Pete.getDom('keySignatures')
            });
        }

        // Note we're only binding one event listener for the entire page (because of this make sure each
        // <span> entirely covers each <a>).
        Pete.Element.fly('keySignatures').on('click', function (e) {
            var oTarget = e.target,
                sNote;

            if (oTarget.nodeName === 'SPAN') {
                sNote = oTarget.note;

                if (notesObj[sNote] === Pete.getDom('currentKeySignature').currentKeySignature) {
                    alert('Correct');
                    getChord();
                } else {
                    alert('Incorrect');
                }
            }

            e.preventDefault();
        });

        // Initialize.
        getChord();
    });
}());

