# openwifimap

A map for free network WiFi routers (freifunk and perhaps others, too!). Visit the instance running at [openwifimap.net](http://openwifimap.net). If you want to include the map in your website, consider using the standalone map at [openwifimap.net/map.html](http://openwifimap.net/map.html) (e.g. in an iframe).

# Installation

openwifimap is a [couchapp](http://couchapp.org/page/index) and thus relies on [CouchDB](http://couchdb.apache.org/). Beside CouchDB, the only dependency is the spatial extension [GeoCouch](https://github.com/couchbase/geocouch/) (which is available in popular CouchDB instances such as [Iris Couch](http://www.iriscouch.com/)). To deploy openwifimap you have to clone the repository and carry out these steps:

* **Step 1:** `couchapp push http://user:passwd@your-couchdb:port/openwifimap`
* **Step 2:** there is no step 2 (remember: this is a couchapp)! Visit your site at `http://your-couchdb:port/openwifimap/_design/openwifimap/index.html`

To make URLs nicer you can use CouchDB URL rewrites. If your CouchDB is accessed via the hostname `myhost.net` you have to insert the following section into your CouchDB configuration:
* section: `vhosts`
* option: `myhost.net`
* value: `/openwifimap/_design/openwifimap/_rewrite`

# Developers corner
## Documentation of node documents
Each node **must update its data at least once a day**. If a node is not updated for several days it is considered to be offline and removed from the map. 

### Required fields
We all love documentation by example, so here is one. There are a few required fields in a node document. This is a node document that would result in an icon on the map:
```javascript
{
  "_id": "a4d15a897f851938a799e548cc000eb0",
  "_rev": "22-95f616b25babe186cef05c744657b894",
  "type": "node",                       // required: tells couchDB that this is a node
  "hostname": "myhostname",             // required: hostname == display name
  "longitude": 13.40951,                // required: longitude in degrees, range [-90,90], EPSG:3857
  "latitude": 52.520791,                // required: latitude in degrees, range [-180,180], EPSG:3857
  "lastupdate": "2013-01-12T12:30:12Z"  // required: timestamp of last update in UTC
}
```
### Optional fields
While nothing is wrong with only pushing the required fields, you probably want to provide further information about the node. There are several fields that are recognized by the openwifimap couchapp, while you can add *any* other information about your node. Just make sure that you provide valid JSON and use the recognized fields correctly.

#### Neighbors
The ```neighbors``` field's value should be a list of neighbor nodes. Links between neighbors will be shown as lines in the map. The quality field is required for each field.
```javascript
  "neighbors": [
    {
      "id": "a4d15a897f851938a799e548cc0017e7",  // document id of the neighbor node
      "quality": 1                               // quality of the link, range [0,1], 0==no link, 1==perfect link
    },
    {
      "id": "host2",
      "quality": 0.39016
    }
  ]
```
You can provide additional fields in neighbor objects, for example the used routing protocol and its parameters in a mesh network (such as [OLSR](http://en.wikipedia.org/wiki/Optimized_Link_State_Routing_Protocol) in some [freifunk](http://en.wikipedia.org/wiki/Freifunk) networks):
```javascript
  "neighbors": [
    {
      "id": "host2",
      "quality": 0.39016,                 // for olsr, 1/etx could be used
      "olsr_ipv4": {                      // additional data
        "local_ip": "104.201.1.1",
        "neighbor_ip": "104.201.1.18",
        "lq": 0.533,
        "nlq": 0.732,
        "etx": 2.5631
      },
      "olsr_ipv6": {                      // additional data
        "local_ip": "2002:4e35:28e7:bd9d::1",
        "neighbor_ip": "2002:4e35:28e7:be2c::1",
        "lq": 0.533,
        "nlq": 0.732,
        "etx": 2.5631
      },
    }
  ]
```
```javascript
{
  // *******************************************
  // insert all required fields here (see above)
  // *******************************************
  "created": "2013-01-06T01:33:52Z",    // timestamp of creation in UTC
  "height": 15.5,                       // height in meters above ground level
  "indoor": true,                       // is this node mounted indoors?
  "address": {
    "street": "Alexanderplatz 1",
    "zip": "10178",
    "city": "Berlin",
    "country": "Germany"
  },
  "firmware": {
    "name": "openwrt",
    "revision": "r1234",
    "url": "http://firmware.pberg.freifunk.net/attitude_adjustment/12.09/ar71xx/openwrt-ar71xx-generic-ubnt-bullet-m-squashfs-factory.bin",
    "installed_packages": [ "olsrd", "dnsmasq", "kmod-ath9k" ]
  },
  "hardware": {
    "manufacturer": "Ubiquiti",
    "model": "Bullet M2"
    "revision": "3.5",
    "antenna": "IT ELITE PAT24014",
    "powersupply": "Ubiquiti PoE 24V"
  },
  "interfaces": [
    {
      "name": "eth0",
      "type": "ethernet",
      "macAddress": "00:66:77:88:99:AA",
      "maxBitrateDown": 100,
      "maxBitrateUp": 100,
      "ipv4Addresses": [
        "104.201.0.29/28"
        ],
      "ipv6Addresses": [
        "dead:beef::2/56",
      "0455:dead::1235/64"
        ]
    },
    {
      "name": "wlan0",
      "type": "wifi",
      "macAddress": "00:77:88:66:44:66",
      "maxBitrateDown": 500,
      "maxBitrateUp": 500,
      "ipv4Addresses": [
        "104.201.1.29/8"
      ],
      "ipv6Addresses": [
        "dead:beef:1:1/56",
        "0455:dead:1:1234/64"
      ],
      "essid": "olsr.freifunk.net",
      "bssid": "00:CA:FF:EE:BA:BE",
      "channel": 10,
      "wifiStandard": "802.11n",
      "mode": "adhoc",
      "encryption": "none",
      "chipName": "AR9100",
      "driverName": "ath9k",
      "driverRevision": "a59d8e5f8f13ede04e7c570bb4c9460d84a32562",
      "txpower": 15,
      "antenna": {
        "gain": 5,
        "isbuiltin": false,
        "type": "directed",
        "direction": 127,
        "tilt": -12.3,
        "beamH": 35,
        "beamV": 17,
        "polarization": "vertical"
      },
      "access": "open",
      "accessNote": "free as in freedom!"
    },
    {
      "name": "wlan1",
      "type": "wifi",
      "essid": "liebknecht.freifunk.net",
      "mode": "ap",
      "dhcpSubnet": "104.201.111.1/28",
      "radvdPrefixes": [
        "1234:5678::/64"
      ],
      "antenna": {
        "gain": 5,
        "isbuiltin": false,
        "type": "directed",
        "direction": 310,
        "tilt": -12.3,
        "beamH": 120,
        "beamV": 17,
        "polarization": "vertical"
      }
    },
    {
      "name": "ppp0",
      "type": "ethernet",
      "maxBitrateDown": 16000,
      "maxBitrateUp": 1024,
      "providesUplink": true
    }
  ],
  "updateInterval": 600,
  "ipv4defaultGateway": "104.201.0.33",
  "ipv6defaultGateway": "dead:1337::1",
  "tags": [
    "Berlin",
    "freifunk",
    "Kreuzberg"
  ],
  "neighbors": [
    {
      "id": "a4d15a897f851938a799e548cc0017e7",
      "quality": 1
    },
    {
      "id": "blaaa",
      "quality": 0.1
    }
  ],
  "_attachments": {
    "avatar.jpg": {
      "content_type": "image/jpeg",
      "revpos": 9,
      "digest": "md5-s3yeZmYBgM4+UxbaNvQlsw==",
      "length": 84923,
      "stub": true
    }
  }
}
```

# License
openwifimap is licensed under the [MIT license](http://opensource.org/licenses/MIT).
