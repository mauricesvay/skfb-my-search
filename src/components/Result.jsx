import React from "react";

function getImage(model) {
    return model.thumbnails.images.reduce((acc, cur) => {
        if (cur.width > 200) {
            return cur;
        } else {
            return acc;
        }
    });
}

function getCreatedDate(model) {
    var dateRegex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/;
    var matches = dateRegex.exec(model.createdAt);
    if (matches) {
        return `${matches[1]}-${matches[2]}-${matches[3]} ${matches[4]}:${matches[5]}:${matches[6]}`;
    }
    return model.createdAt;
}

function Result(props) {
    const model = props.model;

    return (
        <div className="d-flex list-group-item">
            <span className="align-self-center mr-2">
                <input type="checkbox" />
            </span>
            <a href={model.viewerUrl} target="_blank">
                <span
                    className="mr-2"
                    style={{
                        backgroundImage: "url(" + getImage(model).url + ")",
                        backgroundSize: "cover",
                        height: 54,
                        width: 96,
                        display: "inline-block"
                    }}
                />
            </a>
            <div className="media-body">
                <span>
                    <a href={model.viewerUrl} target="_blank">
                        {model.name}
                    </a>{" "}
                    {model.isPrivate ? <span className="badge badge-danger">private</span> : ""}{" "}
                    {model.publishedAt ? "" : <span className="badge badge-secondary">draft</span>}
                    <br />
                    <span className="text-muted">{getCreatedDate(model)}</span>
                </span>
            </div>
        </div>
    );
}

export default Result;
