import { dom, element } from 'pete-dom';

// Gather the note names that will be used to build the dom elements.
const notes = [];

// Holds the permutations.
const quizzes = [];

const notesObj = {
    'Major Triad': ['1', '3', '5'],
    'Minor Triad': ['1', '&#9837;3', '5'],
    'Diminished Triad': ['1', '&#9837;3', '&#9837;5'],
    'Augmented Triad': ['1', '3', '&#9839;5'],
    'Major7': ['1', '3', '5', '7'],
    'Minor7': ['1', '&#9837;3', '5', '&#9837;7'],
    'Dominant7': ['1', '3', '5', '&#9837;7'],
    'HalfDiminished7': ['1', '&#9837;3', '&#9837;5', '&#9837;7'],
    'Diminished7': ['1', '&#9837;3', '&#9837;5', '&#9837;&#9837;7'],
    'Augmented7': ['1', '3', '&#9839;5', '&#9837;7'],
};

const random = () =>
    (Math.round(Math.random()) - 0.5);

// Collect all of the arrays from within the notesObj object.
const getArrays = () => {
    for (let prop of Object.keys(notesObj)) {
        // Get each note to use later when we build the dom elements.
        notes.push(prop);
        quizzes.push(notesObj[prop]);

        quizzes.sort(random);
    }

    // Randomize them.
    // notes.sort(random);
};

let n = 0;

// Get the current chord to display to the user.
const getChord = () => {
    if (n === notes.length) {
        n = 0;
    }

    // Pete.getDom("currentChordInterval").innerHTML = "<span>" + notesObj[notes[n]].join("</span><span>");
    // Pete.getDom("currentChordInterval").currentChordInterval = notesObj[notes[n]]; //we need to attach the array to an expando property since we need another way of comparing than the value of the currentChord dom element (since the browser converts the entity when displaying it and it no longer matches the entity when comparing the values in the event handler);

    dom.getDom('currentChordInterval').innerHTML = '<span>' + quizzes[n].join('</span><span>');

    // We need to attach the array to an expando property since we need another way of comparing than
    // the value of the currentChord dom element (since the browser converts the entity when displaying
    // it and it no longer matches the entity when comparing the values in the event handler).
    dom.getDom('currentChordInterval').currentChordInterval = quizzes[n];

    n++;
};

getArrays();

dom.ready(() => {
    dom.create({
        tag: 'div',
        id: 'chordIntervalsQuiz',
        items: [{
            tag: 'div',
            items: [{
                tag: 'h3',
                attr: {
                    'innerHTML': 'Guess the chord by its intervals'
                }
            }, {
                tag: 'p',
                attr: {
                    'innerHTML': 'Intervals'
                }
            }, {
                tag: 'div',
                id: 'currentChordInterval',
                attr: {
                    'className': 'clearfix'
                }
            }]
        }, {
            tag: 'div',
            items: [{
                tag: 'div',
                id: 'chordIntervals',
                attr: {
                    'className': 'clearfix'
                }
            }]
        }],
        parent: document.body
    });

    for (let i = 0, len = notes.length; i < len; i++) {
        dom.create({tag: 'a',
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
            parent: dom.getDom('chordIntervals')
        });
    }

    // Note we're only binding one event listener for the entire page (because of this make sure each
    // <span> entirely covers each <a>).
    element.fly('chordIntervals').on('click', e => {
        const  target = e.target;
        let note;

        if (target.nodeName === 'SPAN') {
            note = target.note;

            if (notesObj[note] === dom.getDom('currentChordInterval').currentChordInterval) {
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

