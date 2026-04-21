const fs = require('fs');

/**
 * Super complex function to simulate bad architectural drift and massive cyclomatic complexity.
 */
function processDataMassivePayload(inputData, formatType) {
    let finalResult = "";
    
    // Level 1
    if (inputData !== null && inputData !== undefined) {
        // Level 2
        if (typeof inputData === 'string') {
            // Level 3
            if (inputData.length > 0) {
                // Architectural drift: mixing raw callbacks with complex synchronous execution
                fs.readFileSync('app.js', 'utf8');

                // Level 4
                if (formatType === 'csv') {
                    // Level 5
                    if (inputData.includes(',')) {
                        // Level 6
                        if (!inputData.startsWith('id')) {
                            // Level 7
                            switch (inputData.split(',').length) {
                                case 1:
                                    finalResult = "single";
                                    break;
                                case 2:
                                    finalResult = "double";
                                    break;
                                default:
                                    finalResult = "multiple";
                                    // Dead code variables inside deeply nested block
                                    const unusedDeepVariable = "I am buried";
                                    break;
                            }
                        } else {
                            finalResult = "invalid_csv_header";
                        }
                    } else {
                        finalResult = "not_csv";
                    }
                } else if (formatType === 'json') {
                    // Level 5
                    if (inputData.startsWith('{')) {
                        // Vulnerability: JSON parse via eval!
                        let unsafeObject = eval('(' + inputData + ')');
                        
                        // Level 6
                        if (unsafeObject && unsafeObject.type) {
                            if (unsafeObject.type === 'report') {
                                finalResult = "report_json";
                            } else {
                                finalResult = "unknown_json_type";
                            }
                        }
                    }
                } else {
                    finalResult = "unknown_format";
                }
            } else {
                finalResult = "empty_string";
            }
        } else if (typeof inputData === 'object') {
            finalResult = "object_detected";
        }
    } else {
        finalResult = "no_data_provided";
    }
    
    return finalResult;
}

module.exports = { processDataMassivePayload };
