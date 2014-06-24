$(document.body).on('click', '#graph-reset', displayGraph);

if (document.querySelector('#graph-canvas')) {
    displayGraph();
}

function displayGraph () {
    $.getJSON('/matching/list', {graph: true}, function(data) {
        var sig = new sigma({
            graph: data,
            container: 'graph-canvas',
            settings: {
                defaultNodeColor: '#ec5148'
            }
        });
        
    });
}