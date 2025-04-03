import React, { useState, useEffect } from "react";

const fieldMapping = {
    "input_text": { "form_feild": "text_input" },
    "autofill": {
        "form_feild": "text_input",
        "autofill_type": {
            "drop_down": {
                "static_mapping": "requires autofill_value",
                "reference": "requires autofill_value",
                "user_mapping": "requires autofill_value",
                "date_today": "not required autofill_value"
            }
        },
        "autofill_value": "text_input"
    },
    "check_list": { "form_feild": "text_input" }
};

const EditableJsonForm = () => {
    const [jsonData, setJsonData] = useState({});
    const [formList, setFormList] = useState([]);
    const [selectedForm, setSelectedForm] = useState("");
    const [staticMappingOptions, setStaticMappingOptions] = useState([]);
    const [userMappingOptions, setUserMappingOptions] = useState([]);

    useEffect(() => {
        fetch("https://onestrealestate.co/api/list_of_forms")
            .then(response => response.json())
            .then(data => setFormList(data))
            .catch(error => console.error("Error fetching forms list:", error));
    }, []);

    const fetchFormJson = (fileName) => {
        fetch(`https://onestrealestate.co/api/get_form_json/${fileName}`)
            .then(response => response.json())
            .then(data => {
                setJsonData(data);
                Object.values(data).forEach(field => {
                    if (field.Type === "autofill" && field.autofill_type) {
                        fetchMappingOptions(field.autofill_type);
                    }
                });
            })
            .catch(error => console.error("Error fetching form JSON:", error));
    };

    const fetchMappingOptions = (type) => {
        const url = type === "static_mapping" 
            ? "https://onestrealestate.co/api/get_form_json/autofill_static_mapping.json?type=mapping_json"
            : "https://onestrealestate.co/api/get_form_json/autofill_user_mapping.json?type=mapping_json";
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (type === "static_mapping") {
                    setStaticMappingOptions(Object.keys(data));
                } else {
                    setUserMappingOptions(Object.keys(data));
                }
            })
            .catch(error => console.error(`Error fetching ${type} options:`, error));
    };

    const handleChange = (key, field, value) => {
        setJsonData(prevData => {
            const updatedData = { ...prevData };
            updatedData[key][field] = value;
            return updatedData;
        });

        if (field === "autofill_type") {
            fetchMappingOptions(value);
        }
    };

    const saveJson = () => {
        if (!selectedForm) {
            alert("Please select a form first");
            return;
        }
        fetch(`https://onestrealestate.co/api/update_form_json/${selectedForm}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonData)
        })
        .then(response => response.json())
        .then(data => console.log("JSON saved successfully:", data))
        .catch(error => console.error("Error saving JSON:", error));
    };

    return (
        <div style={{ padding: "20px", minHeight: "100vh" }}>
            <h2>Edit JSON Data</h2>
            <label>Select Form:</label>
            <select 
                value={selectedForm} 
                onChange={(e) => {
                    setSelectedForm(e.target.value);
                    fetchFormJson(e.target.value);
                }}
                style={{ marginLeft: "10px", marginBottom: "20px" }}
            >
                <option value="">-- Select a form --</option>
                {formList.map((form, index) => (
                    <option key={index} value={form}>{form}</option>
                ))}
            </select>
            
            <div>
                {Object.entries(jsonData).map(([key, value], index, array) => {
                    // Get all previous keys for "reference" autofill_type
                    const previousKeys = array.slice(0, index).map(([prevKey]) => prevKey);

                    return (
                        <div key={key} style={{ padding: "10px", marginBottom: "10px", borderRadius: "5px" }}>
                            <span style={{ fontWeight: "bold" }}>{key}</span>
                            <select
                                value={value.Type}
                                onChange={(e) => handleChange(key, "Type", e.target.value)}
                                style={{ marginLeft: "10px" }}
                            >
                                {Object.keys(fieldMapping).map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            {fieldMapping[value.Type]?.form_feild && (
                                <input
                                    type="text"
                                    value={value.form_feild || ""}
                                    onChange={(e) => handleChange(key, "form_feild", e.target.value)}
                                    style={{ marginLeft: "10px" }}
                                />
                            )}
                            {value.Type === "autofill" && (
                                <>
                                    <select
                                        onChange={(e) => handleChange(key, "autofill_type", e.target.value)}
                                        value={value.autofill_type || ""}
                                        style={{ marginLeft: "10px" }}
                                    >
                                        {Object.keys(fieldMapping.autofill.autofill_type.drop_down).map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>

                                    {value.autofill_type === "static_mapping" && (
                                        <select
                                            value={value.autofill_value || ""}
                                            onChange={(e) => handleChange(key, "autofill_value", e.target.value)}
                                            style={{ marginLeft: "10px" }}
                                        >
                                            <option value="">-- Select Static Mapping --</option>
                                            {staticMappingOptions.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    )}

                                    {value.autofill_type === "user_mapping" && (
                                        <select
                                            value={value.autofill_value || ""}
                                            onChange={(e) => handleChange(key, "autofill_value", e.target.value)}
                                            style={{ marginLeft: "10px" }}
                                        >
                                            <option value="">-- Select User Mapping --</option>
                                            {userMappingOptions.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    )}

                                    {value.autofill_type === "reference" && (
                                        <select
                                            value={value.autofill_value || ""}
                                            onChange={(e) => handleChange(key, "autofill_value", e.target.value)}
                                            style={{ marginLeft: "10px" }}
                                        >
                                            <option value="">-- Select Reference Key --</option>
                                            {previousKeys.map((prevKey) => (
                                                <option key={prevKey} value={jsonData[prevKey]['form_feild']}>{prevKey}</option>
                                            ))}
                                        </select>
                                        
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
            <button onClick={saveJson} style={{ marginTop: "10px", padding: "10px", background: "blue", color: "white", borderRadius: "5px" }}>Save JSON</button>
        </div>
    );
};

export default EditableJsonForm;
