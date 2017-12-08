import React from "react";
import Cookies from "js-cookie";
import debounce from "lodash.debounce";
import Result from "./Result.jsx";
import Login from "./Login.jsx";
import Searchbar from "./Searchbar.jsx";
import ModelStore from "../lib/ModelStore";
import ModelIndex from "../lib/ModelIndex";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            indexCount: 0,
            syncedAt: null,
            isIndexing: false,
            isSyncing: false,
            results: [],
            hasSearch: false,
            token: null,
            selectedItems: []
        };
        this.modelStore = new ModelStore();
        this.lastSelectedIndex = null;
    }

    init() {
        // Update status
        this.updateSyncedAt();

        // Refresh sync time regularly
        window.setInterval(() => {
            this.updateSyncedAt();
        }, 60 * 1000);

        this.modelIndex = new ModelIndex(this.modelStore);
        this.setState({
            isIndexing: true
        });
        this.modelIndex.init().then(count => {
            this.setState({
                isIndexing: false
            });

            this.search("");

            //Initial sync
            if (count === 0) {
                this.sync();
            }
        });

        // Keep index in sync with store
        this.modelStore.on("add", model => {
            this.modelIndex.add(model);
        });
        this.modelStore.on("remove", model => {
            this.modelIndex.remove(model);
        });

        var getCount = debounce(() => {
            this.setState({
                indexCount: this.modelIndex.getCount()
            });
        }, 16);
        this.modelIndex.on("add", getCount);
        this.modelIndex.on("remove", getCount);
    }

    updateSyncedAt() {
        return new Promise((resolve, reject) => {
            this.modelStore
                .info()
                .then(syncedAt => {
                    this.setState({
                        syncedAt: syncedAt
                    });
                    resolve();
                })
                .catch(reject);
        });
    }

    login(token) {
        this.setState({ token: token }, this.init.bind(this));
    }

    logout() {
        Cookies.remove("token");
        this.modelStore.clear();
        this.setState({
            indexCount: 0,
            syncedAt: null,
            isSyncing: false,
            results: [],
            hasSearch: false,
            token: null
        });
        this.init();
    }

    search(q) {
        this.setState({ hasSearch: true, q: q, selectedItems: [] });

        if (q === "") {
            this.modelStore
                .getAll()
                .then(models => {
                    this.setState({ results: models });
                })
                .catch(() => {
                    console.error(error);
                });
        } else {
            this.modelIndex
                .search(q)
                .then(results => {
                    this.setState({
                        results: results
                    });
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    handleSelect(id, value, options) {
        var models = this.state.results;
        var index = models.findIndex(model => {
            return model.uid === id;
        });

        var newSelectedItems = this.state.selectedItems.slice(0);

        if (options.shiftKey) {
            if (this.lastSelectedIndex) {
                var from = Math.min(this.lastSelectedIndex.index, index);
                var to = Math.max(this.lastSelectedIndex.index, index);
                var state = this.lastSelectedIndex.state;
                for (var i = from; i <= to; i++) {
                    newSelectedItems[i] = state; //state should be state of last item? e.g GMail
                }
            }
        } else {
            newSelectedItems[index] = !newSelectedItems[index];
            this.lastSelectedIndex = { index: index, state: value };
        }

        this.setState({
            selectedItems: newSelectedItems
        });
    }

    sync() {
        this.setState({ isSyncing: true });
        if (this.state.token) {
            this.modelStore
                .sync(this.state.token)
                .then(() => {
                    this.setState({ isSyncing: false });
                    this.search(this.state.q);
                    return this.updateSyncedAt();
                })
                .catch(error => {
                    this.setState({ isSyncing: false });
                    console.error("Can not sync: error");
                });
        } else {
            this.setState({ isSyncing: false });
            console.error("Can not sync: missing token");
        }
    }

    renderResults() {
        if (this.state.results.length > 0) {
            return (
                <div className="results">
                    {this.state.results.map((result, index) => {
                        return (
                            <Result
                                key={result.uid}
                                model={result}
                                selected={!!this.state.selectedItems[index]}
                                handleSelect={this.handleSelect.bind(this)}
                            />
                        );
                    })}
                </div>
            );
        } else {
            if (this.state.isSyncing) {
                return <p className="results">Search is syncing…</p>;
            } else {
                if (this.state.hasSearch) {
                    return <p className="results">No results</p>;
                }
            }
        }
        return null;
    }

    render() {
        if (this.state.token) {
            var selectedCount = this.state.selectedItems.length
                ? this.state.selectedItems.reduce((acc, value) => (value ? acc + 1 : acc), 0)
                : 0;

            return (
                <div>
                    <Searchbar
                        indexCount={this.state.indexCount}
                        isSyncing={this.state.isSyncing}
                        isIndexing={this.state.isIndexing}
                        onSearch={this.search.bind(this)}
                        onSync={this.sync.bind(this)}
                        syncedAt={this.state.syncedAt}
                        onLogout={this.logout.bind(this)}
                    />
                    <div className="container">
                        <div className="btn-toolbar py-2" role="toolbar" aria-label="Models Toolbar">
                            Selected: {selectedCount}
                        </div>
                        <div className="list-group">{this.renderResults()}</div>
                    </div>
                </div>
            );
        } else {
            return <Login onLogin={this.login.bind(this)} />;
        }
    }
}

export default App;
