Pete.ready(function () {
    // Change 'chord_builder_quiz' to 'Chord Builder Quiz'.
    var reReplaceUnderscore = /_/g,
        reUppercase = /\b([a-zA-Z])/g,
        reReplaceHash = /^#/,
        cachedQuizzes = {};

    Pete.ajax.load({
        url: 'app.json',
        success: function (response) {
            var quizzes = JSON ?
                    JSON.parse(response) :
                    eval('[' + response + ']'),
                q = [],
                i, len, quizText;

            // Construct the quiz menu from app.json.
            for (i = 0, len = quizzes.length; i < len; i++) {
                quizText = quizzes[i].replace(reReplaceUnderscore, ' ').replace(reUppercase, function (a, $1) {
                    return $1.toUpperCase();
                });

                q.push({
                    tag: 'li',
                    items: [{
                        tag: 'a',
                        text: quizText,
                        attr: {
                            href: '#' + quizzes[i],
                            title: quizText
                        }
                    }]
                });
            }

            Pete.Element.create({
                tag: 'header',
                items: [{
                    tag: 'nav',
                    items: [{
                        tag: 'ul',
                        items: q
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
        }
    });
});

