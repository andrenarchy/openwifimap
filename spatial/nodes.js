function(doc) {
    if (doc.type=='node' && doc.longitude && doc.latitude) {
        emit(
                { type: "Point", coordinates: [doc.longitude, doc.latitude] }, 
                {
                    id: doc._id,
                    hostname: doc.hostname,
                    tags: doc.tags
                }
            );
    }
}
