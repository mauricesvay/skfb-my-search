import React from "react";
import relativedate from "relative-date";

class Searchbar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            q: ""
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSync = this.handleSync.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        //Replay search at end of sync
        if (this.props.isSyncing && !nextProps.isSyncing && this.state.q != "") {
            console.log("Replay search");
            this.props.onSearch(this.state.q);
        }
        if (this.props.isIndexing && !nextProps.isIndexing && this.state.q != "") {
            console.log("Replay search");
            this.props.onSearch(this.state.q);
        }
    }

    handleChange(event) {
        this.setState({ q: event.target.value });
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.onSearch(this.state.q);
    }

    handleSync(e) {
        e.preventDefault();
        this.props.onSync();
    }

    handleLogout(e) {
        e.preventDefault();
        this.props.onLogout();
    }

    renderSync() {
        if (this.props.isSyncing) {
            return <span>Syncing…</span>;
        } else {
            var date = this.props.syncedAt ? relativedate(this.props.syncedAt) : "never";
            return (
                <span>
                    Last sync:{" "}
                    <a href="#" onClick={this.handleSync} title="Sync now">
                        🔄
                    </a>{" "}
                    <span>{date}</span>
                </span>
            );
        }
    }

    render() {
        return (
            <nav className="navbar navbar-light bg-light">
                <div className="container">
                    <form id="search" className="form-inline active" onSubmit={this.handleSubmit}>
                        <div className="input-group">
                            <input
                                autoComplete="off"
                                autoFocus
                                className="form-control"
                                size="60"
                                type="search"
                                id="q"
                                name="q"
                                value={this.state.q}
                                placeholder="Search your models"
                                onChange={this.handleChange}
                            />
                            <span className="input-group-btn">
                                <button className="btn btn-primary" type="submit">
                                    Search
                                </button>
                            </span>
                        </div>
                    </form>
                    <div>
                        <span className="navbar-text">
                            <span className="searchbar--models">
                                {this.props.indexCount}
                                {this.props.isIndexing ? "+" : ""} models
                            </span>
                            {" - "}
                            {this.renderSync()}
                            {" - "}
                            <a href="#" onClick={this.handleLogout} title="Clear local data">
                                Log out
                            </a>
                        </span>
                    </div>
                </div>
            </nav>
        );
    }
}

export default Searchbar;
