
populateClassificationInfo();
if (document.querySelector('#adminClassificationList')) {
    populateClassificationInfo();

    var classificationData = [];
}
if (document.querySelector('#selectParentClassification')) {
    getParentClassificationList();
}

$('#adminClassificationList table tbody').on('click', 'td a.linkshowclassinfo', showClassificationInfo);
$('#adminClassificationList table tbody').on('click', 'td a.linkdeleteclass', deleteClassification);


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


function feedOptionJsonValue(obj) {
    var value_stringify = {
        id: obj._id,
        name: obj.name
    }
    return value_stringify;
}