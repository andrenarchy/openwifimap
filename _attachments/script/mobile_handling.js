//////////////////////////////////////////////////////////
// jquery mobile page + parameter handling

// this function is free software, Copyright (c) 2011, Kin Blas
// see https://github.com/jblas/jquery-mobile-plugins/blob/master/page-params/jqm.page.params.js
function queryStringToObject( qstr )
{
    var result = {},
    nvPairs = ( ( qstr || "" ).replace( /^\?/, "" ).split( /&/ ) ),
    i, pair, n, v;

    for ( i = 0; i < nvPairs.length; i++ ) {
        var pstr = nvPairs[ i ];
        if ( pstr ) {
            pair = pstr.split( /=/ );
            n = pair[ 0 ];
            v = pair[ 1 ];
            if ( result[ n ] === undefined ) {
                result[ n ] = v;
                } else {
                if ( typeof result[ n ] !== "object" ) {
                    result[ n ] = [ result[ n ] ];
                }
                result[ n ].push( v );
            }
        }
    }

    return result;
}

//////////////////////////////////////////////////////////
// general functions
function getPopupHTML(nodedata) {
    return ich.mappopupmust(nodedata, true);
}

// obj may be an object or a list
function scanListsObj(obj) {
    if (obj instanceof Array) {
        for (var i=0; i<obj.length; i++) {
            scanListsObj(obj[i]);
        }
        return obj.length>0
    }
    if (obj instanceof Object) {
        for (var key in obj) {
            var val = obj[key];
            if (scanListsObj(val)) {
                obj[String(key)+"?"] = true;
            }
        }
        return false;
    }
}

//////////////////////////////////////////////////////////
// map page
var mappagemap = null;
var position;

function getBBOXfromString(str) {
    arr = str.split(',')
    if ( arr.length >= 4 ) {
        valid = true;
        for ( i = 0; i < 4; i++ ) {
            arr[i] = parseFloat(arr[i]);
            valid = valid ? isFinite(arr[i]) : false;
        }
    }
    arr = [[arr[1],arr[0]],[arr[3],arr[2]]];
    return valid ? arr : null;
}

function mappageOnBboxChange(bboxstr) {
    var currentPageID = $.mobile.activePage == null ? 'map' : $.mobile.activePage.attr('id');
    if (currentPageID=='map') {
        params.sethash( '#map?bbox=' + bboxstr );
        $("a#listlink").attr('href', '#list?bbox=' + bboxstr);
    }
}

nodecache = { bboxstr: null, nodes: [] };
function mappageOnNodeUpdate(bboxstr, nodes) {
    nodecache.bboxstr = bboxstr;
    nodecache.nodes = nodes;
    $("a#listlink .ui-btn-text").text("List (" + nodes.length + ")" );
}

function mappagemapResize() {
    if (mappagemap) {
        //params.ignoreNextHashChange = true;
        mappagemap.map.invalidateSize();
    }
}

$(document).on('pageshow', '#map', function() {
    var bbox = null;
    if ($.mobile.pageData && $.mobile.pageData.bbox && typeof $.mobile.pageData.bbox == "string") {
        bbox = getBBOXfromString($.mobile.pageData.bbox);
    }

    if (!mappagemap) {
        mappagemap = new mapwidget('mapdiv', getPopupHTML, mappageOnBboxChange, mappageOnNodeUpdate);
        if (!bbox) {
            mappagemap.map.locate({setView: true, maxZoom: 15});
        }
    }

    if (bbox) {
        /*
        // nasty hack: shrink the bbox a bit, so we don't zoom out
        w = bbox[1][1] - bbox[0][1];
        h = bbox[1][0] - bbox[0][0];
        eps = 0.1;
        bbox[0][1] += eps*w;
        bbox[1][1] -= eps*w;
        bbox[0][0] += eps*h;
        bbox[1][0] -= eps*h;
        */
        // might zoom out a bit without nasty hack ;)
        mappagemapResize();
        //params.ignoreNextHashChange = true;
        var zoom = mappagemap.map.getBoundsZoom(bbox, true);
        mappagemap.map.setView(L.latLngBounds(bbox).getCenter(), zoom);
    }
})

$(window).on("pageshow resize", mappagemapResize);


//////////////////////////////////////////////////////////
// list page
function listUpdate(data) {
    $("#listdiv").empty().append( ich.listmust(data) );
    var listul = $("#listul");
    if (listul.hasClass('ui-listview')) {
        listul.listview('refresh');
    } else {
        listul.listview();
    }
}

$(document).on('pagebeforeshow', '#list', function (){
    bboxstr = null;
    if ($.mobile.pageData && $.mobile.pageData.bbox && typeof $.mobile.pageData.bbox == "string") {
        bboxstr = $.mobile.pageData.bbox;
    }
    if (bboxstr) {
        $("a#maplink").attr("href", "#map?bbox=" + bboxstr);
        if (bboxstr == nodecache.bboxstr) {
            listUpdate(nodecache);
        } else {
            $.getJSON('_spatial/nodes_essentials', { "bbox": bboxstr }, function(data) {
                var nodes = [];
                for (var i=0; i<data.rows.length; i++) {
                    nodes.push(data.rows[i].value);
                }
                listUpdate({bboxstr: bboxstr, nodes: nodes});
                });
        }
    } else {
        $("#listdiv").empty().append("<p>No area selected! Go to the <a href=\"#map\">map</a> to select an area.</p>");
    }
});

//////////////////////////////////////////////////////////
// detail page
var detailpagemap = null;
var datapending = true;

function detailmapResize() {
    var map = $("#detailmap");
    width = ( $(document).width() < 500 ) ? '100%' : '50%';
    $('#detailmapcontainer').css('width', width);
    $('#detailaddrcontainer').css('width', width);
    map.height( map.width()*0.8 );
    if (detailpagemap) {
        detailpagemap.map.invalidateSize();
    }
}

$(window).on("pageshow resize", detailmapResize);

$(document).on('pagebeforeshow', '#detail', function () {
    var bboxstr = null;
    if ($.mobile.pageData && $.mobile.pageData.bbox && typeof $.mobile.pageData.bbox == "string") {
        bboxstr = $.mobile.pageData.bbox;
    }
    if (bboxstr) {
        $("a#detailback").attr("href", "#list?bbox=" + bboxstr );
        $("a#detailback .ui-btn-text").text("List");
    } else {
        $("a#detailback").attr("href", "#map" );
        $("a#detailback .ui-btn-text").text("Map");
    }

    node = null;
    if ($.mobile.pageData && $.mobile.pageData.node && (typeof $.mobile.pageData.node == "string")) {
        node = $.mobile.pageData.node;
    }
    if (node) {
        $.getJSON('/openwifimap/' + node, {}, function(data) {
                mapdiv = null;
                if (detailpagemap) {
                    mapdiv = $("#detailmap").detach();
                }
                // i can haz detailed data?
                scanListsObj(data);
                $("#detaildiv").empty().append( ich.detailmust(data) ).trigger('create');

                // i can haz avatar?
                var avatarurl = null;
                if (data._attachments) {
                    Object.keys(data._attachments).forEach( function(key) {
                        // limit avatars to 150kB
                        if ( (/^avatar\.(png|jpg)$/).test(key) && data._attachments[key].length<150000) {
                            avatarurl = "/openwifimap/" + data._id + "/" + key;
                        }
                    });
                }
                if (avatarurl) {
                    $("#avaframe").empty().append( '<img id="avatar" src="' + avatarurl + '" />' );
                }

                if (!detailpagemap) {
                    detailpagemap = new mapwidget('detailmap', getPopupHTML);
                } else {
                    $("#detailmapcontainer").empty().append(mapdiv);
                }
                detailmapResize();
                detailpagemap.map.setView([data.latitude,data.longitude], 16);
                $("#detailmapcenter").click( function () {
                    detailpagemap.map.setView([data.latitude,data.longitude], 16);
                });
            });
    } else {
        $("#detaildiv").empty().append("<p>No node selected! Go to the <a href=\"#map\">map</a> to select an area.</p>");
    }
});

