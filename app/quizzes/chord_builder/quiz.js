(function () {
    // NOTES:
    // The types of chords that display (i.e., "Major7", "HalfDiminished7") depend on the properties of the deepCopy object.
    var init = function (level) {
        // Init the drag-n-drop stuff.
        // 'Global' values for all object zones should be defined in the config.
        var dd = Pete.compose(Pete.DD, {
            dragCls: 'notes'
        });

        dd.initDD(Pete.get('notes'), {
            sort: true
        });

        dd.initDD(Pete.gets('.dropZone'), {
            //dropProxy: false,
            subscribe: {
                beforenodedrop: function (e) {
                    // Only drop if there isn't another child element in the target drop zone.
                    if (Pete.gets('.' + e.dragCls, this.dom).length) {
                        return false;
                    }
                },
                afternodedrop: function (e) {
                    var dragged = Pete.gets('#dropZoneContainer .' + e.dragCls, true),
                        arr = [],
                        i, len;

                    if (dragged.length === 4) {
                        for (i = 0, len = dragged.length; i < len; i++) {
                            arr.push(dragged[i].childNodes[0].note);
                        }

                        if (Pete.getDom('currentChord').currentChord === arr.join('')) {
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

        // Reset the counter.
        n = 0;

        // First lookup the skill level to see if the object needs to be created.
        if (!cache.advanced) {
            getArrays();
        }

        setQuiz();

        // Get first chord permutation.
        getChord();
    },

    skipChord = function () {
        reset();
        getChord();
    },

    chordBuilder = [],

    cache = {
        chordBuilder: null
    },

    // Gather the note names that will be used to build the dom elements.
    notes = [],
    // Holds the deep copy of either the notesObj object or both the notesObj and notesObjAdvanced objects.
    deepCopy = {},
    permutations = [],
    notesObj,
    notesObjAdvanced,

    random = function () {
        return (Math.round(Math.random()) - 0.5);
    },

    // Collect all of the arrays from within the deepCopy object.
    getArrays = function () {
        var arr = [],
            // Gather the chord names that will be used to build the dom elements.
            chords = [],
            gotChords = false,
            note, tone, chord;

        // A deep copy must be made every time in case the user selects a different skill level
        // (since expand properties are bound to the object depending which level is selected).
        // Only mixin the advanced types ('augmented', 'diminished', etc.) for the advanced level.
        deepCopy = (function () {
            var o = Pete.deepCopy(notesObj),
                p;

            for (p in notesObj) {
                 o[p] = Pete.mixin(o[p], notesObjAdvanced[p]);
            }

            return o;
        }());

        // Reset the chords and permutations array.
        chords.length = permutations.length = 0;

        // Get the permutations for the chordBuilder view.
        // Since the default selection is advanced, deepCopy will contain all the possible chords on page load.
        // Use it to create a hash of chord: notes.
        if (!cache.chordBuilder) {
            for (note in deepCopy) {
                if (deepCopy.hasOwnProperty(note)) {
                    for (var s in deepCopy[note]) {
                        chordBuilder.push({chord: note + ' ' + s, notes: deepCopy[note][s].join('')});
                    }
                }

                // Randomize after every iteration for the best results.
                chordBuilder.sort(random);
            }

            cache.chordBuilder = chordBuilder;
        }

        for (note in deepCopy) {
            if (deepCopy.hasOwnProperty(note)) {
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
                }

                gotChords = true;

                // Sorting them frequently does a better job at randomizing them.
                permutations.sort(random);
            }
        }

        // Change value or else we'll collect the notes over and over again C
        getArrays.gotNotes = true;
        gotChords = false;
    },

    n = 0,

    // Get the current chord to display to the user.
    getChord = function () {
        var permutations = cache.chordBuilder;

        if (n === permutations.length) {
            n = 0;
        }

        Pete.getDom('currentChord').innerHTML = '<span>' + permutations[n].chord + '</span>';

        // We need to attach the array to an expando property since we need another way of comparing than
        // the value of the currentChord dom element (since the browser converts the entity when displaying
        // it and it no longer matches the entity when comparing the values in the event handler).
        Pete.getDom('currentChord').currentChord = permutations[n].notes;

        n++;
    },

    setQuiz = function () {
        var i, len;

        for (i = 0, len = notes.length; i < len; i++) {
            Pete.create({
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
                parent: Pete.getDom('notes')
            });
        }
    },

    reset = function () {
        // Get all child nodes within the drop zone that have a 'sortOrder' property.
        var arr = Pete.makeArray(Pete.getDom('notes').childNodes).concat(Pete.makeArray(Pete.gets('#dropZoneContainer .notes', true))).filter(function (v) {
            // Should there be a better check?
            return (typeof v.sortOrder === 'number');
        }),
        frag = document.createDocumentFragment(),
        dropZone = Pete.get('notes');

        // Sort all nodes in this drop zone by their sort order property.
        arr.sort(function (a, b) {
            return a.sortOrder - b.sortOrder;
        });

        // Remove all the nodes...
        dropZone.remove(true);

        // ...and readd them to the document fragment.
        arr.forEach(function (v) {
            // Null out the inline styles that were bound to the element when it was dragged to the drop zone
            // (b/c of specificity the the rules set in the class won't 'shine' through).
            //v.style.border = v.style.margin = null;
            delete v.style.border;
            delete v.style.margin;

            frag.appendChild(v);
        });

        dropZone.append(frag);
    };

    Pete.defer.autoWrap = false;

    // Execute this callback after all requests have returned.
    Pete.defer.wrap(function () {
        init();
    });

    Pete.defer.load({
        url: 'app/chords/sevenths/basic.json',
        data: 'json',
        type: 'POST',
        success: function (data, resp) {
            notesObj = resp;
        }
    });

    Pete.defer.load({
        url: 'app/chords/sevenths/advanced.json',
        data: 'json',
        type: 'POST',
        success: function (data, resp) {
            notesObjAdvanced = resp;
        }
    });

    Pete.ready(function () {
        var notes;

        Pete.create({
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

        Pete.get('.skipChord').on('click', skipChord);

        // If user agent is an iphone tweak the styles so everything fits in the screen.
        if (navigator.userAgent.indexOf('iPhone') !== -1 || navigator.userAgent.indexOf('Android') !== -1) {
            Pete.getDom('chords').style.width = '450px';
        }
    });
}());

