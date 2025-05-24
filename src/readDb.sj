const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const DB_NAME = 'usage_stats_legend_formatted.db';
const LEGEND_FIELDS = [
    'id', 'function_code', 'pages', 'documents', 'time_str',
    'estimated_str', 'datetime_str', 'size_hex_str', 'error_str',
    'warning_str', 'rows', 'tabs'
];

function decodeRequestString(requestStr) {
    if (!requestStr || typeof requestStr !== 'string') {
        return null;
    }

    const parts = requestStr.split('-');
    const decodedDict = {};

    if (parts.length !== LEGEND_FIELDS.length) {
        console.warn(`Warning: Request string '${requestStr}' has ${parts.length} parts, expected ${LEGEND_FIELDS.length}. Decoding might be incomplete.`);
    }

    for (let i = 0; i < LEGEND_FIELDS.length; i++) {
        decodedDict[LEGEND_FIELDS[i]] = parts[i] || null;
    }

    ['pages', 'documents', 'rows', 'tabs', 'id'].forEach(key => {
        if (decodedDict[key] !== null) {
            try {
                decodedDict[key] = parseInt(decodedDict[key], 10);
            } catch (e) {
                console.warn(`Warning: Could not convert '${key}' value '${decodedDict[key]}' to int for request string: ${requestStr}`);
            }
        }
    });

    return decodedDict;
}

function getFunctionNameFromCode(codeStr) {
    switch (codeStr) {
        case "20":
            return "TSS";
        case "10":
            return "SFS Bank";
        case "11":
            return "SFS Tax";
        case "0":
            return "Unknown Function";
        default:
            return `SFS (Code: ${codeStr})`;
    }
}

/**
 * Reads data from the SQLite database and returns it as an array of objects.
 *
 * @returns {Promise<Array<object>>} A Promise that resolves to an array of request objects,
 * or rejects with an error message. Each request object
 * includes decoded data.
 */
function readAndDecodeRequests() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(DB_NAME)) {
            reject(`Error: Database file '${DB_NAME}' not found. Please ensure the backend script has run and created the database.`);
            return;
        }

        const db = new sqlite3.Database(DB_NAME, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                reject(`Error opening database: ${err.message}`);
                return;
            }
        });

        db.all(`
            SELECT 
                r.request_pk, 
                r.firebase_request_id, 
                r.request_string, 
                r.logged_at,
                u.email,
                u.company,
                u.role
            FROM requests r
            JOIN users u ON r.user_id = u.user_id
            ORDER BY r.logged_at DESC
        `, [], (err, allRequests) => {
            if (err) {
                db.close(() => reject(`SQLite error: ${err.message}`));
                return;
            }

            const formattedRequests = allRequests.map((requestRow, index) => {
                const { request_pk, firebase_request_id, request_string, logged_at, email, company, role } = requestRow;

                const decodedData = decodeRequestString(request_string);

                return {
                    requestNumber: index + 1,
                    dbPrimaryKey: request_pk,
                    userEmail: email,
                    company: company || 'N/A',
                    role: role || 'N/A',
                    firebaseId: firebase_request_id || 'N/A',
                    loggedAt: logged_at,
                    rawString: request_string,
                    decodedData: decodedData ? {
                        requestId: decodedData.id,
                        functionName: getFunctionNameFromCode(decodedData.function_code),
                        functionCode: decodedData.function_code,
                        pagesProcessed: decodedData.pages,
                        documentsProcessed: decodedData.documents,
                        processingTime: decodedData.time_str,
                        estimatedTime: decodedData.estimated_str,
                        requestDateTime: decodedData.datetime_str,
                        totalSizeBytesHex: decodedData.size_hex_str,
                        errorCode: decodedData.error_str,
                        warningCode: decodedData.warning_str,
                        outputRows: decodedData.rows,
                        outputTabsSheets: decodedData.tabs
                    } : null
                };
            });

            db.close(() => resolve(formattedRequests));
        });
    });
}

module.exports = {
    readAndDecodeRequests,
    decodeRequestString, // Export if you need it elsewhere
    getFunctionNameFromCode // Export if you need it elsewhere
};