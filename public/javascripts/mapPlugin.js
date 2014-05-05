if (document.querySelector("#map-canvas")) {
    var map;
    var markers = {};
    var infowindows = {};
    
    initializeMap();
    markTickets();
}

function initializeMap() {
    var mapOptions = {
        zoom: 8,
        center: new google.maps.LatLng(48.3, 4.08333)
    };
    if (document.querySelector("#map-canvas")) {
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    }
}

function markTickets() {
    if (map === undefined) {
        return;
    }
    
    if (geocoder === undefined) {
        geocoder = new google.maps.Geocoder();
    }
    
    // custom mark icons
    var pin_images = {};
    
    // get list of data in json of need/offer and mark them on map with info box
    $.each(['need', 'offer'], function(i, ticket_type) {
    
        var pin_url = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|";
        if (ticket_type === 'need') {
            var pin_color = 'FE7569';
        } else {
            var pin_color = '01DF01';
        }
        pin_images[ticket_type] = new google.maps.MarkerImage(pin_url + pin_color,
            new google.maps.Size(25, 36),
            new google.maps.Point(0,0),
            new google.maps.Point(10, 36)
        );

        // retrieve data from REST api
        var ticket_list_url = '/' + ticket_type + '/list';
        $.getJSON(ticket_list_url, {}, function(tickets) {
            $.each(tickets, function(i, ticket) {
                // Use directly geometry
                var lat = ticket.geometry.lat;
                var lng = ticket.geometry.lng;

                if (markers[ticket_type] === undefined) {
                    markers[ticket_type] = {};
                }
                
                // mark the ticket
                markers[ticket_type][ticket._id] = new google.maps.Marker({
                    position: new google.maps.LatLng(lat, lng),
                    map: map,
                    title: ticket.name,
                    icon: pin_images[ticket_type]
                });

                if (infowindows[ticket_type] === undefined) {
                    infowindows[ticket_type] = {};
                }

                // create an info window of the ticket
                infowindows[ticket_type][ticket._id] = new google.maps.InfoWindow({
                    content: '<table class="table table-condensed table-info-window">' + generateListElementView(ticket) + '</table>'
                });

                // associate the info window with the mark on click
                google.maps.event.addListener(markers[ticket_type][ticket._id], 'click', function() {
                    infowindows[ticket_type][ticket._id].open(map, markers[ticket_type][ticket._id]);
                });
            })
        });
    });
}