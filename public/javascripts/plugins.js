
$(document).ready(function() {
    populateClassificationList();
    populateActorTypeList();
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