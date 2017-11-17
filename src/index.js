const Sketchfab = require('./lib/Sketchfab');
const sleep = require('./lib/sleep');
const elasticlunr = require('elasticlunr');
const DELAY = 500;

function getModels(client, options) {
    return client.getMyModels(options);
}

function fetchRecursive(client, options, fetchFn) {
    return new Promise(async (resolve, reject) => {
        var all = [];
        var response;
        var next;
        var i = 0;

        do {
            try {
                console.log(`Fetching page ${i} using ${fetchFn.name}`);
                var params = { ...options };
                if (next) {
                    params.cursor = next;
                }
                response = await fetchFn(client, params);
                all = all.concat(response.results);

                if (response.next && response.cursors) {
                    next = response.cursors.next;
                } else if (response.next) {
                    // Handle when cursors are not provided separately
                    const url = new URL(response.next);
                    next = url.searchParams.get('cursor');
                } else {
                    next = null;
                }

                i++;
            } catch (e) {
                console.error(e);
                reject(e);
                next = null;
            }
            await sleep(DELAY);
        } while (next);

        resolve(all);
    });
}

function search(documents, index, q) {
    var searchResults = index.search(q, {
        fields: {
            name: { boost: 2 },
            description: { boost: 1 },
            tags: { boost: 1 }
        },
        expand: true
    });
    var docs = searchResults.map(match => {
        var uid = match.ref;
        for (var i = 0; i < documents.length; i++) {
            if (documents[i].uid === uid) {
                return documents[i];
            }
        }
        return {};
    });
    return docs;
}

function onSubmit(e) {
    e.preventDefault();
    var q = this.q.value;
    var output = document.querySelector('.results');
    if (window.index && window.docs) {
        var results = search(docs, index, q);
        if (results.length > 0) {
            output.innerHTML =
                '<ul class="list-group">' +
                results
                    .map(result => {
                        return `<li><a class="list-group-item" href="${result.viewerUrl}">${result.name}</a></li>`;
                    })
                    .join('') +
                '</ul>';
        } else {
            output.innerHTML = '<p>No results</p>';
        }
    }
}

function onLogin(e) {
    e.preventDefault();

    var output = document.querySelector('.results');
    output.innerHTML = '<div class="alert alert-info" role="alert">Indexing…</div>';

    //Indexing
    var client = new Sketchfab({ token: this.token.value });
    fetchRecursive(client, {}, getModels)
        .then(models => {
            console.log('Indexing ', models.length);
            window.docs = models;
            window.index = elasticlunr(function() {
                this.addField('name');
                this.addField('description');
                this.addField('tags');
                this.setRef('uid');
            });
            models.forEach(model => {
                index.addDoc({
                    uid: model.uid,
                    name: model.name,
                    description: model.description,
                    tags: model.tags.map(tag => tag.name)
                });
            });
            onIndexingEnd();
        })
        .catch(error => {
            console.error(error);
        });
}

function onIndexingEnd() {
    var form = document.querySelector('#search');
    var output = document.querySelector('.results');
    form.className += ' active';
    output.innerHTML = '';
}

function init() {
    var loginForm = document.querySelector('#login');
    loginForm.addEventListener('submit', onLogin, false);

    var searchForm = document.querySelector('#search');
    searchForm.addEventListener('submit', onSubmit, false);
}

init();
