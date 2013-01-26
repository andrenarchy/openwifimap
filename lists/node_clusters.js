function(head, req) {
    var g = require('vendor/clustering/ProximityCluster'),
        row,
        threshold = 100;

    start({"headers":{"Content-Type" : "application/json"}});
    
    if('threshold' in req.query) { 
        threshold = req.query.threshold;
    }
    // threshold in km
    var pc = new g.PointCluster(parseFloat(threshold));

    while (row = getRow()) {
        pc.addToClosestCluster({"geometry": row.geometry});
    }

    send(JSON.stringify({"clusters": pc.getClusters()}));
}
