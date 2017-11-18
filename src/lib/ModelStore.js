const localforage = require("localforage");
const elasticlunr = require("elasticlunr");
const Sketchfab = require("./sketchfab");
const sleep = require("./sleep");

class ModelStore {
    constructor() {
        this.store = localforage.createInstance({
            name: "mymodels"
        });
        this.metadata = localforage.createInstance({
            name: "mymodels-metadata"
        });

        this.index = null;
    }
    info() {
        var info = {};
        return new Promise((resolve, reject)=> {
            if (this.index) {
                info.indexCount = this.index.toJSON().documentStore.length;
            } else {
                info.indexCount = 0;
            }
            
            this.metadata.getItem('syncedAt').then((syncedAt)=>{
                info.syncedAt = syncedAt;
                return this.store.length();
            }).then((count)=>{
                info.storeCount = count;
                resolve(info);
            });
        });
    }
    clear() {
        this.store.clear();
        this.metadata.clear();
    }
    sync(token) {
        const DELAY = 500;
        var client = new Sketchfab({ token: token });
        var syncDate = +new Date();
        console.info("Starting sync");
        return new Promise(async (resolve, reject) => {
            var response;
            var next;
            var total = 0;
            var model;
            do {
                try {
                    var params = {};
                    if (next) {
                        params.cursor = next;
                    }
                    response = await client.getMyModels(params);
                    for (var i = 0, l = response.results.length; i < l; i++) {
                        model = response.results[i];
                        model.syncedAt = syncDate;
                        this.store.setItem(model.uid, model);
                    }
                    total = total + response.results.length;
                    console.info(`Synced ${total} models`);
                    if (response.next && response.cursors) {
                        next = response.cursors.next;
                    } else if (response.next) {
                        // Handle when cursors are not provided separately
                        const url = new URL(response.next);
                        next = url.searchParams.get("cursor");
                    } else {
                        next = null;
                    }
                } catch (e) {
                    console.error(e);
                    reject(e);
                    next = null;
                }
                await sleep(DELAY);
            } while (next);
            this.prune(syncDate);
            this.metadata.setItem("syncedAt", syncDate);
            console.info("Sync finished");
            resolve();
        });
    }
    prune(lastSyncedAt) {
        var stale = [];
        this.store
            .iterate((value, key, i) => {
                if (value.syncedAt < lastSyncedAt) {
                    stale.push(value.uid);
                }
            })
            .then(() => {
                console.log(`stale models: ${stale.length}`);
                // for (var i = 0, l = stale.length; i < l; i++) {
                //     this.store.removeItem(stale[i]);
                // }
            });
    }
    async buildIndex() {
        this.index = elasticlunr(function() {
            this.addField("name");
            this.addField("description");
            this.addField("tags");
            this.setRef("uid");
        });

        var lastSyncedAt = await this.metadata.getItem("syncedAt");

        return new Promise(async (resolve, reject) => {
            console.info("Indexing...");
            var keys = await this.store.keys();
            var model;
            for (var i = 0, l = keys.length; i < l; i++) {
                try {
                    model = await this.store.getItem(keys[i]);
                    if (model.syncedAt === lastSyncedAt) {
                        this.index.addDoc({
                            uid: model.uid,
                            name: model.name,
                            description: model.description,
                            tags: model.tags.map(tag => tag.name)
                        });
                    } else {
                        console.warn(`${model.uid} not indexed (stale)`);
                    }
                } catch (e) {
                    console.error(`Error indexing ${keys[i]}`);
                }
            }
            console.info("Indexing finished");
            resolve();
        });
    }
    search(q) {
        return new Promise(async (resolve, reject) => {
            if (this.index === null) {
                reject("Index not ready");
                return;
            }

            var searchResults = this.index.search(q, {
                fields: {
                    name: { boost: 2 },
                    description: { boost: 1 },
                    tags: { boost: 1 }
                },
                expand: true
            });
            var docs = [];
            var uid;
            var model;
            for (var i = 0, l = searchResults.length; i < l; i++) {
                uid = searchResults[i].ref;
                try {
                    model = await this.store.getItem(uid);
                    docs.push(model);
                } catch (e) {
                    console.error(`Can not find ${uid}`);
                }
            }
            resolve(docs);
        });
    }
}

module.exports = ModelStore;
