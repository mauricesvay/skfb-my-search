const axios = require("axios");
const BASE_URL = "https://api.sketchfab.com";
const COLLECTIONS_ENDPOINT = "/v3/collections";
const MODELS_ENDPOINT = "/v3/models";
const ME_ENDPOINT = "/v3/me";
const MY_MODELS_ENDPOINT = "/v3/me/models";
const SEARCH_ENDPOINT = "/v3/search";
const USERS_ENDPOINT = "/v3/users";

function Sketchfab(auth) {
    this.auth = auth;
}

Sketchfab.prototype.getAxiosInstance = function getAxiosInstance() {
    if (!this.auth) {
        return axios.create({
            baseURL: BASE_URL
        });
    } else {
        return axios.create({
            baseURL: BASE_URL,
            headers: {
                Authorization: `Token ${this.auth.token}`
            }
        });
    }
};

Sketchfab.prototype.getModels = function getModels(options) {
    var instance = this.getAxiosInstance();
    return new Promise((resolve, reject) => {
        instance
            .get(MODELS_ENDPOINT, { params: options })
            .then(response => {
                resolve(response.data);
            })
            .catch(reject);
    });
};

Sketchfab.prototype.getMyModels = function getModels(options) {
    var instance = this.getAxiosInstance();
    return new Promise((resolve, reject) => {
        instance
            .get(MY_MODELS_ENDPOINT, { params: options })
            .then(response => {
                resolve(response.data);
            })
            .catch(reject);
    });
};

Sketchfab.prototype.getModelsInCollection = function getModelsInCollection(uid, options) {
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
};

Sketchfab.prototype.searchModels = function searchModels(options) {
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
};

Sketchfab.prototype.getModelByUid = function getModelByUid(uid) {
    var instance = this.getAxiosInstance();
    return new Promise((resolve, reject) => {
        instance
            .get(`${MODELS_ENDPOINT}/${uid}`)
            .then(response => {
                resolve(response.data);
            })
            .catch(reject);
    });
};

Sketchfab.prototype.getUsers = function getUsers(options) {
    var instance = this.getAxiosInstance();
    return new Promise((resolve, reject) => {
        instance
            .get(USERS_ENDPOINT, { params: options })
            .then(response => {
                resolve(response.data);
            })
            .catch(reject);
    });
};

Sketchfab.prototype.searchUsers = function searchUsers(options) {
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
};

Sketchfab.prototype.getUserByUid = function getUserByUid(uid) {
    var instance = this.getAxiosInstance();
    return new Promise((resolve, reject) => {
        instance
            .get(`${USERS_ENDPOINT}/${uid}`)
            .then(response => {
                resolve(response.data);
            })
            .catch(reject);
    });
};

Sketchfab.prototype.getUserByUsername = function getUserByUsername(username) {
    return this.getUserByUid(`@${username}`);
};

Sketchfab.prototype.me = function() {
    var instance = this.getAxiosInstance();
    return new Promise((resolve, reject) => {
        instance
            .get(ME_ENDPOINT)
            .then(response => {
                resolve(response.data);
            })
            .catch(reject);
    });
};

module.exports = Sketchfab;
