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
## Documentation of JSON format for nodes
### Example of required fields
We all love documentation by example, so here is one. There are a few required fields in a node document. 
This is a node document that would result in an icon on the map:
```javascript
{
  "_id": "a4d15a897f851938a799e548cc000eb0",
  "_rev": "22-95f616b25babe186cef05c744657b894",
  "type": "node",                       // required: tells couchDB that this is a node
  "hostname": "myhostname",             // required: hostname == display name
  "longitude": 13.40951,                // required: longitude in degrees, range [-90,90], EPSG:3857
  "latitude": 52.520791,                // required: latitude in degrees, range [-180,180], EPSG:3857
  "lastupdate": "2013-01-12T12:30:12Z", // required: timestamp of last update in UTC
}
```
### Example of optional fields
```javascript
{
  // *************************************
  // insert all of the above example here!
  // *************************************
  "created": "2013-01-06T01:33:52Z",    // timestamp of creation in UTC
  "height": 10,                         // height in meters above ground
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
    "url": "https://firmwar.ez/"
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
