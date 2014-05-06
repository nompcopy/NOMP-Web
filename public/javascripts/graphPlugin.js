if (document.querySelector('#graph-canvas')) {
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