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
        var dataInList = [];
        $.each(data, function() {
            classificationData = data;
            if (this.is_parent) {
                return;
            }
            dataInList.push(this);
            tableContent += '<tr>';
            tableContent += '<td>' + this.parent + '</td>';
            tableContent += '<td>' + this.parent_name + '</td>';
            tableContent += '<td>' + this._id + '</td>';
            tableContent += '<td><a href="#" class="linkshowclassinfo" rel="' + this._id + '">' + this.name + '</a></td>';
            tableContent += '<td>';
            var actionTypes = ['edit', 'delete'];
            for (var i = 0; i < actionTypes.length; i++) {
                tableContent +=  generateAdminAction($('input[name="_csrf"]').val(), 'classification', this._id, actionTypes[i]);
            }
            tableContent += '</td>';
            //tableContent += '<td><a href="#" class="linkdeleteclass" rel="' + this._id + '">Delete</a></td>';
            tableContent += '</tr>';
        });
        $('#adminClassificationList table tbody').html(tableContent);
        
        $('#adminClassificationList').append(generateListFooter(dataInList));
    });
}


function populateActorTypeInfo() {
    var tableContent = '';
    $.getJSON('/actortype/list', function(data) {
        var dataInList = [];
        $.each(data, function() {
            actorTypeData = data;
            if (this.is_parent) {
                return;
            }
            dataInList.push(this);
            tableContent += '<tr>';
            tableContent += '<td>' + this.parent + '</td>';
            tableContent += '<td>' + this.parent_name + '</td>';
            tableContent += '<td>' + this._id + '</td>';
            tableContent += '<td><a href="#" class="linkshowactorinfo" rel="' + this._id + '">' + this.name + '</a></td>';
            tableContent += '<td>';
            var actionTypes = ['edit', 'delete'];
            for (var i = 0; i < actionTypes.length; i++) {
                tableContent +=  generateAdminAction($('input[name="_csrf"]').val(), 'actortype', this._id, actionTypes[i]);
            }
            tableContent += '</td>';
            //tableContent += '<td><a href="#" class="linkdeleteclass" rel="' + this._id + '">Delete</a></td>';
            tableContent += '</tr>';
        });
        $('#adminActorTypeList table tbody').html(tableContent);
        
        $('#adminActorTypeList').append(generateListFooter(dataInList));
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

// generate action form for edit and delete action of a certain data (class or actor)
function generateAdminAction(csrfToken, dataType, dataId, actionType) {
    if (dataType === undefined || (dataType != 'actortype' && dataType != 'classification') || dataId === undefined || actionType === undefined || (actionType != 'delete' && actionType != 'edit')) {
        return false;
    }
    
    // generate url for form action
    var formActionUrl = '#';
    if (actionType == 'edit') {
        // TODO: decide the edit action logic and interaction
        formActionUrl = '#'
    } else if (actionType == 'delete') {
        formActionUrl = '/admin/' + dataType + '/delete/' + dataId;
    }
    
    // generate form method for hidden
    var formMethod = actionType == 'delete' ? 'DELETE' : 'PUT';
    
    var formClass = 'admin-action-form-' + actionType;
    
    // generate submit icon class
    var icon = 'Go';
    if (actionType == 'edit') {
        icon = '<span class="glyphicon glyphicon-pencil text-primary"></span>';
    } else if (actionType == 'delete') {
        icon = '<span class="glyphicon glyphicon-remove text-danger"></span>';
    }
    
    var formContent = '<form class="' + formClass + '" role="form" method="POST" action="' + formActionUrl + '" style="display: inline-block;">';
    formContent += '<input type="hidden" name="_method" value="' + formMethod + '">';
    formContent += '<input type="hidden" name="_csrf" value="'+ csrfToken +'">';
    formContent += '<button type="submit" class="btn btn-xs" title="' + actionType + '">' + icon + '</button>';
    formContent += '</form>';
    
    return formContent;
}

function generateListFooter(data) {
    // results count
    var listFooter = '<div class="panel-footer"><strong>' + data.length + '&nbsp;';
    if (data.length == 1) {
        listFooter += 'result';
    } else {
        listFooter += 'results';
    }
    listFooter += '</strong></div>';
    
    // TODO: pager
    
    return listFooter;
}