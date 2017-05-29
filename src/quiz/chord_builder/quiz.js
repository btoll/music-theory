import { core } from 'pete-core';
import dd from 'pete-dd';
import { ajax, element, dom } from 'pete-dom';

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

// The types of chords that display (i.e., "Major7", "HalfDiminished7") depend on the properties of the deepCopy object.
const init = () => {
    // Init the drag-n-drop stuff.
    // 'Global' values for all object zones should be defined in the config.
    const dragdrop = core.create(dd, {
        dragCls: 'notes'
    });

    dragdrop.initDD(element.get('notes'), {
        sort: true
    });

    dragdrop.initDD(element.gets('.dropZone'), {
        // dropProxy: false,
        subscribe: {
            beforenodedrop: function (e, context) {
                // Only drop if there isn't another child element in the target drop zone.
                if (element.gets(`.${context.dragCls}`, e.target).getCount()) {
                    return false;
                }
            },

            afternodedrop: (e, context) => {
                const dragged = element.gets(`#dropZoneContainer .${context.dragCls}`, true);
                const arr = [];
                let draggedLen;

                if ((draggedLen = dragged.length) === 4) {
                    for (let i = 0; i < draggedLen; i++) {
                        arr.push(dragged[i].childNodes[0].note);
                    }

                    if (dom.getDom('currentChord').currentChord === arr.join('')) {
                        alert('Correct!');

                        reset();
                        getChord();
                    } else {
                        alert('Incorrect!');
                    }
                }
            }
        }
    });

    // First lookup the skill level to see if the object needs to be created.
    if (!cache.advanced) {
        getArrays();
    }

    setQuiz();

    // Get first chord permutation.
    getChord();
};

const skipChord = () => {
    reset();
    getChord();
};

const chordBuilder = [];

const cache = {
    chordBuilder: null
};

    // Gather the note names that will be used to build the dom elements.
const notes = [];
// Holds the deep copy of either the notesObj object or both the notesObj and notesObjAdvanced objects.
const deepCopy = {};
const permutations = [];
let notesObj, notesObjAdvanced;

const random = () => (Math.round(Math.random()) - 0.5);

// Collect all of the arrays from within the deepCopy object.
const getArrays = () => {
    // Gather the chord names that will be used to build the dom elements.
    const chords = [];
    let gotChords = false, tone;

    // A deep copy must be made every time in case the user selects a different skill level
    // (since expand properties are bound to the object depending which level is selected).
    // Only mixin the advanced types ('augmented', 'diminished', etc.) for the advanced level.
    const deepCopy = (() => {
        const o = makeDeepCopy(notesObj);

        for (let p in notesObj) {
            o[p] = core.mixin(o[p], notesObjAdvanced[p]);
        }

        return o;
    })();

    // Reset the chords and permutations array.
    chords.length = permutations.length = 0;

    // Get the permutations for the chordBuilder view.
    // Since the default selection is advanced, deepCopy will contain all the possible chords on page load.
    // Use it to create a hash of chord: notes.
    if (!cache.chordBuilder) {
        for (let note of Object.keys(deepCopy)) {
            for (let s in deepCopy[note]) {
                chordBuilder.push({chord: note + ' ' + s, notes: deepCopy[note][s].join('')});
            }

            // Randomize after every iteration for the best results.
            chordBuilder.sort(random);
        }

        cache.chordBuilder = chordBuilder;
    }

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

        for (let chord in tone) {
            if (!gotChords) {
                chords.push(chord);
            }
        }

        gotChords = true;

        // Sorting them frequently does a better job at randomizing them.
        permutations.sort(random);
    }

    // Change value or else we'll collect the notes over and over again C
    getArrays.gotNotes = true;
    gotChords = false;
};

let n = 0;

// Get the current chord to display to the user.
const getChord = function () {
    const permutations = cache.chordBuilder;

    if (n === permutations.length) {
        n = 0;
    }

    dom.getDom('currentChord').innerHTML = '<span>' + permutations[n].chord + '</span>';

    // We need to attach the array to an expando property since we need another way of comparing than
    // the value of the currentChord dom element (since the browser converts the entity when displaying
    // it and it no longer matches the entity when comparing the values in the event handler).
    dom.getDom('currentChord').currentChord = permutations[n].notes;

    n++;
};

const setQuiz = () => {
    for (let i = 0, len = notes.length; i < len; i++) {
        dom.create({
            tag: 'a',
            attr: {
                className: 'notes',
                href: '#',
                sortOrder: i
            },
            items: [{
                tag: 'span',
                attr: {
                    innerHTML: notes[i],

                    // Bind an expando property for when comparing values in the event handler.
                    note: notes[i]
                }
            }],
            parent: dom.getDom('notes')
        });
    }
};

const reset = function () {
    // Get all child nodes within the drop zone that have a 'sortOrder' property.
    const arr = Array.from(dom.getDom('notes').childNodes).concat(Array.from(element.gets('#dropZoneContainer .notes', true))).filter(v =>
        // Should there be a better check?
        (typeof v.sortOrder === 'number')
    );

    const frag = document.createDocumentFragment();
    const dropZone = element.get('notes');

    // Sort all nodes in this drop zone by their sort order property.
    arr.sort((a, b) => a.sortOrder - b.sortOrder);

    // Remove all the nodes...
    dropZone.remove(true);

    // ...and read them to the document fragment.
    arr.forEach(v => {
        // Null out the inline styles that were bound to the element when it was dragged to the drop zone
        // (b/c of specificity the the rules set in the class won't 'shine' through).
        // v.style.border = v.style.margin = null;
        delete v.style.border;
        delete v.style.margin;

        frag.appendChild(v);
    });

    dropZone.append(frag);
};

Promise.all([
    new Promise((resolve, reject) =>
        ajax.load({
            url: 'build/chords/sevenths/basic.json',
            data: 'json',
            success: data => (
                notesObj = data,
                resolve()
            )
        })
    ),

    new Promise((resolve, reject) =>
        ajax.load({
            url: 'build/chords/sevenths/advanced.json',
            data: 'json',
            success: data => (
                notesObjAdvanced = data,
                resolve()
            )
        })
    )
]).then(() => init());

dom.ready(function () {
    dom.create({
        tag: 'div',
        id: 'chordBuilder',
        items: [{
            tag: 'div',
            items: [{
                tag: 'h3',
                text: 'Build the chord below by selecting the Notes that make it up'
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
            items: [{
                tag: 'p',
                text: 'Drag a note into each box'
            }, {
                tag: 'div',
                id: 'dropZoneContainer',
                attr: {
                    className: 'clearfix'
                },
                items: [{
                    tag: 'div',
                    attr: {
                        className: 'dropZone'
                    }
                }, {
                    tag: 'div',
                    attr: {
                        className: 'dropZone'
                    }
                }, {
                    tag: 'div',
                    attr: {
                        className: 'dropZone'
                    }
                }, {
                    tag: 'div',
                    attr: {
                        className: 'dropZone'
                    }
                }]
            }, {
                tag: 'p',
                text: 'Chord'
            }, {
                tag: 'div',
                id: 'notes',
                attr: {
                    className: 'clearfix'
                }
            }]
        }],
        parent: document.body
    });

    element.get('.skipChord').on('click', skipChord);

    // If user agent is an iphone tweak the styles so everything fits in the screen.
    if (navigator.userAgent.indexOf('iPhone') !== -1 || navigator.userAgent.indexOf('Android') !== -1) {
        dom.getDom('chords').style.width = '450px';
    }
});

