const axios = require("axios");
const BASE_URL = "https://api.sketchfab.com";
const COLLECTIONS_ENDPOINT = "/v3/collections";
const MODELS_ENDPOINT = "/i/models";
const ME_ENDPOINT = "/v3/me";
const MY_MODELS_ENDPOINT = "/v3/me/models";
const SEARCH_ENDPOINT = "/v3/search";
const USERS_ENDPOINT = "/v3/users";
const CATEGORIES_ENDPOINT = "/v3/categories";

function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
}

class Sketchfab {
    constructor(auth) {
        this.auth = auth;
    }
    getAxiosInstance() {
        if (!this.auth) {
            return axios.create({
                baseURL: BASE_URL
            });
        }
        else {
            return axios.create({
                baseURL: BASE_URL,
                headers: {
                    Authorization: `Token ${this.auth.token}`
                }
            });
        }
    }
    getModels(options) {
        var instance = this.getAxiosInstance();
        return new Promise((resolve, reject) => {
            instance
                .get(MODELS_ENDPOINT, { params: options })
                .then(response => {
                    resolve(response.data);
                })
                .catch(reject);
        });
    }
    patchModel(options) {
        var instance = this.getAxiosInstance();
        var url = "/v3/models/" + options.uid;
        return new Promise((resolve, reject) => {
            instance
                .patch(url, options)
                .then(resolve)
                .catch(reject);
        });
    }
    getMyModels(options) {
        var instance = this.getAxiosInstance();
        return new Promise((resolve, reject) => {
            instance
                .get(MY_MODELS_ENDPOINT, { params: options })
                .then(async (response) => {
                    // resolve(response.data);
                    const models = response.data.results;
                    var all = [];
                    for (var i = 0; i < models.length; i++) {
                        var model = await this.getModelByUid(models[i].uid);
                        await sleep(500);
                        all.push(model);
                    }
                    response.data.results = all;
                    resolve(response.data);
                })
                .catch(reject);
        });
    }
    getModelsInCollection(uid, options) {
        var instance = this.getAxiosInstance();
        return new Promise((resolve, reject) => {
            instance
                .get(`${COLLECTIONS_ENDPOINT}/${uid}/models`, {
                    params: options
                })
                .then(response => {
                    resolve(response.data);
                })
                .catch(reject);
        });
    }
    searchModels(options) {
        options.type = "models";
        var instance = this.getAxiosInstance();
        return new Promise((resolve, reject) => {
            instance
                .get(SEARCH_ENDPOINT, { params: options })
                .then(response => {
                    resolve(response.data);
                })
                .catch(reject);
        });
    }
    getModelByUid(uid) {
        var instance = this.getAxiosInstance();
        return new Promise((resolve, reject) => {
            instance
                .get(`${MODELS_ENDPOINT}/${uid}`)
                .then(response => {
                    resolve(response.data);
                })
                .catch(reject);
        });
    }
    getUsers(options) {
        var instance = this.getAxiosInstance();
        return new Promise((resolve, reject) => {
            instance
                .get(USERS_ENDPOINT, { params: options })
                .then(response => {
                    resolve(response.data);
                })
                .catch(reject);
        });
    }
    searchUsers(options) {
        options.type = "users";
        var instance = this.getAxiosInstance();
        return new Promise((resolve, reject) => {
            instance
                .get(SEARCH_ENDPOINT, { params: options })
                .then(response => {
                    resolve(response.data);
                })
                .catch(reject);
        });
    }
    getUserByUid(uid) {
        var instance = this.getAxiosInstance();
        return new Promise((resolve, reject) => {
            instance
                .get(`${USERS_ENDPOINT}/${uid}`)
                .then(response => {
                    resolve(response.data);
                })
                .catch(reject);
        });
    }
    getUserByUsername(username) {
        return this.getUserByUid(`@${username}`);
    }
    me() {
        var instance = this.getAxiosInstance();
        return new Promise((resolve, reject) => {
            instance
                .get(ME_ENDPOINT)
                .then(response => {
                    resolve(response.data);
                })
                .catch(reject);
        });
    }
    getCategories() {
        var instance = this.getAxiosInstance();
        return new Promise((resolve, reject) => {
            instance
                .get(CATEGORIES_ENDPOINT)
                .then(response => {
                    if (response.data && response.data.results) {
                        resolve(response.data.results);
                    }
                    else {
                        reject("No categories found");
                    }
                })
                .catch(reject);
        });
    }
}














module.exports = Sketchfab;
