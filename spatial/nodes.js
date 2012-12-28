function(doc) {
    if (doc.type=='node' && doc.longitude && doc.latitude) {
        var antennas = [];
        if (doc.interfaces) {
            for (var i=0; i<doc.interfaces.length; i++) {
                if (doc.interfaces[i].antenna) {
                    antennas.push({
                        direction: doc.interfaces[i].antenna.direction,
                        beamH: doc.interfaces[i].antenna.beamH
                    });
                }
            }
        }
        var neighbors = [];
        if (doc.neighbors) {
            for (var i=0; i<doc.neighbors.length; i++) {
                if (doc.neighbors[i].id) {
                    var neigh = { id: doc.neighbors[i].id };
                    if (doc.neighbors[i].quality) {
                       neigh["quality"] = doc.neighbors[i].quality;
                    }
                    neighbors.push(neigh);
                }
            }
        }
        emit(
                { type: "Point", coordinates: [doc.longitude, doc.latitude] }, 
                {
                    id: doc._id,
                    hostname: doc.hostname,
                    tags: doc.tags,
                    antennas: antennas,
                    neighbors: neighbors
                }
            );
    }
}
