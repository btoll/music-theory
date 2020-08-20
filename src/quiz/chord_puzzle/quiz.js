import { core } from 'pete-core';
import { ajax, dom, element } from 'pete-dom';

let n = 0;

/**
 * @function makeDeepCopy
 * @param {orig}
 * @return {Object}
 *
 * Makes a deep copy of the object that's passed as its sole argument and returns the copied object. Every copied object and
 * array property of the original object will be separate and distinct from the original object. In other words, after the
 * deep copy occurs, any new expando property added to either object won't be replicated to the other.
 */
const makeDeepCopy = orig => {
    let o, v;

    // Arrays are handled differently than objects.
    if (orig instanceof Array) {
        o = [];

        for (let i = 0, len = orig.length; i < len; i++) {
            v = orig[i];

            // Could be an array or an object.
            if (v instanceof Object) {
                o.push(makeDeepCopy(v));
            } else {
                o.push(v);
            }
        }
    } else {
        o = {};

        for (let prop of Object.keys(orig)) {
            v = orig[prop];

            // Could be an array or an object.
            if (v instanceof Object) {
                o[prop] = makeDeepCopy(v);
            } else {
                o[prop] = v;
            }
        }
    }

    return o;
};

// Get the current chord to display to the user.
const getChord = () => {
    let permutations;

    element.gets('span').removeClass('selected');
    permutations = cache[skillLevel].permutations;

    if (n === permutations.length) {
        n = 0;
    }

    dom.getDom('currentChord').innerHTML = '<span>' + permutations[n].join('</span><span>');

    // We need to attach the array to an expando property since we need another way of comparing than
    // the value of the currentChord dom element (since the browser converts the entity when displaying
    // it and it no longer matches the entity when comparing the values in the event handler).
    dom.getDom('currentChord').currentChord = permutations[n];

    n++;
};

// The types of chords that display (i.e., 'Major7', 'HalfDiminished7') depend on the properties of the deepCopy object.
const init = level => {
    skillLevel = level || 'advanced';
    // Reset the counter.
    n = 0;

    // First lookup the skill level to see if the object needs to be created.
    if (!cache[skillLevel]) {
        getArrays();
    }

    setQuiz();

    dom.getDom('inversions').style.visibility = (skillLevel !== 'beginner') ? 'visible' : 'hidden';

    // Get first chord permutation.
    getChord();
};

const skip = getChord;

const cache = {
    beginner: null,
    intermediate: null,
    advanced: null
};

    // Gather the note names that will be used to build the dom elements.
const notes = [];
const inversions = ['RootPosition', 'FirstInversion', 'SecondInversion', 'ThirdInversion'];
// Holds the deep copy of either the notesObj object or both the notesObj and notesObjAdvanced objects.
let deepCopy = {};
const permutations = [];
let skillLevel, notesObj, notesObjAdvanced;

const random = () => (Math.round(Math.random()) - 0.5);

    // Instead of hardcoding the inversions, make them on the fly and bind them to the deepCopy object.
const makeInversions = obj => {
    const clone = obj.arr.concat();
    const clone2 = obj.arr.concat();
    const clone3 = obj.arr.concat();
    const temp = clone.shift();
    const tempArr = clone2.splice(0, 2);
    const temp3 = clone3.pop();

    clone.push(temp);
    clone3.unshift(temp3);
    permutations.push(deepCopy[obj.note][obj.chord + 'FirstInversion'] = clone);
    permutations.push(deepCopy[obj.note][obj.chord + 'SecondInversion'] = clone2.concat(tempArr));
    permutations.push(deepCopy[obj.note][obj.chord + 'ThirdInversion'] = clone3);
};

    // Collect all of the arrays from within the deepCopy object.
const getArrays = function () {
    // Gather the chord names that will be used to build the dom elements.
    const  chords = [];
    let gotChords = false, tone, chord;

    // A deep copy must be made every time in case the user selects a different skill level
    // (since expand properties are bound to the object depending which level is selected).
    // Only mixin the advanced types ('augmented', 'diminished', etc.) for the advanced level.
    deepCopy = skillLevel !== 'advanced' ?
        makeDeepCopy(notesObj) :
            (function () {
                const o = makeDeepCopy(notesObj);

                for (let p in notesObj) {
                    o[p] = core.mixin(o[p], notesObjAdvanced[p]);
                }

                return o;
            }());

    // Reset the chords and permutations array.
    chords.length = permutations.length = 0;

    for (let note of Object.keys(deepCopy)) {
        // Only collect the chords names the first time instead of every time (wasteful).
        if (!getArrays.gotNotes) {
            // Get each note to use later when we build the dom elements.
            notes.push(note);
        }

        tone = deepCopy[note];

        // If the tone object is false then skip it, i.e., c-flat and e-sharp.
        if (!tone) {
            continue;
        }

        for (chord in tone) {
            if (!gotChords) {
                chords.push(chord);
            }

            if (tone.hasOwnProperty(chord)) {
                permutations.push(tone[chord]);

                if (skillLevel !== 'beginner') {
                    makeInversions({
                        arr: tone[chord],
                        note: note,
                        chord: chord
                    });
                }
            }
        }

        gotChords = true;

        // Sorting them frequently does a better job at randomizing them.
        permutations.sort(random);
    }

    // Change value or else we'll collect the notes over and over again C
    getArrays.gotNotes = true;
    gotChords = false;

    cache[skillLevel] = {
        // Store the skill level object so it's only created once (since permutations is a global array
        // it must be cloned or all the skill levels will reference the last skill level created.
        permutations: permutations.concat(),
        chords: chords
    };

    // Store the skill level object so it's only created once.
    // cache[skillLevel] = deepCopy;
};

const setQuiz = () => {
    const setElements = (a, name) => {
        // First remove everything but the title in the <p>, i.e., 'Type' and 'Inversion'.
        element.gets('#' + name + ' a').remove();

        for (let i = 0, len = a.length; i < len; i++) {
            dom.create({tag: 'a',
                attr: {
                    href: '#'
                },
                items: [{
                    tag: 'span',
                    attr: {
                        className: name,

                        // Add a space, i.e., 'Third Inversion'.
                        innerHTML: name === 'inversions' ? a[i].replace(/(Position|Inversion)/, ' $1') : a[i]
                    }
                }],
                // TODO: This is gnarly just to get a dom el.
                parent: element.gets('#' + name + ' div').elements[0]
            });
        }
    };

    if (!setQuiz.initiated) {
        for (let i = 0, len = notes.length; i < len; i++) {
            dom.create({
                tag: 'a',
                attr: {
                    href: '#',
                    sortOrder: i
                },
                items: [{
                    tag: 'span',
                    attr: {
                        className: 'notes',
                        innerHTML: notes[i],

                        // Bind an expando property for when comparing values in the event handler.
                        note: notes[i]
                    }
                }],
                // TODO: This is gnarly just to get a dom el.
                parent: element.gets('#notes div').elements[0]
            });
        }

        setElements(inversions, 'inversions');
    }

    // The chords change depending upon the skill level but the notes and inversions never do.
    // Set an expando so this is only done once.
    setQuiz.initiated = true;
    setElements(cache[skillLevel].chords, 'chords');
};

Promise.all([
    new Promise((resolve, reject) =>
        ajax.load({
            url: 'build/chords/sevenths/basic.json',
            data: 'json',
            success: (data, resp) => (
                notesObj = data,
                resolve()
            )
        })
    ),

    new Promise((resolve, reject) =>
        ajax.load({
            url: 'build/chords/sevenths/advanced.json',
            data: 'json',
            success: (data, resp) => (
                notesObjAdvanced = data,
                resolve()
            )
        })
    )
]).then(() => init());

dom.ready(() => {
    dom.create({
        tag: 'div',
        id: 'chordPuzzle',
        items: [{
            tag: 'div',
            items: [{
                tag: 'h3',
                text: 'Guess the chord below by selecting a Chord, Type and an Inversion'
            }, {
                tag: 'form',
                attr: {
                    action: ''
                },
                items: [{
                    tag: 'legend',
                    text: 'Skill Level'
                }, {
                    tag: 'label',
                    text: '<label><input type="radio" id="advanced" name="difficulty" value="advanced" checked="checked" /> Advanced</label>'
                }, {
                    tag: 'label',
                    text: '<label><input type="radio" id="intermediate" name="difficulty" value="intermediate" /> Intermediate</label>'
                }, {
                    tag: 'label',
                    text: '<label><input type="radio" id="beginner" name="difficulty" value="beginner" /> Beginner</label>'
                }]
            }, {
                tag: 'div',
                id: 'currentChordContainer',
                items: [{
                    tag: 'div',
                    id: 'currentChord',
                    attr: {
                        className: 'clearfix'
                    }
                }, {
                    tag: 'button',
                    text: 'Skip Chord',
                    attr: {
                        className: 'skipChord'
                    }
                }]
            }]
        }, {
            tag: 'div',
            id: 'notes',
            items: [{
                tag: 'p',
                text: 'Chord'
            }, {
                tag: 'div',
                attr: {
                    className: 'clearfix'
                }
            }]
        }, {
            tag: 'div',
            id: 'chords',
            items: [{
                tag: 'p',
                text: 'Type'
            }, {
                tag: 'div',
                attr: {
                    className: 'clearfix'
                }
            }]
        }, {
            tag: 'div',
            id: 'inversions',
            items: [{
                tag: 'p',
                text: 'Inversion'
            }, {
                tag: 'div',
                attr: {
                    className: 'clearfix'
                }
            }]
        }],
        parent: document.body
    });

    // Note we're only binding one event listener for the entire page (because of this make sure each
    // <span> entirely covers each <a>).
    element.fly('chordPuzzle').on('click', e => {
        const  target = e.target;
        let note, chord, inversion, numSelected;

        if (target.nodeName === 'SPAN' && target.className !== 'blank') {
            // The classname needs to be trimmed b/c if removeClass() was previously called on this
            // then there will be an extra space in the classname, i.e., 'notes ' (is this a bug?).
            element.gets('span', dom.getDom(target.className.trim())).removeClass('selected');
            element.fly(target).addClass('selected');

            numSelected = element.gets('#chordPuzzle span.selected').getCount();

            // User selected one of each so see if they selected correctly.
            if (numSelected === 3 || (numSelected === 2 && skillLevel === 'beginner')) {
                note = element.get('#notes .selected').dom.note;
                chord = element.get('#chords .selected').value();

                inversion = skillLevel === 'beginner' ?
                    inversion = 'RootPosition' :
                    // Remove the space that was put in when the dom element was created, i.e., 'Second Inversion'.
                    element.get('#inversions .selected').value().replace(/\s/, '');

                // Remember root position is the only inversion that doesn't have its inversion as part of its name in deepCopy.
                if (deepCopy[note][chord + (inversion === 'RootPosition' ? '' : inversion)] === dom.getDom('currentChord').currentChord) {
                    alert('Correct!');
                    getChord();
                } else {
                    alert('Incorrect!');
                }

                element.gets('span').removeClass('selected');

                // If beginner skill level is selected, make sure the 'Root Position' element is given the selected
                // class (to understand why see the logic w/in the handler bound to the 'chordPuzzle' element).
                if (dom.getDom('beginner').checked) {
                    element.get('#inversions span').addClass('selected');
                }
            }

            e.preventDefault();
        }
    });

    element.get('.skipChord').on('click', skip);

    element.gets('input[type=radio]').on('click', e => {
        const value = e.target.value;

        element.get('#inversions span').removeClass('selected');

        // If beginner skill level is selected, make sure the 'Root Position' element is given the selected
        // class (to understand why see the logic w/in the handler bound to the 'chordPuzzle' element).
        if (value === 'beginner') {
            element.get('#inversions span').addClass('selected');
        }

        init(value);
    });

    // If user agent is an iphone tweak the styles so everything fits in the screen.
    if (navigator.userAgent.indexOf('iPhone') !== -1 || navigator.userAgent.indexOf('Android') !== -1) {
        dom.getDom('chords').style.width = '450px';
        dom.getDom('inversions').style.width = '330px';
    }
});

