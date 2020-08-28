import { core } from 'pete-core';
import { pete, ajax, dom, element, template } from 'pete-dom';

dom.ready(() => {
    // Change 'chord_builder_quiz' to 'Chord Builder Quiz'.
    const reReplaceUnderscore = /_/g;
    const reUppercase = /\b([a-zA-Z])/g;
    const reReplaceHash = /^#/;
    const cachedQuizzes = {};

    ajax.load({
        url: './build/app.json',
        success: response => {
            const qs = JSON.parse(response);
            const quizMap = {};
            const items = [];
            let quizName, quizText, links;

            // Construct the quiz menu from app.json.
            for (let i = 0, len = qs.length; i < len; i++) {
                let q = qs[i];
                quizName = q.name;

                quizText = quizName.replace(reReplaceUnderscore, ' ').replace(reUppercase, (a, $1) =>
                    $1.toUpperCase()
                );

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

            dom.create({
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

            links = element.gets('nav a');

            links.on('click', e => {
                const quizName = e.target.hash.replace(reReplaceHash, '');
                const quiz = quizMap[quizName];
                const iframeId = `sandbox-${quizName}`;
                const dir = `./build/quiz/${quizName}`;

                e.preventDefault();

                // Return early if already downloaded.
                if (cachedQuizzes[quizName]) {
                    element.get(iframeId).toggleClass('hide');
                    return;
                }

                // Cache the quiz.
                cachedQuizzes[quizName] = true;

                dom.create({
                    tag: 'iframe',
                    id: iframeId,
                    style: {
                        borderWidth: 0,
                        height: `${(quiz.height || 300)}px`,
                        verticalAlign: 'top',
                        width: `${(quiz.width || 800)}px`
                    },
                    parent: document.body
                }),

                ajax.load({
                    url: './build/templates/main.tpl',
                    success: response => {
                        const doc = dom.getDom(iframeId).contentDocument;
                        const tpl = core.create(template, {
                            html: response
                        });

                        doc.open();

                        doc.write(tpl.apply({
                            'scoreboard_css': `${dir}/scoreboard.css`,
                            'quiz_css': `${dir}/quiz.css`,
                            'quiz_js': `${dir}/quiz.js`
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

