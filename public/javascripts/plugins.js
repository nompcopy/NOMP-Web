var subClassification = [];
var subActorType = [];
$(document).ready(function() {
    $('#classificationFilter').on('click', 'a', populateSubClassificationFilter);
    $('#classificationFilter').on('click', 'a', setFilter);

    $('#sourceActorTypeFilter').on('click', 'a', populateSubActorTypeFilter);
    $('#sourceActorTypeFilter').on('click', 'a', setFilter);
    // make blod
    // $('a[id*=]')
    
    /* pager piss */
    var limit = 20;
    var offset = 0;
    // first display on page loaded
    populateTicketList(limit, offset, false);

    // play with limit and offset variables, execute pagers without refresh
    // TODO: see if we could optimize this piss
    $('#page-next').on('click', function() {
        offset += limit;
        populateTicketList(limit, offset, false);
    });
    $('#page-previous').on('click', function() {
        offset -= limit;
        populateTicketList(limit, offset, false);
    });
    /*****************/

    $('#showoffer').on('click', showOwnerOffer);
    $('#showneed').on('click', showOwnerNeed);

    /* date pickers in ticket form */
    $('.input-date').datepicker();
    $('#start_date').on('change', function() {
        $('#end_date').val($(this).val());
    })
    /************************************/

    if (document.querySelector('#adminClassification') || document.querySelector('#adminActorType')) {
        $.getScript('/javascripts/adminPlugin.js');
    }

});

if (document.querySelector('#classificationList')) {
    populateClassificationList();
}
$('#classificationList').on('change', showSubClassificationList);

if (document.querySelector('#actorTypeTargetList')) {
    populateActorTypeList();
}
$('#actorTypeSourceList').on('click', showSubActorTypeList);

if (document.querySelector('#actorTypeSourceList')) {
    populateActorTypeList();
}
$('#actorTypeTargetList').on('change', showSubActorTypeList);

if (document.querySelector('#classificationFilter')) {
    populateClassificationFilter();
}
if (document.querySelector('#sourceActorTypeFilter')) {
    populateSourceActorTypeFilter();
}
if (document.querySelector('#matching_results_list')) {
    populateMatchingResults();
    adjustTicketShow();
}
if (document.querySelector('#source_ticket')) {
    populateSourceTicketData();
}

if (document.querySelector('#ticket_user')) {
    showAuthorName();
}

if (document.querySelector('.ticket-date') || document.querySelector('.input-date')) {
    showConvertedDate();
}


function setFilter(event) {
    var limit = 5;
    var offset = 0;
    var filters = {
        is_parent: []
    };

    // manage the filter dict and the display
    // block classification
    var filter_type = $(this).parents('ul').last().attr('id');
    if (filter_type == 'classificationFilter') {
        $('a[class="classificationFilterSet"]').removeClass();
        $('#classificationFilter').children('li').children('ul').children('li').children('a').css('font-weight', 'normal');
        $('#classificationFilter').children('li').children('a').css('font-weight', 'normal');
        $(this).css('font-weight', 'bold');
        $(this).addClass('classificationFilterSet');
        $(this).parents('li').last().children('a').css('font-weight', 'bold');
    }
    // block actor type
    if (filter_type == 'sourceActorTypeFilter') {
        $('a[class="sourceActorTypeFilterSet"]').removeClass();
        $('#sourceActorTypeFilter').children('li').children('ul').children('li').children('a').css('font-weight', 'normal');
        $('#sourceActorTypeFilter').children('li').children('a').css('font-weight', 'normal');
        $(this).css('font-weight', 'bold');
        $(this).parents('li').last().children('a').css('font-weight', 'bold');
        $(this).addClass('sourceActorTypeFilterSet');
    }

    // construction of filters
    if ($('.classificationFilterSet').length > 0) {
        // If all
        if ($('.classificationFilterSet').text() == 'All') {
            // Do nothing
        }
        else {
            filters.classification = $('.classificationFilterSet').attr('rel');
            if ($('.classificationFilterSet').attr('rel') === $('.classificationFilterSet').parents('li').last().children('a').attr('rel')) {
                filters.is_parent.push('classification');
            }
        }
    }
    if ($('.sourceActorTypeFilterSet').length > 0) {
        if ($('.sourceActorTypeFilterSet').text() == 'All') {
            // Do nothing
        }
        else {
            filters.source_actor_type = $('.sourceActorTypeFilterSet').attr('rel');
            if ($('.sourceActorTypeFilterSet').attr('rel') === $('.sourceActorTypeFilterSet').parents('li').last().children('a').attr('rel')) {
                filters.is_parent.push('actortype');
            }
        }
    }

    populateTicketList(limit, offset, filters);
}

function populateSourceActorTypeFilter() {
    var tableContent = '';
    tableContent += '<li><a href="#">All</a></li>';
    $.getJSON('/actortype/parentlist', function(actors) {
        $.each(actors, function() {
            tableContent += '<li>';
            tableContent += '<a href="#" rel="' + this._id + '">';
            tableContent += this.name;
            tableContent += '</a>';
            tableContent += '<ul style="display: none" id="populateSubSourceActorTypeFilter' + this._id + '"></ul>';
            tableContent += '</li>';
        });
        $('#sourceActorTypeFilter').html(tableContent);
    });
}

function populateSubActorTypeFilter(event) {
    event.preventDefault();

    var parentactortype = $(this).attr('rel');
    tableContent = '';
    $.getJSON('/actortype/list?parentactortype=' + parentactortype, function(actortype) {
        $.each(actortype, function() {
            subActorType.push(this._id);
            tableContent += '<li>';
            tableContent += '<a href="#" rel="' + this._id + '">';
            tableContent += this.name;
            tableContent += '</a>'
            tableContent += '</li>';
        });
        $('#populateSubSourceActorTypeFilter' + parentactortype).html(tableContent);
        $('#populateSubSourceActorTypeFilter' + parentactortype).fadeToggle(200);
    });
}

function populateClassificationFilter() {
    var tableContent = '';
    tableContent += '<li><a href="#">All</a></li>';
    $.getJSON('/classification/parentlist', function(classification) {
        $.each(classification, function() {
            tableContent += '<li>';
            tableContent += '<a href="#" rel="' + this._id + '">';
            tableContent += this.name;
            tableContent += '</a>'
            tableContent += '<ul style="display: none" id="populateSubClassificationFilter' + this._id + '"></ul>';
            tableContent += '</li>';
        });
        $('#classificationFilter').html(tableContent);
    });
}

function populateSubClassificationFilter(event) {
    event.preventDefault();

    var parentclass = $(this).attr('rel');
    tableContent = '';
    $.getJSON('/classification/list?parentclass=' + parentclass, function(classification) {
        $.each(classification, function() {
            subClassification.push(this._id);
            tableContent += '<li>';
            tableContent += '<a href="#" rel="' + this._id + '">';
            tableContent += this.name;
            tableContent += '</a>'
            tableContent += '</li>';
        });
        $('#populateSubClassificationFilter' + parentclass).html(tableContent);
        $('#populateSubClassificationFilter' + parentclass).fadeToggle(200);
    });
}

function populateSourceTicketData() {
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
    if (matching_json_url !== undefined) {
      var tmp_url = matching_json_url.split('/');
      var source_id = tmp_url[tmp_url.length - 1];
      var source_type = tmp_url[1];

      $.getJSON(matching_json_url, function(matching_results) {
          $.each(matching_results, function() {
              var ticket_type = getTicketType(this.ticket);
              var ticket_url = '/' + ticket_type + '/' + this.ticket._id + '?source_id=' + source_id + '&source_type=' + source_type;
              content += '<li class="list-group-item">';
              content += generateListElementView(this.ticket, ticket_url, true);
              content += '</li>';
          });
          $('#matching_results_list').html(content);
      });
    }
}

function populateClassificationList() {
    var tableContent = '<option value="">--- Choose main class ---</option>';
    $.getJSON('/classification/parentlist', function(classification) {
        $.each(classification, function() {
            var value_stringify = {
                id: this._id,
                name: this.name
            }
            tableContent += "<option value='" + JSON.stringify(value_stringify) + "'>" + this.name + "</option>";
        });
        $('#classificationList').html(tableContent);
        if($('#classificationListChild').attr('value')) {
            fillClassification($('#classificationListChild').attr('value'), true);
        }
    });
}


function fillClassification(childId, is_parent) {
    $.getJSON('/classification/' + childId, function(classification) {
        if (is_parent) {
            if (classification.is_parent) {
                var parent_option_val = makeOptionJsonValue(classification._id, classification.name);
            } else {
                var parent_option_val = makeOptionJsonValue(classification.parent, classification.parent_name);
            }
            
            $('#classificationList option[value="' + JSON.stringify(parent_option_val) + '"]').prop('selected','selected');
            showSubClassificationList();
        }
        if (!is_parent) {
            var parent_option_val = feedOptionJsonValue(classification);
            $('#classificationListChild option[value="' + JSON.stringify(parent_option_val) + '"]').prop('selected','selected');
        }
    });
}


function showSubClassificationList() {
    var parent_classification_data = $('#classificationList').val();
    parent_classification_data = JSON.parse(parent_classification_data);
    parent_classification_id = parent_classification_data.id.toString();

    var tableContent = '<option value="">--- Choose sub class ---</option>';

    $.getJSON('/classification/list?parentclass=' + parent_classification_id, function(classification) {
        if(classification.length > 0) {
            $.each(classification, function() {
                var value_stringify = feedOptionJsonValue(this);
                tableContent += "<option value='" + JSON.stringify(value_stringify) + "'>" + this.name + "</option>";
            });
        } 
        // if there is no child, duplicate the selected main class
        else {
            tableContent = $('#classificationList option:selected').clone();
        }
        
        $('#classificationListChild').html(tableContent);
        if($('#classificationListChild').attr('value')) {
            fillClassification($('#classificationListChild').attr('value'), false);
        }
    });
}

function populateActorTypeList() {
    var tableContent = '<option value="">--- Choose main actor ---</option>';
    $.getJSON('/actortype/parentlist', function(actorType) {
        $.each(actorType, function() {
            var value_stringify = {
                id: this._id,
                name: this.name
            }
            tableContent += "<option value='" + JSON.stringify(value_stringify) + "'>" + this.name + "</option>"
        });
        $('#actorTypeSourceList').html(tableContent);
        $('#actorTypeTargetList').html(tableContent);
        if ($('#actorTypeTargetListChild').attr('value')) {
            fillActorType($('#actorTypeTargetListChild').attr('value'), true);
        }
        if ($('#actorTypeSourceListChild').attr('value')) {
            fillActorType($('#actorTypeSourceListChild').attr('value'), true);
        }
    });
}


function fillActorType(childId, is_parent) {
    $.getJSON('/actortype/' + childId, function(actortype) {
        if (is_parent) {
            if (actortype.is_parent) {
                var parent_option_val = makeOptionJsonValue(actortype._id, actortype.name);
            } else {
                var parent_option_val = makeOptionJsonValue(actortype.parent, actortype.parent_name);
            }
            
            $('#actorTypeSourceList option[value="' + JSON.stringify(parent_option_val) + '"]').prop('selected','selected');
            $('#actorTypeTargetList option[value="' + JSON.stringify(parent_option_val) + '"]').prop('selected','selected');
            showSubActorTypeList();
        }
        if (!is_parent) {
            var parent_option_val = feedOptionJsonValue(actortype);
            $('#actorTypeSourceListChild option[value="' + JSON.stringify(parent_option_val) + '"]').prop('selected','selected');
            $('#actorTypeTargetListChild option[value="' + JSON.stringify(parent_option_val) + '"]').prop('selected','selected');
        }
    });
}


function showSubActorTypeList() {
    if ($('#actorTypeTargetList').val()) {
        var parent_actor_type_data = $('#actorTypeTargetList').val();
    }
    if ($('#actorTypeSourceList').val()) {
        var parent_actor_type_data = $('#actorTypeSourceList').val();
    }
    parent_actor_type_data = JSON.parse(parent_actor_type_data);
    parent_actor_type_id = parent_actor_type_data.id.toString();

    var tableContent = '<option value="">--- Choose sub actor ---</option>';

    $.getJSON('/actortype/list?parentactortype=' + parent_actor_type_id, function(actorType) {
        if (actorType.length > 0) {
            $.each(actorType, function() {
                var value_stringify = feedOptionJsonValue(this);
                tableContent += "<option value='" + JSON.stringify(value_stringify) + "'>" + this.name + "</option>";
            });
        } 
        // if there is no child, duplicate the selected main actor type
        else {
            tableContent = $('#actorTypeTargetList option:selected').clone();
        }
        
        $('#actorTypeTargetListChild').html(tableContent);
        $('#actorTypeSourceListChild').html(tableContent);
        if ($('#actorTypeTargetListChild').attr('value')) {
            fillActorType($('#actorTypeTargetListChild').attr('value'), false);
        }
        //if ($('#actorTypeSourceListChild').attr('value')) {
        //    fillActorType($('#actorTypeSourceListChild').attr('value'), false);
        //}
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

function generateListElementView(ticket, ticket_url, isCondensed) {
    if (ticket.__t === 'NeedModel') {
        ticket_type = 'need';
    } else {
        ticket_type = 'offer';
    }
    ticket_url = ticket_url === undefined ? '/' + ticket_type + '/' + ticket._id : ticket_url;
    
    var content = '<tr>';
    
    // append main photo of the ticket
    if (isCondensed !== true) {
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
    }
    
    content += '<td>';
    
    content += '<p>';
    // append ticket title
    content += '<a class="list-ticket-title" href="' + ticket_url + '" title="' + ticket.name + '"><strong>' + cutName(ticket.name) + '</strong></a>';
    // append ticket class
    content += '&nbsp;<small class="display-classification" id="' + ticket.classification + '">' + ticket.classification_name + '</small>';
    content += '</p>';
    
    // append keywords
    if (isCondensed !== true && ticket.keywords !== undefined && ticket.keywords.length > 0) {
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
    
    // cost/budget and quantity
    if (ticket_type == 'need') {
        var priceKey = 'Budget';
        var priceValue = ticket.budget;
    } else {
        var priceKey = 'Cost';
        var priceValue = ticket.cost;
    }
    if (priceValue !== undefined || ticket.quantity !== undefined) {
        content += '<p>';
        
        // cost/budget
        if (priceValue !== undefined) {
            content += '<span><strong>' + priceKey + ': </strong>' + priceValue + '&euro;</span>&nbsp;';
        }
        
        // quantity
        if (ticket.quantity !== undefined) {
            content += '<span><strong>Quantity: </strong>' + ticket.quantity + '</span>';
        }
        
        content += '</p>'
    }
    
    // description
    if (isCondensed !== true) {
        content += '<p class="list-ticket-description"><strong>Description: </strong>' + cutDescription(ticket.description) + '</p>';
        content += '<small class="pull-right"><a href="' + ticket_url + '">More</a></small>';
    }
    
    content += '</td>';
    content += '</tr>';
    
    return content;
}

function populateTicketList(limit, offset, filters) {
    var ticket_types = ['need', 'offer'];
    for (var type_index=0; type_index<ticket_types.length; type_index++) {
        var ticket_type = ticket_types[type_index];
        var data = {};
        if (limit) {
            data.limit = limit;
        }
        if (offset) {
            data.offset = offset;
        }
        if (filters) {
            data.filters = filters;
        }
        var ticket_list_url = '/' + ticket_type + '/list';
        $.getJSON(ticket_list_url, data, function(tickets) {
            var tableContent = '';
            var haveContent = false;
            // check if there are tickets
            if (tickets.length > 0) {
                var ticketNames = [];
                $.each(tickets, function(i, ticket) {
                    if ($.inArray(ticket.name, ticketNames) === -1) {
                        tableContent += generateListElementView(ticket);
                        haveContent = true;
                        ticketNames.push(ticket.name);
                    }
                });
            }
            if (!haveContent) {
                tableContent += '<tr><td colspan="2"><em>No data.</em></td></tr>';
            }

            // ticket list dom
            var container = $('#' + parseUrl(this.url) + 'List');
            
            // display the list content
            $('table tbody', container).html(tableContent);
            showParentClassification();
            // toggle pager next
            if (tickets.length < limit) {
                $('#page-next', container).hide();
            } else {
                $('#page-next', container).show();
            }
            
            // toggle pager previous
            if (offset < limit) {
                $('#page-previous', container).hide();
            } else {
                $('#page-previous', container).show();
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

function adjustTicketShow() {
    var listHeight = $('#ticket-info-box').height() - 41 - 20 - 1;
    // console.log(listHeight);
    $('#matching_results_list').css('height', listHeight);
}


function showParentClassification() {
    var classification_id = $('.display-classification').attr('id');
    $.getJSON('/classification/' + classification_id, function(classification) {
        var text = '';
        text = classification.parent_name + ' - ' + classification.name;
        $('.display-classification').html(text);
    });
}


function showAuthorName() {
    var userId = $('#ticket_user').text();
    $.getJSON('/user/' + userId + '/profile', function(userProfile) {
        $('#ticket_user').text(userProfile.name);
    })
}

function showConvertedDate() {
    $.each($('.ticket-date'), function() {
        $(this).text($.format.date($(this).text(), "dd/MM/yyyy"));
    });
    $.each($('.input-date'), function() {
        $(this).val($.format.date($(this).val(), "dd/MM/yyyy"));
    });
}

function getAllCountryPhoneCodes() {
    var countryPhoneCodes = [33];
    $.getJSON('http://restcountries.eu/rest/v1/all', function(countries) {
        $.each(countries, function() {
            if ($(this)[0].callingCodes[0] !== '' && $(this)[0].callingCodes[0] !== '33') {
                countryPhoneCodes.push(parseInt($(this)[0].callingCodes[0]));
            }
        });
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

function feedOptionJsonValue(obj) {
    var value_stringify = {
        id: obj._id,
        name: obj.name
    }
    return value_stringify;
}

function makeOptionJsonValue(id, name) {
    var value_stringify = {
        id: id,
        name: name
    }
    return value_stringify;
}

$.fn.wrapInTag = function(opts) {
  var tag = opts.tag || 'strong'
    , words = opts.words || []
    , regex = RegExp(words.join('|'), 'gi') // case insensitive
    , replacement = '<'+ tag +'>$&</'+ tag +'>';

  return this.html(function() {
    return $(this).text().replace(regex, replacement);
  });
};
