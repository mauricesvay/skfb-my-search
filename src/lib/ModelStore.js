var EventEmitter = require("events").EventEmitter;
const localforage = require("localforage");
const Sketchfab = require("./sketchfab");
const sleep = require("./sleep");

class ModelStore extends EventEmitter {
    constructor() {
        super();
        this.store = localforage.createInstance({
            name: "mymodels"
        });
        this.metadata = localforage.createInstance({
            name: "mymodels-metadata"
        });
    }
    info() {
        return this.metadata.getItem("syncedAt");
    }
    clear() {
        this.store.clear();
        this.metadata.clear();
    }
    fetchPage(client, params) {
        return client.getMyModels(params);
    }
    sync(token, params = {}) {
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
                    if (next) {
                        params.cursor = next;
                    }
                    response = await this.fetchPage(client, params);
                    for (var i = 0, l = response.results.length; i < l; i++) {
                        model = response.results[i];
                        model.syncedAt = syncDate;
                        this.store.setItem(model.uid, model);
                        this.emit("add", model);
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

            //Prune stale models
            try {
                await this.prune(syncDate);
            } catch(error) {
                console.error(error);
            }

            this.metadata.setItem("syncedAt", syncDate);
            console.info("Sync finished");
            resolve();
        });
    }
    prune(lastSyncedAt) {
        var stale = [];

        return new Promise((resolve, reject) => {
            this.store
                .iterate((model, key, i) => {
                    if (model.syncedAt < lastSyncedAt) {
                        this.emit("remove", model);
                        stale.push(model.uid);
                    }
                })
                .then(() => {
                    console.log(`stale models: ${stale.length}`);
                    for (var i = 0, l = stale.length; i < l; i++) {
                        this.store.removeItem(stale[i]);
                    }
                    resolve();
                })
                .catch(reject);
        });
    }
    getAll(options) {
        var all = [];

        return new Promise((resolve, reject) => {
            this.store
                .iterate((model, key, i) => {
                    all.sort(function(a,b){
                        var aTime = +new Date(a.createdAt);
                        var bTime = +new Date(b.createdAt);
                        return bTime - aTime;
                    });
                    all.push(model);
                })
                .then(() => {
                    resolve(all);
                })
                .catch(reject);
        });
    }
}

module.exports = ModelStore;
