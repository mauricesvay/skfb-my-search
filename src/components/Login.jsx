import React from "react";
import Cookies from "js-cookie";
import Sketchfab from "../lib/sketchfab";

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            token: ""
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        var token = Cookies.get("token");
        if (token) {
            this.login(token);
        }
    }

    handleChange(event) {
        this.setState({ token: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.login(this.state.token);
    }

    login(token) {
        var client = new Sketchfab({ token: token });
        client
            .me()
            .then(() => {
                Cookies.set("token", token, { expires: 365 });
                this.props.onLogin(token);
            })
            .catch(() => {
                Cookies.remove("token");
                alert("Login error: invalid token");
            });
    }

    renderForm() {
        return (
            <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <label>
                        Sketchfab secret API token (<a
                            href="https://sketchfab.com/settings/password"
                            target="_blank"
                        >
                            get your token
                        </a>):
                    </label>
                    <input
                        autoComplete="off"
                        className="form-control"
                        type="text"
                        value={this.state.token}
                        size="40"
                        maxLength="32"
                        onChange={this.handleChange}
                    />
                </div>
                <button className="btn btn-primary" type="submit">
                    Log in
                </button>
            </form>
        );
    }

    render() {
        return (
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-6">
                        <div className="card">
                            <div className="card-header">Login</div>
                            <div className="card-body">{this.renderForm()}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;
