const elasticlunr = require("elasticlunr");
const localforage = require("localforage");

class ModelIndex {
    constructor(store) {
        this.store = store;
        this.index = elasticlunr(function() {
            this.addField("name");
            this.addField("description");
            this.addField("tags");
            this.setRef("uid");
        });
    }

    init() {
        return new Promise(async (resolve, reject) => {
            console.info("Indexing...");
            console.time("indexing");
            var model;
            var keys = await this.store.store.keys();

            for (var i = 0, l = keys.length; i < l; i++) {
                try {
                    model = await this.store.store.getItem(keys[i]);
                    this.index.addDoc({
                        uid: model.uid,
                        name: model.name,
                        description: model.description,
                        tags: model.tags.map(tag => tag.name)
                    });
                } catch (e) {
                    console.info(`Error indexing ${keys[i]}`);
                }
            }
            console.info("Indexing finished");
            console.timeEnd("indexing");
            resolve(keys.length);
        });
    }

    on() {
        var args = Array.prototype.slice.call(arguments);
        return this.index.on.apply(this.index, args);
    }

    off() {
        var args = Array.prototype.slice.call(arguments);
        return this.index.off.apply(this.index, args);
    }

    getCount() {
        var count = this.index.documentStore.length;
        return count;
    }

    add(model) {
        this.index.addDoc({
            uid: model.uid,
            name: model.name,
            description: model.description,
            tags: model.tags.map(tag => tag.name)
        });
    }

    remove(model) {
        this.index.removeDoc(model);
    }

    search(q) {
        var docs = [];
        return new Promise(async (resolve, reject) => {
            var searchResults = this.index.search(q, {
                fields: {
                    name: { boost: 2 },
                    description: { boost: 1 },
                    tags: { boost: 1 }
                },
                expand: true
            });
            var uid;
            var model;
            for (var i = 0, l = searchResults.length; i < l; i++) {
                uid = searchResults[i].ref;
                try {
                    model = await this.store.store.getItem(uid);
                    docs.push(model);
                } catch (e) {
                    console.error(`Can not find ${uid}`);
                }
            }
            resolve(docs);
        });
    }
}

module.exports = ModelIndex;
