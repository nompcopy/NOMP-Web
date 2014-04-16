var classificationData = [];

$(document).ready(function() {
    populateClassificationList();
    populateActorTypeList();
    populateTicketList();
    populateMatchingResults();
    populateTicket();
    $('#showoffer').on('click', showOwnerOffer);
    $('#showneed').on('click', showOwnerNeed);
});


function populateTicket() {
    var content = '';
    var source_ticket_json_url = $('#source_ticket').attr('for');
    $.getJSON(source_ticket_json_url, function(ticket) {
        content += ticket.name;
        content += '<br>TODO: data display';
        $('#source_ticket').html(content);
    });

}

function populateMatchingResults() {
    var content = '';
    var matching_json_url = $('#matching_results_label').attr('for');
    var tmp_url = matching_json_url.split('/');
    var source_id = tmp_url[tmp_url.length - 1];
    var source_type = tmp_url[1];

    $.getJSON(matching_json_url, function(matching_results) {
        $.each(matching_results, function() {
            var ticket_type = getTicketType(this.ticket);
            var ticket_url = '/' + ticket_type + '/' + this.ticket._id;
            content += '<a class="list-ticket-title" href="' + ticket_url + '?source_id=' + source_id + '&source_type=' + source_type +  '" title="' + this.ticket.name + '"><strong>' + cutName(this.ticket.name) + '</strong></a>';
            content += '<br>';
        });
        $('#matching_results_label').html(content);
    });
}


function populateClassificationList() {
    var tableContent = '';
    $.getJSON('/classification/list', function(classification) {
        $.each(classification, function() {
            var value_stringify = {
                id: this._id,
                name: this.name
            }
            tableContent += "<option value='" + JSON.stringify(value_stringify) + "'>" + this.name + "</option>";
        });
        $('#classificationList').html(tableContent);
    });
}

function populateActorTypeList() {
    var tableContent = '';
    $.getJSON('/actortype/list', function(actorType) {
        $.each(actorType, function() {
            var value_stringify = {
                id: this._id,
                name: this.name
            }
            tableContent += "<option value='" + JSON.stringify(value_stringify) + "'>" + this.name + "</option>"
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

function generateListElementView(ticket) {
    if (ticket.__t === 'NeedModel') {
        ticket_type = 'need';
    } else {
        ticket_type = 'offer';
    }
    var ticket_url = '/' + ticket_type + '/' + ticket._id;
    
    var content = '<tr>';
    
    // append main photo of the ticket
    var image_src = '';
    if (ticket.media === undefined || ticket.media.image === undefined || ticket.media.image.length == 0) {
        image_src = 'data-src="holder.js/150x100"';
    } else {
        image_src = 'src="' + ticket.media.image[0].replace(/^\.\/public/, '') + '"';
    }
     content += '<td>';
    content += '<a href="' + ticket_url + '" title="' + ticket.name + '">'
    content += '<img class="img-thumbnail list-ticket-photo" alt="' + ticket.name + '" title="' + ticket.name + '"' + image_src + ' />';
    content += '</a>';
    content += '</td>';
    
    content += '<td>';
    
    content += '<p>';
    // append ticket title
    content += '<a class="list-ticket-title" href="' + ticket_url + '" title="' + ticket.name + '"><strong>' + cutName(ticket.name) + '</strong></a>';
    // append ticket class
    content += '&nbsp;<small>' + ticket.classification_name + '</small>';
    content += '</p>';
    
    // append keywords
    if (ticket.keywords !== undefined && ticket.keywords.length > 0) {
        content += '<p>';
        $.each(ticket.keywords, function(i, keyword) {
            if (i > 5) {
                return false;
            }
            content += '<span class="label label-info">' + keyword + '</span>&nbsp;';
        });
        content += '</p>';
    }
    
    // append ticket source&target actor class
    content += '<p><strong>Source: </strong>' + ticket.source_actor_type_name + '&nbsp;<strong>Target: </strong>' + ticket.target_actor_type_name + '</p>';
    
    // append available date period
    //content += '<p><strong>Availability: </strong>' + $.format.date(ticket.start_date, "dd/MM/yyyy") + ' - ' + $.format.date(ticket.end_date, "dd/MM/yyyy") + '</p>';
    
    // append location
    //content += '<p><strong>Location: </strong>' + ticket.address + '</p>';
    
    //content += '</td>';
    
    // append cost/budget and brief description
    //content += '<td class="list-ticket-description">';
    // cost/budget
    if (ticket_type == 'need') {
        var priceKey = 'Budget';
        var priceValue = ticket.budget;
    } else {
        var priceKey = 'Cost';
        var priceValue = ticket.cost;
    }
    if (priceValue !== undefined) {
        content += '<p><strong>' + priceKey + ': </strong>' + priceValue + ' &euro;</p>';
    }
    // description
    content += '<p class="list-ticket-description"><strong>Description: </strong>' + cutDescription(ticket.description) + '</p>';
    content += '<small class="pull-right"><a href="' + ticket_url + '">More</a></small>';
    content += '</td>';
    
    content += '</tr>';
    
    return content;
}

function populateTicketList() {
    var ticket_types = ['need', 'offer'];
    for (var type_index=0; type_index<ticket_types.length; type_index++) {
        var ticket_type = ticket_types[type_index];
        $.getJSON('/' + ticket_type + '/list', function(tickets) {
            var tableContent = '';
            $.each(tickets, function() {
                tableContent += generateListElementView(this);
                /*
                tableContent += '<li>';
                var tmp_type;
                if (this.__t === 'NeedModel') {
                    tmp_type = this.__t.substr(0,4).toLowerCase()
                } else {
                    tmp_type = this.__t.substr(0,5).toLowerCase()
                }
                tableContent += '<a href="/' + tmp_type + '/' + this._id + '", title=' + this.name + '>' + this.name + '</a>';
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
                */
            });
            if ($('#' + parseUrl(this.url) + 'List table tbody').html() === '') {
                $('#' + parseUrl(this.url) + 'List table').append(tableContent);
            }
        });
    }
}


function showOwnerOffer(event) {
    event.preventDefault();
    var tableContent = '';
    $.getJSON('/user/offer/list', function(offers) {
        $.each(offers, function() {
            tableContent += '<tr>';
            tableContent += '<td><a href="/offer/' + this._id + '">' + this.name + '</a></td>';
            tableContent += '</tr>';
        });
        $('#ownerOfferList').html(tableContent);
    });
}


function showOwnerNeed(event) {
    event.preventDefault();

    var tableContent = '';
    $.getJSON('/user/need/list', function(offers) {
        $.each(offers, function() {
            tableContent += '<tr>';
            tableContent += '<td><a href="/need/' + this._id + '">' + this.name + '</a></td>';
            tableContent += '</tr>';
        });
        $('#ownerNeedList').html(tableContent);
    });
}

function getTicketType(ticket) {
    if (ticket.__t === 'NeedModel') {
        ticket_type = 'need';
    } else {
        ticket_type = 'offer';
    }
    return ticket_type;
}

function cutName(name) {
    if (name.length > 40) {
        name = name.substr(0, 40);
        name += '...';
    }
    return name;
}

function cutDescription(description) {
    if (description.length > 140) {
        description = description.substr(0, 140);
        description += '...';
    }
    return description;
}

function parseUrl(url) {
    var reg = new RegExp('\/(.*)\/', 'i');
    return url.match(reg)[1];
    // return arr;
};