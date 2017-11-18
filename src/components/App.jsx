import React from "react";
import Cookies from 'js-cookie';
import Result from "./Result.jsx";
import Login from "./Login.jsx";
import Searchbar from "./Searchbar.jsx";
import ModelStore from "../lib/ModelStore";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            indexCount: 0,
            syncedAt: null,
            isSyncing: false,
            results: [],
            hasSearch: false,
            token: null
        };
        this.modelStore = new ModelStore();
        this.init();
    }

    init() {
        this.modelStore
            .buildIndex()
            .then(() => {
                return this.modelStore.info();
            })
            .then(info => {
                this.setState({
                    indexCount: info.indexCount,
                    syncedAt: info.syncedAt
                });

                // Initial sync
                if (info.syncedAt === null) {
                    this.sync();
                }
            });
    }

    login(token) {
        this.setState(
            {
                token: token
            },
            this.init.bind(this)
        );
    }

    logout() {
        Cookies.remove('token');
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
        this.setState({ hasSearch: true });
        try {
            this.modelStore.search(q).then(results => {
                this.setState({
                    results: results
                });
            });
        } catch (error) {
            console.log(error);
        }
    }

    sync() {
        this.setState({ isSyncing: true });
        if (this.state.token) {
            this.modelStore
                .sync(this.state.token)
                .then(() => {
                    return this.modelStore.buildIndex();
                })
                .then(() => {
                    return this.modelStore.info();
                })
                .then(info => {
                    this.setState({
                        indexCount: info.indexCount,
                        syncedAt: info.syncedAt
                    });
                    this.setState({ isSyncing: false });
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
                    {this.state.results.map(result => {
                        return <Result key={result.uid} model={result} />;
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
            return (
                <div>
                    <Searchbar
                        indexCount={this.state.indexCount}
                        isSyncing={this.state.isSyncing}
                        onSearch={this.search.bind(this)}
                        onSync={this.sync.bind(this)}
                        syncedAt={this.state.syncedAt}
                        onLogout={this.logout.bind(this)}
                    />
                    <div className="container">{this.renderResults()}</div>
                </div>
            );
        } else {
            return <Login onLogin={this.login.bind(this)} />;
        }
    }
}

export default App;