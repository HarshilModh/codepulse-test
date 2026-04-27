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

function analyzeComplexStructure(obj, depth, mode) {
    let score = 0;
    if (obj) {                                                        // L1
        if (typeof obj === 'object') {                                 // L2
            for (let key in obj) {                                     // L3
                if (obj.hasOwnProperty(key)) {                        // L4
                    if (depth > 0) {                                  // L5
                        if (mode === 'recursive') {                   // L6
                            if (key.startsWith('_')) {                // L7
                                switch (typeof obj[key]) {            // L8
                                    case 'string':
                                        score += obj[key].length;
                                        if (score > 100) {            // L9
                                            console.log("High score reached");
                                        }
                                        break;
                                    case 'number':
                                        score += obj[key];
                                        break;
                                    default:
                                        score += 1;
                                }
                            } else {
                                score += analyzeComplexStructure(obj[key], depth - 1, mode);
                            }
                        } else if (mode === 'flat') {
                            score += 1;
                        }
                    } else {
                        score -= 1;
                    }
                }
            }
        } else {
            score = -100;
        }
    } else {
        score = 0;
    }
    return score;
}

module.exports = { processDataMassivePayload, analyzeComplexStructure };
