var classificationData = [];
var actorTypeData = [];

if (document.querySelector('#adminClassificationList')) {
    populateClassificationInfo();

}
if (document.querySelector('#adminActorTypeList')) {
    populateActorTypeInfo();
}
if (document.querySelector('#selectParentClassification')) {
    getParentClassificationList();
}
if (document.querySelector('#selectParentActorType')) {
    getParentActorTypeList();
}
$('#adminClassificationList table tbody').on('click', 'td a.linkshowclassinfo', showClassificationInfo);
$('#adminActorTypeList table tbody').on('click', 'td a.linkshowactorinfo', showClassificationInfo);


function populateClassificationInfo() {
    var tableContent = '';
    $.getJSON('/classification/list', function(data) {
        $.each(data, function() {
            classificationData = data;
            if (this.is_parent) {
                return;
            }
            tableContent += '<tr>';
            tableContent += '<td>' + this.parent + '</td>';
            tableContent += '<td>' + this.parent_name + '</td>';
            tableContent += '<td>' + this._id + '</td>';
            tableContent += '<td><a href="#" class="linkshowclassinfo" rel="' + this._id + '">' + this.name + '</a></td>';
            tableContent += '<td><form action="/admin/classification/delete/' + this._id +'" method="post">';
            tableContent += '<input type="hidden" name="_method" value="DELETE">';
            tableContent += '<input type="hidden" name="_csrf" value="'+ $('input[name="_csrf"]').val() +'">';
            tableContent += '<button type="submit" class="btn btn-danger">Delete</button>';
            tableContent += '</form></td>'
            //tableContent += '<td><a href="#" class="linkdeleteclass" rel="' + this._id + '">Delete</a></td>';
            tableContent += '</tr>';
        });
        $('#adminClassificationList table tbody').html(tableContent);
    });
}


function populateActorTypeInfo() {
    var tableContent = '';
    $.getJSON('/actortype/list', function(data) {
        $.each(data, function() {
            actorTypeData = data;
            if (this.is_parent) {
                return;
            }
            tableContent += '<tr>';
            tableContent += '<td>' + this.parent + '</td>';
            tableContent += '<td>' + this.parent_name + '</td>';
            tableContent += '<td>' + this._id + '</td>';
            tableContent += '<td><a href="#" class="linkshowactorinfo" rel="' + this._id + '">' + this.name + '</a></td>';
            tableContent += '<td><form action="/admin/actortype/delete/' + this._id +'" method="post">';
            tableContent += '<input type="hidden" name="_method" value="DELETE">';
            tableContent += '<input type="hidden" name="_csrf" value="'+ $('input[name="_csrf"]').val() +'">';
            tableContent += '<button type="submit" class="btn btn-danger">Delete</button>';
            tableContent += '</form></td>'
            //tableContent += '<td><a href="#" class="linkdeleteclass" rel="' + this._id + '">Delete</a></td>';
            tableContent += '</tr>';
        });
        $('#adminActorTypeList table tbody').html(tableContent);
    });
}


function getParentClassificationList() {
    var tableContent = '';
    $.getJSON('/classification/parentlist', function(data) {
        $.each(data, function() {
            var value_stringify = feedOptionJsonValue(this);
            tableContent += "<option value='" + JSON.stringify(value_stringify) + "'>" + this.name + "</option>";
        });
        $('#selectParentClassification').html(tableContent);
        $('#selectParentClassificationEdit').html(tableContent);
    });
}


function getParentActorTypeList() {
    var tableContent = '';
    $.getJSON('/actortype/parentlist', function(data) {
        $.each(data, function() {
            var value_stringify = feedOptionJsonValue(this);
            tableContent += "<option value='" + JSON.stringify(value_stringify) + "'>" + this.name + "</option>";
        });
        $('#selectParentActorType').html(tableContent);
        $('#selectParentActorTypeEdit').html(tableContent);
    });
}


function showClassificationInfo(event) {
    event.preventDefault();
    var id = $(this).attr('rel');
    var arrayPosition = classificationData.map(function(arrayItem) {
        return arrayItem._id.toString();
    }).indexOf(id);
    var thisClassificationObject = classificationData[arrayPosition];

    $('#inputClassificationNameEdit').val(thisClassificationObject.name);

    var index = 0;
    $('#selectParentClassificationEdit option').each(function() {
        if (this.text == thisClassificationObject.parent_name) {
            $('#selectParentClassificationEdit').get(0).selectedIndex=index;
            return false;
        }
        index++;
    });
    var hidden_input = '<input type="hidden" id="hidden_input" name="id" value="' + thisClassificationObject._id + '">';
    $('#hidden_input').remove();
    $(hidden_input).appendTo('#adminEditClassification form');
}


function showActorTypeInfo(event) {
    event.preventDefault();
    var id = $(this).attr('rel');
    var arrayPosition = actorTypeData.map(function(arrayItem) {
        return arrayItem._id.toString();
    }).indexOf(id);
    var thisActorTypeObject = actorTypeData[arrayPosition];

    $('#inputActorTypeNameEdit').val(thisActorTypeObject.name);

    var index = 0;
    $('#selectParentActorTypeEdit option').each(function() {
        if (this.text == thisActorTypeObject.parent_name) {
            $('#selectParentActorTypeEdit').get(0).selectedIndex=index;
            return false;
        }
        index++;
    });
    var hidden_input = '<input type="hidden" id="hidden_input" name="id" value="' + thisActorTypeObject._id + '">';
    $('#hidden_input').remove();
    $(hidden_input).appendTo('#adminEditActorType form');
}


function feedOptionJsonValue(obj) {
    var value_stringify = {
        id: obj._id,
        name: obj.name
    }
    return value_stringify;
}