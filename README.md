# openwifimap

map for WiFi router (freifunk and perhaps others, too!)

# Installation

openwifimap is a [couchapp](http://couchapp.org/page/index) and thus relies on [CouchDB](http://couchdb.apache.org/). To deploy openwifimap you have to clone the repository and carry out these steps:

* **Step 1:** `couchapp push http://user:passwd@your-couchdb:port/openwifimap`
* **Step 2:** there is no step 2 (remember: this is a couchapp)! Visit your site at `http://your-couchdb:port/openwifimap/_design/openwifimap/index.html`

To make URLs nicer you can use CouchDB URL rewrites. If your CouchDB is accessed via the hostname `myhost.net` you have to insert the following section into your CouchDB configuration:
* section: `vhosts`
* option: `myhost.net`
* value: `/openwifimap/_design/openwifimap/_rewrite`

# License
openwifimap is licensed under the [MIT license](http://opensource.org/licenses/MIT).
