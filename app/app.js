Pete.ready(function () {
    var reReplaceHash = /^#/,
        cachedQuizzes = {};

    Pete.Element.create({
        tag: 'header',
        items: [{
            tag: 'nav',
            items: [{
                tag: 'ul',
                items: [{
                    tag: 'li',
                    items: [{
                        tag: 'a',
                        text: 'Chord Quiz',
                        attr: {
                            href: '#chord_quiz',
                            title: 'Chord Quiz'
                        }
                    }]
                }, {
                    tag: 'li',
                    items: [{
                        tag: 'a',
                        text: 'Chord Builder',
                        attr: {
                            href: '#chord_builder',
                            title: 'Chord Builder'
                        }
                    }]
                }, {
                    tag: 'li',
                    items: [{
                        tag: 'a',
                        text: 'Key Signature Quiz',
                        attr: {
                            href: '#key_signature',
                            title: 'Key Signature Quiz'
                        }
                    }]
                }]
            }]
        }],
        parent: document.body
    });

    Pete.Element.gets('nav a').on('click', function (e) {
        var quiz = e.target.hash.replace(reReplaceHash, ''),
            iframeId = 'sandbox-' + quiz,
            dir = 'app/quizzes/' + quiz + '/',
            sandbox;

        e.preventDefault();

        // Return early if already downloaded.
        if (cachedQuizzes[quiz]) {
            return;
        }

        // Cache the quiz.
        cachedQuizzes[quiz] = true;

        sandbox = Pete.Element.create({
            tag: 'iframe',
            id: iframeId,
            style: {
                height: '300px',
                width: '800px'
            },
            parent: document.body
        }),

        Pete.ajax.load({
            url: 'app/template.html',
            success: function (response, request) {
                var doc = Pete.getDom(iframeId).contentDocument;
                    tpl = Pete.compose(Pete.Template, {
                        html: response
                    });

                doc.open();

                doc.write(tpl.apply({
                    quiz_css: dir + 'quiz.css',
                    quiz_js: dir + 'quiz.js'
                }));

                doc.close();
            }
        });
    });
});

