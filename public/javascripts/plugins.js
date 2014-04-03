var classificationData = [];


$(document).ready(function() {
    populateClassificationList();
    populateActorTypeList();
    populateOfferList();
    populateNeedList();
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
            tableContent += '<a href="/offer/' + this._id + '", title=' + this._name + '>' + this.name + '</a>';
            tableContent += '<ul>';
            for (var i=0; i<displayFields.length; i++) {
                tableContent += '<li>';
                for (key in displayFields[i]) {
                    tableContent += displayFields[i][key] + this[key];
                }
                tableContent += '</li>'
            }
            tableContent += '</ul>';
            tableContent += '</li>';
        });
        $('#needList ul').html(tableContent);
    });
    console.log(classificationData);
}