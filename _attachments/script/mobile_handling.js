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

function parseHashSearchUrl(url) {
    var loc = $.mobile.path.parseUrl( url );
    var ret = {
        hrefnosearch: loc.hrefNoSearch,
        hash: loc.hash.replace( /^#/, ""),
        search: loc.search
    };
    if (ret.hash) {
        loc = $.mobile.path.parseUrl( ret.hash );
        ret.hash = loc.pathname;
        ret.search = loc.search;
    }
    return ret;
}

var firstPage = true;
var ignoreNextHashChange = false;
var defaultPage = "map";
$( document ).bind( "pagebeforechange", function( e, data ) {
    var hs;
    if (firstPage) {
        hs = parseHashSearchUrl(window.location.href);
    } else if (typeof data.toPage === "string") {
        hs = parseHashSearchUrl( data.toPage );
    } else {
        return;
    }

    firstPage=false;
    if (!data.options.dataUrl) {
        data.options.dataUrl = data.toPage;
    }

    data.toPage = hs.hrefnosearch + "#" + hs.hash;
    if (hs.search) {
        data.options.pageData = queryStringToObject( hs.search );
    }

    $.mobile.activePageData = (data && data.options && data.options.pageData)
        ? data.options.pageData
        : null;
    ignoreNextHashChange = true;
});

$( window ).bind( "hashchange", function( e ) {
    if (!ignoreNextHashChange) {
        $.mobile.changePage( $.mobile.path.parseLocation().hash , {
            allowSamePageTransition: true,
            transition: "none"
        });
    }
    ignoreNextHashChange = false;
});

//////////////////////////////////////////////////////////
// general functions
function getPopupHTML(nodedata) {
    return ich.mappopupmust(nodedata, true);
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
    var currentPageID = $.mobile.activePage == null ? defaultPage : $.mobile.activePage.attr('id');
    if (currentPageID=="map") {
        ignoreNextHashChange = true;
        window.location.hash = "#map?bbox=" + bboxstr;
        $("a#listlink").attr("href", "#list?bbox=" + bboxstr);
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
        ignoreNextHashChange = true;
        mappagemap.map.invalidateSize();
    }
}

$('#map').live('pageshow', function() {
    var bbox = null;
    if ($.mobile.activePageData && $.mobile.activePageData.bbox && typeof $.mobile.activePageData.bbox == "string") {
        bbox = getBBOXfromString($.mobile.activePageData.bbox);
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
        w = bbox.getWidth();
        h = bbox.getHeight();
        eps = 0.01;
        bbox.left += eps*w;
        bbox.right -= eps*w;
        bbox.bottom += eps*h;
        bbox.top -= eps*h;
        */

        // might zoom out a bit without nasty hack ;)
        mappagemapResize();
        ignoreNextHashChange = true;
        mappagemap.map.fitBounds(bbox);
    }
});

$(window).bind("pageshow resize", mappagemapResize);


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

$('#list').live('pagebeforeshow', function (){
    bboxstr = null;
    if ($.mobile.activePageData && $.mobile.activePageData.bbox && typeof $.mobile.activePageData.bbox == "string") {
        bboxstr = $.mobile.activePageData.bbox;
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
    map.height( map.width()*0.5 );
    if (detailpagemap) {
        detailpagemap.map.invalidateSize();
    }
}

$(window).bind("pageshow resize", detailmapResize);

$('#detail').live('pagebeforeshow', function (){
    var bboxstr = null;
    if ($.mobile.activePageData && $.mobile.activePageData.bbox && typeof $.mobile.activePageData.bbox == "string") {
        bboxstr = $.mobile.activePageData.bbox;
    }
    if (bboxstr) {
        $("a#detailback").attr("href", "#list?bbox=" + bboxstr );
        $("a#detailback .ui-btn-text").text("List");
    } else {
        $("a#detailback").attr("href", "#map" );
        $("a#detailback .ui-btn-text").text("Map");
    }

    node = null;
    if ($.mobile.activePageData && $.mobile.activePageData.node && (typeof $.mobile.activePageData.node == "string")) {
        node = $.mobile.activePageData.node;
    }
    if (node) {
        $.getJSON('/openwifimap/' + node, {}, function(data) {
                mapdiv = null;
                if (detailpagemap) {
                    mapdiv = $("#detailmap").detach();
                }
                // i can haz detailed data?
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

