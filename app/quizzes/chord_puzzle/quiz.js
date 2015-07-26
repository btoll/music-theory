(function () {
    // NOTES:
    // The types of chords that display (i.e., 'Major7', 'HalfDiminished7') depend on the properties of the deepCopy object.
    var init = function (level) {
        skillLevel = level || 'advanced';
        // Reset the counter.
        n = 0;

        // First lookup the skill level to see if the object needs to be created.
        if (!cache[skillLevel]) {
            getArrays();
        }

        setQuiz();

        Pete.getDom('inversions').style.visibility = (skillLevel !== 'beginner') ? 'visible' : 'hidden';

        // Get first chord permutation.
        getChord();
    },

    skip = function () {
        //reset();
        getChord();
    },

    cache = {
        beginner: null,
        intermediate: null,
        advanced: null
    },

    // Gather the note names that will be used to build the dom elements.
    notes = [],
    inversions = ['RootPosition', 'FirstInversion', 'SecondInversion', 'ThirdInversion'],
    // Holds the deep copy of either the notesObj object or both the notesObj and notesObjAdvanced objects.
    deepCopy = {},
    permutations = [],
    skillLevel,
    notesObj,
    notesObjAdvanced,

    // TODO: Move into core library.
    random = function () {
        return (Math.round(Math.random()) - 0.5);
    },

    // Instead of hardcoding the inversions, make them on the fly and bind them to the deepCopy object.
    makeInversions = function (obj) {
        var clone = obj.arr.concat(),
            clone2 = obj.arr.concat(),
            clone3 = obj.arr.concat(),
            temp = clone.shift(),
            tempArr = clone2.splice(0, 2),
            temp3 = clone3.pop();

        clone.push(temp);
        clone3.unshift(temp3);
        permutations.push(deepCopy[obj.note][obj.chord + 'FirstInversion'] = clone);
        permutations.push(deepCopy[obj.note][obj.chord + 'SecondInversion'] = clone2.concat(tempArr));
        permutations.push(deepCopy[obj.note][obj.chord + 'ThirdInversion'] = clone3);
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
        deepCopy = skillLevel !== 'advanced' ?
            Pete.deepCopy(notesObj) :
                (function () {
                    var o = Pete.deepCopy(notesObj),
                        p;

                    for (p in notesObj) {
                         o[p] = Pete.mixin(o[p], notesObjAdvanced[p]);
                    }

                    return o;
                }());

        // Reset the chords and permutations array.
        chords.length = permutations.length = 0;

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
        //cache[skillLevel] = deepCopy;
    },

    n = 0,

    // Get the current chord to display to the user.
    getChord = function () {
        var permutations;

        Pete.Element.gets('span').removeClass('selected');
        permutations = cache[skillLevel].permutations;

        if (n === permutations.length) {
            n = 0;
        }

        Pete.getDom('currentChord').innerHTML = '<span>' + permutations[n].join('</span><span>');

        // We need to attach the array to an expando property since we need another way of comparing than
        // the value of the currentChord dom element (since the browser converts the entity when displaying
        // it and it no longer matches the entity when comparing the values in the event handler).
        Pete.getDom('currentChord').currentChord = permutations[n];

        n++;
    },

    setQuiz = function () {
        var setElements = function (a, name) {
            // First remove everything but the title in the <p>, i.e., 'Type' and 'Inversion'.
            Pete.Element.gets('#' + name + ' a').remove();

            for (i = 0, len = a.length; i < len; i++) {
                Pete.Element.create({tag: 'a',
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
                    parent: Pete.getDom(name)
                });
            }
        },
        i, len;

        if (!setQuiz.initiated) {
            for (i = 0, len = notes.length; i < len; i++) {
                Pete.Element.create({
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

            setElements(inversions, 'inversions');
        }

        // The chords change depending upon the skill level but the notes and inversions never do.
        // Set an expando so this is only done once.
        setQuiz.initiated = true;
        setElements(cache[skillLevel].chords, 'chords');
    },

    reset = function () {
        // Get all child nodes within the drop zone that have a 'sortOrder' property.
        var arr = Pete.makeArray(Pete.getDom('notes').childNodes).concat(Pete.makeArray(Pete.Element.gets('#dropZoneContainer .Pete_draggable', true))).filter(function (v) {
            // Should there be a better check?
            return (typeof v.sortOrder === 'number');
        }),
        frag = document.createDocumentFragment(),
        dropZone = Pete.Element.get('notes');

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
        Pete.Element.create({
            tag: 'div',
            id: 'chordPuzzle',
            items: [{
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
                tag: 'h3',
                text: 'Guess the chord below by selecting a Chord, Type and an Inversion'
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
            }, {
                tag: 'p',
                text: 'Chord'
            }, {
                tag: 'div',
                id: 'notes',
                attr: {
                    className: 'clearfix'
                }
            }, {
                tag: 'p',
                text: 'Type'
            }, {
                tag: 'div',
                id: 'chords',
                attr: {
                    className: 'clearfix'
                }
            }, {
                tag: 'p',
                text: 'Inversion'
            }, {
                tag: 'div',
                id: 'inversions',
                attr: {
                    className: 'clearfix'
                }
            }],
            parent: document.body
        });

        // Init the drag-n-drop stuff.
        Pete.ux.DropZoneManager.add(Pete.Element.gets('#notes'), {
            sort: true
        });

        Pete.ux.DropZoneManager.add(Pete.Element.gets('.dropZone'), {
            snapToZone: true,
            subscribe: {
                beforenodedrop: function (e) {
                    // Only drop if there isn't another child element in the target drop zone.
                    if (Pete.Element.gets('.Pete_draggable', this.dom).length) {
                        return false;
                    }
                },
                afternodedrop: function (e) {
                    var dragged = Pete.Element.gets('#dropZoneContainer .Pete_draggable', true),
                        arr = [],
                        i, len;

                    if (dragged.length === 4) {
                        for (i = 0, len = dragged.length; i < len; i++) {
                            arr.push(dragged[i].childNodes[0].note);
                        }

                        if (Pete.getDom('currentChord').currentChord === arr.join('')) {
                            alert('Correct!');

                            // Re-apply the original styles or else it looks like ass.
                            dragged.forEach(function (v) {
                                Pete.Element.fly(v).setStyle(v.originalStyles);

                                // Also, make sure to reset the snapped property!
                                v.snapped = false;
                            });

                            reset();
                            getChord();
                        } else {
                            alert('Incorrect!');
                        }
                    }
                }
            }
        });

        // Note we're only binding one event listener for the entire page (because of this make sure each
        // <span> entirely covers each <a>).
        Pete.Element.fly('chordPuzzle').on('click', function (e) {
            var target = e.target,
                note, chord, inversion;

            if (target.nodeName === 'SPAN' && target.className !== 'blank') {
                // The classname needs to be trimmed b/c if it removeClass() was previously called on this then
                // there will be an extra space in the classname, i.e., 'notes ' (is this a bug?).
                Pete.Element.gets('span', Pete.getDom(Pete.trim(target.className))).removeClass('selected');
                Pete.Element.fly(target).addClass('selected');

                // User selected one of each so see if they selected correctly.
                if (Pete.Element.gets('#chordPuzzle span.selected').length === 3) {
                    note = Pete.Element.get('#notes .selected').dom.note;
                    chord = Pete.Element.get('#chords .selected').value();

                    // Remove the space that was put in when the dom element was created, i.e., 'Second Inversion'.
                    inversion = Pete.Element.get('#inversions .selected').value().replace(/\s/, '');

                    // Remember root position is the only inversion that doesn't have its inversion as part of its name in deepCopy.
                    if (deepCopy[note][chord + (inversion === 'RootPosition' ? '' : inversion)] === Pete.getDom('currentChord').currentChord) {
                        alert('Correct!');
                        getChord();
                    } else {
                        alert('Incorrect!');
                    }

                    Pete.Element.gets('span').removeClass('selected');

                    // If beginner skill level is selected, make sure the 'Root Position' element is given the selected
                    // class (to understand why see the logic w/in the handler bound to the 'chordPuzzle' element).
                    if (Pete.getDom('beginner').checked) {
                        Pete.Element.get('#inversions span').addClass('selected');
                    }
                }

                e.preventDefault();
            }
        });

        Pete.Element.get('.skipChord').on('click', skip);

        Pete.Element.gets('input[type=radio]').on('click', function (e) {
            var form = e.target.form,
                value = e.target.value;

            Pete.Element.get('#inversions span').removeClass('selected');

            // If beginner skill level is selected, make sure the 'Root Position' element is given the selected
            // class (to understand why see the logic w/in the handler bound to the 'chordPuzzle' element).
            if (value === 'beginner') {
                Pete.Element.get('#inversions span').addClass('selected');
            }

            init(value);
        });

        // If user agent is an iphone tweak the styles so everything fits in the screen.
        if (navigator.userAgent.indexOf('iPhone') !== -1 || navigator.userAgent.indexOf('Android') !== -1) {
            Pete.getDom('chords').style.width = '450px';
            Pete.getDom('inversions').style.width = '330px';
        }
    });
}());

