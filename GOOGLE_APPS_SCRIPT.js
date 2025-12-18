/**
 * Google Apps Script for Event Avatar Creator
 * Deploy this as a Web App (Execute as: Me, Who has access: Anyone)
 */

function doGet(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var result = [];

    for (var i = 1; i < data.length; i++) {
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = data[i][j];
        }
        result.push(obj);
    }

    // Sort by created_at descending (assuming it's in a sortable format or date)
    result.sort(function (a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
    });

    return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    var action = e.parameter.action;
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var params = JSON.parse(e.postData.contents);
    var headers = sheet.getDataRange().getValues()[0];

    if (action === 'insert') {
        var id = Utilities.getUuid();
        var createdAt = new Date().toISOString();
        var newRow = headers.map(function (h) {
            if (h === 'id') return id;
            if (h === 'created_at') return createdAt;
            if (h === 'is_winner') return params[h] || false;
            return params[h] || '';
        });
        sheet.appendRow(newRow);
        return ContentService.createTextOutput(JSON.stringify({ status: 'success', id: id }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'update') {
        var id = params.id;
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
            if (data[i][0] == id) { // id is first column
                for (var key in params) {
                    var colIndex = headers.indexOf(key);
                    if (colIndex > -1) {
                        sheet.getRange(i + 1, colIndex + 1).setValue(params[key]);
                    }
                }
                return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
                    .setMimeType(ContentService.MimeType.JSON);
            }
        }
    }

    if (action === 'delete') {
        var id = params.id;
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
            if (data[i][0] == id) {
                sheet.deleteRow(i + 1);
                return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
                    .setMimeType(ContentService.MimeType.JSON);
            }
        }
    }

    if (action === 'reset_winners') {
        var data = sheet.getDataRange().getValues();
        var winnerColIndex = headers.indexOf('is_winner');
        if (winnerColIndex > -1) {
            for (var i = 1; i < data.length; i++) {
                sheet.getRange(i + 1, winnerColIndex + 1).setValue(false);
            }
            return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
                .setMimeType(ContentService.MimeType.JSON);
        }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Action not found' }))
        .setMimeType(ContentService.MimeType.JSON);
}
