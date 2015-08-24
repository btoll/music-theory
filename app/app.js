Pete.ready(function () {
    // Change 'chord_builder_quiz' to 'Chord Builder Quiz'.
    var reReplaceUnderscore = /_/g,
        reUppercase = /\b([a-zA-Z])/g,
        reReplaceHash = /^#/,
        cachedQuizzes = {};

    Pete.ajax.load({
        url: 'app.json',
        success: function (response) {
            var qs = JSON ?
                    JSON.parse(response) :
                    eval('[' + response + ']'),
                quizMap = {},
                items = [],
                q, i, len, quizName, quizText, links;

            // Construct the quiz menu from app.json.
            for (i = 0, len = qs.length; i < len; i++) {
                q = qs[i];
                quizName = q.name;

                quizText = quizName.replace(reReplaceUnderscore, ' ').replace(reUppercase, function (a, $1) {
                    return $1.toUpperCase();
                });

                quizMap[quizName] = q.data;

                items.push({
                    tag: 'li',
                    items: [{
                        tag: 'a',
                        text: quizText,
                        attr: {
                            href: '#' + quizName,
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
                        items: items
                    }]
                }],
                parent: document.body
            });

            links = Pete.Element.gets('nav a');

            links.on('click', function (e) {
                var quizName = e.target.hash.replace(reReplaceHash, ''),
                    quiz = quizMap[quizName],
                    iframeId = 'sandbox-' + quizName,
                    dir = 'app/quizzes/' + quizName + '/';

                e.preventDefault();

                // Return early if already downloaded.
                if (cachedQuizzes[quizName]) {
                    return;
                }

                // Cache the quiz.
                cachedQuizzes[quizName] = true;

                Pete.Element.create({
                    tag: 'iframe',
                    id: iframeId,
                    style: {
                        borderWidth: 0,
                        height: (quiz.height || 300) + 'px',
                        verticalAlign: 'top',
                        width: (quiz.width || 800) + 'px'
                    },
                    parent: document.body
                }),

                Pete.ajax.load({
                    url: 'template.html',
                    success: function (response) {
                        var doc = Pete.getDom(iframeId).contentDocument,
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

            // Disable the default browser behavior of showing link tooltip on hover.
            (function () {
                var title;

                function removeTitle() {
                    title = this.title;
                    this.title = '';
                }

                function resetTitle() {
                    this.title = title;
                }

                links.on('mouseover', removeTitle);
                links.on('mouseout', resetTitle);
            }());
        }
    });
});

