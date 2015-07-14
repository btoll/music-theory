(function () {
    // NOTES:
    // - chordQuiz and chordBuilder use the same div but just turn on/off different elements depending on what radio button was selected
    // - the types of chords that display (i.e., "Major7", "HalfDiminished7") depend on the properties of the deepCopy object
    var init = function (level) {
        skillLevel = level || 'advanced';
        // Reset the counter.
        n = 0;

        // First lookup the skill level to see if the object needs to be created.
        if (!cache[skillLevel]) {
            getArrays();
        }

        setQuiz();

        $('inversions').style.visibility = (skillLevel !== 'beginner') ? 'visible' : 'hidden';

        // Get first chord permutation.
        getChord();
    },

    skip = function () {
        getChord();
    },

    chordBuilder = [],

    cache = {
        beginner: null,
        intermediate: null,
        advanced: null,
        chordBuilder: null
    },

    // Gather the note names that will be used to build the dom elements.
    notes = [],
    inversions = ['RootPosition', 'FirstInversion', 'SecondInversion', 'ThirdInversion'],
    // Holds the deep copy of either the notesObj object or both the notesObj and notesObjAdvanced objects.
    deepCopy = {},
    permutations = [],
    skillLevel,

    notesObj = {
        'A': {
            Major7: ['A', 'C&#9839;', 'E', 'G&#9839;'],
            Minor7: ['A', 'C', 'E', 'G']
        },
        'B': {
            Major7: ['B', 'D&#9839;', 'F&#9839;', 'A&#9839;'],
            Minor7: ['B', 'D', 'F&#9839;', 'A']
        },
        'C': {
            Major7: ['C', 'E', 'G', 'B'],
            Minor7: ['C', 'E&#9837;', 'G', 'B&#9837;']
        },
        'D': {
            Major7: ['D', 'F&#9839;', 'A', 'C&#9839;'],
            Minor7: ['D', 'F', 'A', 'C']
        },
        'E': {
            Major7: ['E', 'G&#9839;', 'B', 'D&#9839;'],
            Minor7: ['E', 'G', 'B', 'D']
        },
        'F': {
            Major7: ['F', 'A', 'C', 'E'],
            Minor7: ['F', 'A&#9837;', 'C', 'E&#9837;']
        },
        'G': {
            Major7: ['G', 'B', 'D', 'F&#9839;'],
            Minor7: ['G', 'B&#9837;', 'D', 'F']
        },
        'A&#9837;': {
            Major7: ['A&#9837;', 'C', 'E&#9837;', 'G'],
            Minor7: ['A&#9837;', 'C&#9837;', 'E&#9837;', 'G&#9837;']
        },
        'B&#9837;': {
            Major7: ['B&#9837;', 'D', 'F', 'A'],
            Minor7: ['B&#9837;', 'D&#9837;', 'F', 'A&#9837;']
        },
        'C&#9837;': false,
        'D&#9837;': {
            Major7: ['D&#9837;', 'F', 'A&#9837;', 'C'],
            Minor7: ['D&#9837;', 'F&#9837;', 'A&#9837;', 'C&#9837;']
        },
        'E&#9837;': {
            Major7: ['E&#9837;', 'G', 'B&#9837;', 'D'],
            Minor7: ['E&#9837;', 'G&#9837;', 'B&#9837;', 'D&#9837;']
        },
        'F&#9837;': false,
        'G&#9837;': {
            Major7: ['G&#9837;', 'B&#9837;', 'D&#9837;', 'F'],
            Minor7: ['G&#9837;', 'B&#9837;&#9837;', 'D&#9837;', 'F&#9837;']
        },
        'A&#9839;': {
            Major7: ['A&#9839;', 'C&#9839;&#9839;', 'E&#9839;', 'G&#9839;&#9839;'],
            Minor7: ['A&#9839;', 'C&#9839;', 'E&#9839;', 'G&#9839;']
        },
        'B&#9839;': false,
        'C&#9839;': {
            Major7: ['C&#9839;', 'E&#9839;', 'G&#9839;', 'B&#9839;'],
            Minor7: ['C&#9839;', 'E', 'G&#9839;', 'B']
        },
        'D&#9839;': {
            Major7: ['D&#9839;', 'F&#9839;&#9839;', 'A&#9839;', 'C&#9839;&#9839;'],
            Minor7: ['D&#9839;', 'F&#9839;', 'A&#9839;', 'C&#9839;']
        },
        'E&#9839;': false,
        'F&#9839;': {
            Major7: ['F&#9839;', 'A&#9839;', 'C&#9839;', 'E&#9839;'],
            Minor7: ['F&#9839;', 'A', 'C&#9839;', 'E']
        },
        'G&#9839;': {
            Major7: ['G&#9839;', 'B&#9839;', 'D&#9839;', 'F&#9839;&#9839;'],
            Minor7: ['G&#9839;', 'B', 'D&#9839;', 'F&#9839;']
        }
    },

    notesObjAdvanced = {
        'A': {
            Dominant7: ['A', 'C&#9839;', 'E', 'G'],
            Augmented7: ['A', 'C&#9839;', 'E&#9839;', 'G'],
            HalfDiminished7: ['A', 'C', 'E&#9837;', 'G'],
            MinorMajor7: ['A', 'C', 'E', 'G&#9839;']
        },
        'B': {
            Dominant7: ['B', 'D&#9839;', 'F&#9839;', 'A'],
            Augmented7: ['B', 'D&#9839;', 'F&#9839;&#9839;', 'A'],
            HalfDiminished7: ['B', 'D', 'F', 'A'],
            MinorMajor7: ['B', 'D', 'F&#9839;', 'A&#9839;']
        },
        'C': {
            Dominant7: ['C', 'E', 'G', 'B&#9837;'],
            Augmented7: ['C', 'E', 'G&#9839;', 'B&#9837;'],
            HalfDiminished7: ['C', 'E&#9837;', 'G&#9837;', 'B&#9837;'],
            MinorMajor7: ['C', 'E&#9837;', 'G', 'B']
        },
        'D': {
            Dominant7: ['D', 'F&#9839;', 'A', 'C'],
            Augmented7: ['D', 'F&#9839;', 'A&#9839;', 'C'],
            HalfDiminished7: ['D', 'F', 'A&#9837;', 'C'],
            MinorMajor7: ['D', 'F', 'A', 'C&#9839;']
        },
        'E': {
            Dominant7: ['E', 'G&#9839;', 'B', 'D'],
            Augmented7: ['E', 'G&#9839;', 'B&#9839;', 'D'],
            HalfDiminished7: ['E', 'G', 'B&#9837;', 'D'],
            MinorMajor7: ['E', 'G', 'B', 'D&#9839;']
        },
        'F': {
            Dominant7: ['F', 'A', 'C', 'E&#9837;'],
            Augmented7: ['F', 'A', 'C&#9839;', 'E&#9837;'],
            HalfDiminished7: ['F', 'A&#9837;', 'C&#9837;', 'E&#9837;'],
            MinorMajor7: ['F', 'A&#9837;', 'C', 'E']
        },
        'G': {
            Dominant7: ['G', 'B', 'D', 'F'],
            Augmented7: ['G', 'B', 'D&#9839;', 'F'],
            HalfDiminished7: ["G", "B&#9837;", "D&#9837;", "F"],
            MinorMajor7: ["G", "B&#9837;", "D", "F&#9839;"]
        },
        'A&#9837;': {
            Dominant7: ['A&#9837;', 'C', 'E&#9837;', 'G&#9837;'],
            Augmented7: ['A&#9837;', 'C', 'E', 'G&#9837;'],
            HalfDiminished7: ['A&#9837;', 'C&#9837;', 'E', 'G&#9837;'],
            MinorMajor7: ['A&#9837;', 'C&#9837;', 'E&#9837;', 'G']
        },
        'B&#9837;': {
            Dominant7: ['B&#9837;', 'D', 'F', 'A&#9837;'],
            Augmented7: ['B&#9837;', 'D', 'F&#9839;', 'A&#9837;'],
            HalfDiminished7: ['B&#9837;', 'D&#9837;', 'F&#9837;', 'A&#9837;'],
            MinorMajor7: ['B&#9837;', 'D&#9837;', 'F', 'A']
        },
        'C&#9837;': false,
        'D&#9837;': {
            Dominant7: ['D&#9837;', 'F', 'A&#9837;', 'C&#9837;'],
            Augmented7: ['D&#9837;', 'F', 'A', 'C&#9837;'],
            HalfDiminished7: ['D&#9837;', 'F&#9837;', 'A&#9837;&#9837;', 'C&#9837;'],
            MinorMajor7: ['D&#9837;', 'F&#9837;', 'A&#9837;', 'C']
        },
        'E&#9837;': {
            Dominant7: ['E&#9837;', 'G', 'B&#9837;', 'D&#9837;'],
            Augmented7: ['E&#9837;', 'G', 'B', 'D&#9837;'],
            HalfDiminished7: ['E&#9837;', 'G&#9837;', 'B&#9837;&#9837;', 'D&#9837;'],
            MinorMajor7: ['E&#9837;', 'G&#9837;', 'B&#9837;', 'D']
        },
        'F&#9837;': false,
        'G&#9837;': {
            Dominant7: ['G&#9837;', 'B&#9837;', 'D&#9837;', 'F&#9837;'],
            Augmented7: ['G&#9837;', 'B&#9837;', 'D', 'F&#9837;'],
            HalfDiminished7: ['G&#9837;', 'B&#9837;&#9837;', 'D&#9837;&#9837;', 'F&#9837;'],
            MinorMajor7: ['G&#9837;', 'B&#9837;&#9837;', 'D&#9837;', 'F']
        },
        'A&#9839;': {
            Dominant7: ['A&#9839;', 'C&#9839;&#9839;', 'E&#9839;', 'G&#9839;'],
            Augmented7: ['A&#9839;', 'C&#9839;&#9839;', 'E&#9839;&#9839;', 'G&#9839;'],
            HalfDiminished7: ['A&#9839;', 'C&#9839;', 'E', 'G&#9839;'],
            MinorMajor7: ['A&#9839;', 'C&#9839;', 'E&#9839;', 'G&#9839;&#9839;']
        },
        'B&#9839;': false,
        'C&#9839;': {
            Dominant7: ['C&#9839;', 'E&#9839;', 'G&#9839;', 'B'],
            Augmented7: ['C&#9839;', 'E&#9839;', 'G&#9839;&#9839;', 'B'],
            HalfDiminished7: ['C&#9839;', 'E', 'G', 'B'],
            MinorMajor7: ['C&#9839;', 'E', 'G&#9839;', 'B&#9839;']
        },
        'D&#9839;': {
            Dominant7: ['D&#9839;', 'F&#9839;&#9839;', 'A&#9839;', 'C&#9839;'],
            Augmented7: ['D&#9839;', 'F&#9839;&#9839;', 'A&#9839;&#9839;', 'C&#9839;'],
            HalfDiminished7: ['D&#9839;', 'F&#9839;', 'A', 'C&#9839;'],
            MinorMajor7: ['D&#9839;', 'F&#9839;', 'A&#9839;', 'C&#9839;&#9839;']
        },
        'E&#9839;': false,
        'F&#9839;': {
            Dominant7: ['F&#9839;', 'A&#9839;', 'C&#9839;', 'E'],
            Augmented7: ['F&#9839;', 'A&#9839;', 'C&#9839;&#9839;', 'E'],
            HalfDiminished7: ['F&#9839;', 'A', 'C', 'E'],
            MinorMajor7: ['F&#9839;', 'A', 'C&#9839;', 'E&#9839;']
        },
        'G&#9839;': {
            HalfDiminished7: ['G&#9839;', 'B', 'D', 'F&#9839;'],
            Augmented7: ['G&#9839;', 'B', 'D&#9839;', 'F&#9839;'],
            Dominant7: ['G&#9839;', 'B&#9839;', 'D&#9839;', 'F&#9839;'],
            MinorMajor7: ['G&#9839;', 'B', 'D&#9839;', 'F&#9839;&#9839;']
        }
    },

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
                    var o = Pete.deepCopy(notesObj);

                    for (var p in notesObj) {
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

        if (skillLevel !== 'chordBuilder') {
            permutations = cache[skillLevel].permutations;

            if (n === permutations.length) {
                n = 0;
            }

            $('currentChord').innerHTML = '<span>' + permutations[n].join('</span><span>');

            // We need to attach the array to an expando property since we need another way of comparing than
            // the value of the currentChord dom element (since the browser converts the entity when displaying
            // it and it no longer matches the entity when comparing the values in the event handler).
            $('currentChord').currentChord = permutations[n];
        } else {
            permutations = cache.chordBuilder;

            if (n === permutations.length) {
                n = 0;
            }

            $('currentChord').innerHTML = '<span>' + permutations[n].chord + '</span>';

            // We need to attach the array to an expando property since we need another way of comparing than
            // the value of the currentChord dom element (since the browser converts the entity when displaying
            // it and it no longer matches the entity when comparing the values in the event handler).
            $('currentChord').currentChord = permutations[n].notes;
        }

        n++;
    },

    setQuiz = function () {
        if (skillLevel === 'chordBuilder') {
            return;
        }

        var setElements = function (a, name) {
            // First remove everything but the title in the <p>, i.e., 'Type' and 'Inversion'.
            Pete.Element.gets('#' + name + ' a').remove();

            for (i = 0, len = a.length; i < len; i++) {
                Pete.Element.create({tag: 'a',
                    attr: {
                        href: '#'
                    },
                    items: [
                        Pete.Element.create({tag: 'span',
                            attr: {
                                clasname: name,

                                // Add a space, i.e., 'Third Inversion'.
                                innerHTML: name === 'inversions' ? a[i].replace(/(Position|Inversion)/, ' $1') : a[i]
                            }
                        })
                    ],
                    parent: $(name)
                });
            }
        },
        i, len;

        if (!setQuiz.initiated) {
            for (i = 0, len = notes.length; i < len; i++) {
                Pete.Element.create({tag: 'a',
                    attr: {
                        className: 'notes',
                        href: '#',
                        sortOrder: i
                    },
                    items: [
                        Pete.Element.create({tag: 'span',
                            attr: {
                                innerHTML: notes[i],

                                // Bind an expando property for when comparing values in the event handler.
                                note: notes[i]
                            }
                        })
                    ],
                    parent: $('notes')
                });
            }

            setElements(inversions, 'inversions');
        }

        // The chords change depending upon the skill level but the notes and inversions never do.
        // Set an expando so this is only done once.
        setQuiz.initiated = true;
        setElements(cache[skillLevel].chords, 'chords');
    };

    var reset = function () {
        // Get all child nodes within the drop zone that have a 'sortOrder' property.
        var arr = Pete.makeArray($('notes').childNodes).concat(Pete.makeArray(Pete.Element.gets('#dropZoneContainer .Pete_draggable', true))).filter(function (v) {
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

    Pete.ready(function () {
        // Init the drag-n-drop stuff.
        Pete.ux.DropZoneManager.add(Pete.Element.gets('#notes'), {
            sort: true
        });

        Pete.ux.DropZoneManager.add(Pete.Element.gets('.dropZone'), {
            snapToZone: true,
            subscribe: {
                beforenodedrop: function (e) {
                    // Only drop if there isn't another child element in the target drop zone.
                    if (Pete.Element.gets('.Pete_draggable', this).length) {
                        return false;
                    }
                },
                afternodedrop: function (e) {
                    var aDragged = Pete.Element.gets('#dropZoneContainer .Pete_draggable', true),
                        arr = [],
                        i, len;

                    if (aDragged.length === 4) {
                        for (i = 0, len = aDragged.length; i < len; i++) {
                            arr.push(Pete.Element.get('span', aDragged[i], true).note);
                        }

                        if ($('currentChord').currentChord === arr.join('')) {
                            alert('Correct!');

                            // Re-apply the original styles or else it looks like a$$.
                            aDragged.forEach(function (v) {
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

        init();

        // Note we're only binding one event listener for the entire page (because of this make sure each
        // <span> entirely covers each <a>).
        Pete.Element.fly('chordQuiz').on('click', function (e) {
            var oTarget = e.target,
                note, chord, sInversion;

            if (oTarget.nodeName === 'SPAN' && oTarget.className !== 'blank') {
                // The classname needs to be trimmed b/c if it removeClass() was previously called on this then
                // there will be an extra space in the classname, i.e., 'notes ' (is this a bug?).
                Pete.Element.gets('span', $(Pete.trim(oTarget.className))).removeClass('selected');
                Pete.Element.fly(oTarget).addClass('selected');

                // User selected one of each so see if he selected correctly.
                if (Pete.Element.get('#notes span.selected', true) && Pete.Element.get('#chords span.selected', true) && Pete.Element.get('#inversions span.selected', true)) {
                    note = Pete.Element.get('#notes .selected').dom.note;
                    chord = Pete.Element.get('#chords .selected').value();

                    // Remove the space that was put in when the dom element was created, i.e., 'Second Inversion'.
                    sInversion = Pete.Element.get('#inversions .selected').value().replace(/\s/, '');

                    // Remember root position is the only inversion that doesn't have its inversion as part of its name in deepCopy.
                    if (deepCopy[note][chord + (sInversion === 'RootPosition' ? '' : sInversion)] === $('currentChord').currentChord) {
                        alert('Correct!');
                        getChord();
                    } else {
                        alert('Incorrect!');
                    }

                    Pete.Element.gets('span').removeClass('selected');

                    // If beginner skill level is selected, make sure the 'Root Position' element is given the selected
                    // class (to understand why see the logic w/in the handler bound to the 'chordQuiz' element).
                    if ($('beginner').checked) {
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

            if (form.id === 'mainMenu') {
                var chordQuiz = Pete.Element.get('chordQuiz'),
                    keyQuiz = Pete.Element.get('keySignaturesQuiz'),
                    toggleElements = function (sDiv) {
                        // Elements to toggle: the <h3>s, the value of #notes p, rest are self-evident.
                        var a = (sDiv === 'chordQuiz') ?
                            ['none', 'block'] :
                            ['block', 'none'];

                        chordQuiz.show();

                        // No matter which 'view' was selected remove any previously selected notes.
                        Pete.Element.gets('#notes span').removeClass('selected');
                        Pete.Element.get('#chordQuiz h3 + h3', true).style.display = $('dropZoneContainer').style.display = a[0];
                        Pete.Element.get('#chordQuiz h3', true).style.display = $('chordMenu').style.display = $('chords').style.display = $('inversions').style.display = a[1];

                        // Finally, reset the notes div (in case any were dragged in the chord builder).
                        reset();
                    };

                if (value === 'chordQuiz') {
                    toggleElements('chordQuiz');

                    // Hide the first paragraph but show every other paragraph.
                    Pete.Element.get('h3 + div + p').hide();
                    Pete.Element.gets('p + div + p').show();

                    Pete.Element.gets('#notes a.notes').removeClass('Pete_draggable');
                    keyQuiz.hide();
                    init();
                } else if (value === 'chordBuilder') {
                    // Set this so we know which object to look up in the cache;
                    skillLevel = 'chordBuilder';
                    toggleElements('chordBuilder');

                    // Show the first paragraph but hide every other paragraph.
                    Pete.Element.get('h3 + div + p').show();
                    Pete.Element.gets('p + div + p').hide();

                    Pete.Element.gets('#notes a.notes').addClass('Pete_draggable');
                    keyQuiz.hide();
                    init(value);

                } else {
                    chordQuiz.hide();
                    keyQuiz.show();
                }

            } else if (form.id === 'chordMenu') {
                Pete.Element.get('#inversions span').removeClass('selected');

                // If beginner skill level is selected, make sure the 'Root Position' element is given the selected
                // class (to understand why see the logic w/in the handler bound to the 'chordQuiz' element).
                if (value === 'beginner') {
                    Pete.Element.get('#inversions span').addClass('selected');
                }

                init(value);
            }
        });

        // If user agent is an iphone tweak the styles so everything fits in the screen.
        if (navigator.userAgent.indexOf('iPhone') !== -1 || navigator.userAgent.indexOf('Android') !== -1) {
            $('chords').style.width = '450px';
            $('inversions').style.width = '330px';
        }
    });
}());

