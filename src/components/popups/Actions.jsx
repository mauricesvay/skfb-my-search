import React from "react";
import ReactModal from "react-modal";

var overlayStyles = {
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 3,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
};

var contentStyles = {
    border: "none",
    padding: 0,
    minWidth: 400,
    position: "relative",
    top: "auto",
    left: "auto",
    right: "auto",
    bottom: "auto"
};

class ActionsPopup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            category: ""
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.onSubmit(this.state.category);
        this.props.onRequestClose();
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === "checkbox" ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    render() {
        return (
            <ReactModal
                isOpen={this.props.isOpen}
                onRequestClose={this.props.onRequestClose}
                contentLabel="Shading"
                style={{ overlay: overlayStyles, content: contentStyles }}
            >
                <div className="modal-header">
                    <h1 className="modal-title h5">Add category</h1>
                    <button
                        type="button"
                        className="close"
                        data-dismiss="modal"
                        aria-label="Close"
                        onClick={this.props.onRequestClose}
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <form onSubmit={this.handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label htmlFor="categoriesSelect">Category</label>
                            <select
                                className="form-control"
                                id="categoriesSelect"
                                onChange={this.handleInputChange}
                                name="category"
                            >
                                <option value="" key="null">Select a category</option>
                                { this.props.categories.map((cat)=>{
                                    return <option value={cat.slug} key={cat.uid}>{cat.name}</option>
                                })}
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-primary">
                            Add to {this.props.selectedItems.filter(value => value).length} models
                        </button>
                    </div>
                </form>
            </ReactModal>
        );
    }
}

export default ActionsPopup;
