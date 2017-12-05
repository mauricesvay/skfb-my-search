import React from "react";

function Result(props) {
    function getImage(model) {
        return model.thumbnails.images.reduce((acc, cur) => {
            if (cur.width > 200) {
                return cur;
            } else {
                return acc;
            }
        });
    }

    const model = props.model;
    return (
        <div className="card">
            <a href={model.viewerUrl} target="_blank">
                <span
                    className="card-img-top"
                    style={{
                        backgroundImage: "url(" + getImage(model).url + ")",
                        backgroundSize: "cover",
                        height: 120,
                        display: "block"
                    }}
                />
                <div className="card-body">
                    <span>
                        {model.name} {model.isPrivate ? " (private) " : ""}{" "}
                        {model.publishedAt ? (
                            ""
                        ) : (
                            <span className="badge badge-secondary">draft</span>
                        )}
                    </span>
                </div>
            </a>
        </div>
    );
}

export default Result;
