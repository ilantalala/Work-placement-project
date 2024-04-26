import React from 'react';

function FileUploadInput({ label, accept, onFileChange }) {
    return (
        <div className="file-upload">
            <label htmlFor={label}>{`Upload ${label} CSV:`}</label>
            <input
                type="file"
                id={label}
                name={label}
                accept={accept}
                onChange={(e) => onFileChange(e.target.files[0])}
            />
        </div>
    );
}

export default FileUploadInput;
