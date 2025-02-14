import "./index.css";

const PlainInput = ({ label, value, onChange, type = "text", required = false, readOnly = false, hidden = false }) => {
    return (
        <div className="field-container" hidden={hidden}>
            <label>{label}</label>
            <input
                className="enhanced-input"
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                readOnly={readOnly}
            />
        </div>
    );
};

export default PlainInput;
