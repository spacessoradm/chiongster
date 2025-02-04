import "./index.css";

const PlainInput = ({ label, value, onChange, type = "text", required = false, readOnly = false }) => {
    return (
        <div className="field-container">
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
