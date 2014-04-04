var classificationData = [];


$(document).ready(function() {
    populateClassificationList();
    populateActorTypeList();
    populateTicketList();
    // populateOfferList();
    // populateNeedList();
});


function populateClassificationList() {
    var tableContent = '';
    $.getJSON('/classification/list', function(classification) {
        $.each(classification, function() {
            tableContent += '<option value="' + this._id + '">' + this.name + '</option>';
        });
        $('#classificationList').html(tableContent);
    });
}

function populateActorTypeList() {
    var tableContent = '';
    $.getJSON('/actortype/list', function(actorType) {
        $.each(actorType, function() {
            tableContent += '<option value="' + this._id + '">' + this.name + '</option>';
        });
        $('#actorTypeSourceList').html(tableContent);
        $('#actorTypeTargetList').html(tableContent);
    });
}


var displayFields = [
    { classification_name: 'Class: ' },
    { source_actor_type_name: 'Source: ' },
    { target_actor_type_name: 'Target: ' },
];
var displayDates = [
    { start_date: 'Start Date: ' },
    { end_date: 'End Date: '},
];


function populateOfferList() {
    var tableContent = '';
    $.getJSON('/offer/list', function(offers) {
        $.each(offers, function() {
            tableContent += '<li>';
            tableContent += '<a href="/offer/' + this._id + '", title=' + this._name + '>' + this.name + '</a>';
            tableContent += '</li>';
        });
        $('#offerList ul').html(tableContent);
    });
}


function populateNeedList() {
    var tableContent = '';
    $.getJSON('/need/list', function(needs) {
        $.each(needs, function() {
            tableContent += '<li>';
            tableContent += '<a href="/need/' + this._id + '", title=' + this._name + '>' + this.name + '</a>';
            // class, actor types
            tableContent += '<ul>';
            for (var i=0; i<displayFields.length; i++) {
                tableContent += '<li>';
                for (key in displayFields[i]) {
                    tableContent += displayFields[i][key] + this[key];
                }
                tableContent += '</li>'
            }
            tableContent += '</ul>';
            tableContent += '<p>';
            tableContent += cutDescription(this.description);
            tableContent += '</p>';
            // dates
            tableContent += '<ul>';
            for (var i=0; i<displayDates.length; i++) {
                tableContent += '<li>';
                for (key in displayDates[i]) {
                    tableContent += displayDates[i][key];
                    tableContent += $.format.date(this[key], "dd/MM/yyyy");
                }
                tableContent += '</li>';
            }
            tableContent += '</ul>';
            tableContent += '</li>';
        });
        $('#needList ul').html(tableContent);
    });
}


function populateTicketList() {
    var ticket_types = ['need', 'offer'];
    for (var type_index=0; type_index<ticket_types.length; type_index++) {
        var ticket_type = ticket_types[type_index];
        $.getJSON('/' + ticket_type + '/list', function(tickets) {
            var tableContent = '';
            $.each(tickets, function() {
                tableContent += '<li>';
                tableContent += '<a href="/' + ticket_type + '/' + this._id + '", title=' + this._name + '>' + this.name + '</a>';
                // class, actor types
                tableContent += '<ul>';
                for (var i=0; i<displayFields.length; i++) {
                    tableContent += '<li>';
                    for (key in displayFields[i]) {
                        tableContent += displayFields[i][key] + this[key];
                    }
                    tableContent += '</li>'
                }
                tableContent += '</ul>';
                tableContent += '<p>';
                tableContent += cutDescription(this.description);
                tableContent += '</p>';
                // dates
                tableContent += '<ul>';
                for (var i=0; i<displayDates.length; i++) {
                    tableContent += '<li>';
                    for (key in displayDates[i]) {
                        tableContent += displayDates[i][key];
                        tableContent += $.format.date(this[key], "dd/MM/yyyy");
                    }
                    tableContent += '</li>';
                }
                tableContent += '</ul>';
                tableContent += '</li>';
            });
            $('#' + parseUrl(this.url) + 'List ul').html(tableContent);
        });
    }
}


function cutDescription(description) {
    if (description.length > 140) {
        description = description.substr(0, 140);
        description += '...';
    }
    return description;
}

function parseUrl(url) {
    console.log(url);
    var reg = new RegExp('\/(.*)\/', 'i');
    return url.match(reg)[1];
    // return arr;
};