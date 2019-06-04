import { Component, OnInit } from '@angular/core';

import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import OlView from 'ol/View';
import OlFeature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {DragBox, Select, DragAndDrop} from 'ol/interaction';
import {platformModifierKeyOnly} from 'ol/events/condition';
import VectorSource from 'ol/source/Vector';
import {Style, Stroke , Icon} from 'ol/style';
import { fromLonLat } from 'ol/proj';
import {defaults as defaultControls, OverviewMap} from 'ol/control';
import OSMXML from 'ol/format/OSMXML';
import {transformExtent} from 'ol/proj';
import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON';
import {Constants} from './business_types';
//import {SomeModule} from '../results/results.component';

/*
const markerStyle = new ol.style.Style({
image: new ol.style.Icon ({
anchor: [0.5, 46],
anchorXUnits: 'fraction',
anchorYUnits: 'pixels',
opacity: 0.75,
src: 'https://openlayers.org/en/v4.6.4/examples/data/icon.png'
}))
});
*/

import {
HttpClient,
HttpRequest,
HttpEvent,
HttpEventType
} from '@angular/common/http';

//const business_types: Array<any> =

function Business(name, email , phone , address) {
   this.name = name;
   this.email = email;
   this.phone = phone;
   this.address = address;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css','../../../node_modules/angular2-busy/build/style/busy.css'],
})



export class MapComponent implements OnInit {
  map: OlMap;
  source: OlXYZ;
  layer: OlTileLayer;
  view: OlView;
  suburbs: Array<any>;
  business_type: String = 'Restaurants';
  businesses: Array<any>;
  busy: any;
  suburbsstr : String;
  business_types: Array<any>;
  private count: number = 0;
  private markerVectorLayer ;


  constructor(private http: HttpClient){

  }


  ngOnInit() {
      this.business_types = (new Constants()).business_types;

      this.suburbs = [];
      this.businesses = [];
      this.source = new OlXYZ({
        url: 'http://tile.osm.org/{z}/{x}/{y}.png'
      });

      this.layer = new OlTileLayer({
        source: this.source
      });

      this.view = new OlView({
        center: fromLonLat([144.8905877 , -37.5944003]),
        zoom: 17,
        //bounds: [-125, 25, -65, 50]

      });
      //var x1 = this.getMarker()
      this.map = new OlMap({
        target: 'map',
        layers: [this.layer],
        view: this.view,
        controls: defaultControls()
      });

      var select = new Select();
      this.map.addInteraction(select);

      var selectedFeatures = select.getFeatures();

      // a DragBox interaction used to select features by drawing boxes
      var dragBox = new DragBox({
        condition: platformModifierKeyOnly,
      });

      this.map.addInteraction(dragBox);

      dragBox.on('boxend', (function()
      {
        var extent = dragBox.getGeometry().getExtent();
        var projection = this.layer.getSource().getProjection();
        this.suburbs = [];
        this.suburbsstr = '';
        this.get_cities(this, extent, projection);
      }).bind(this)
      );
  }

  private get_businesses() {
    let businesses_tmp : Array<any> = [];

    console.log(this.suburbs);
    var url = 'http://localhost:8080/postcodes?locations=' + this.suburbsstr + '&types=' +
                this.business_type +'&dummy=no';

    console.log(url);
    const req = new HttpRequest('GET', url, {
      reportProgress: true
    });

    this.busy = this.http.request(req).subscribe((event: HttpEvent<any>) => {
      switch (event.type) {
        case HttpEventType.Sent:
          console.log('Request sent!');
          break;
        case HttpEventType.ResponseHeader:
          console.log('Response header received!');
          break;
        case HttpEventType.DownloadProgress:
          const kbLoaded = Math.round(event.loaded / 1024);
          console.log(`Download in progress! ${ kbLoaded }Kb loaded`);
          break;
        case HttpEventType.Response:
          console.log('😺 Done!');
          var business_collection = event.body;
            //feature_collection = feature_collection.features;
            for (var business in business_collection)
            {
                 let bus = new Business(business_collection[business].name,
                                         business_collection[business].email,
                                        business_collection[business].phone,
                                        business_collection[business].address
                                        );
                 businesses_tmp.push(bus);
            }
            this.businesses = businesses_tmp;
            this.busy = 'Done';
      }
    });
  }

  private get_cities(mapComponent,extent,projection) {

     var epsg4326Extent = transformExtent(extent, projection, 'EPSG:4326');
     var url = 'https://services.land.vic.gov.au/catalogue/publicproxy/guest/dv_geoserver/wfs?'
                  + MapComponent.get_wfs(epsg4326Extent);
    const req = new HttpRequest('GET', url, {
      reportProgress: true
    });

    this.http.request(req).subscribe((event: HttpEvent<any>) => {
      switch (event.type) {
        case HttpEventType.Sent:
          console.log('Request sent!');
          break;
        case HttpEventType.ResponseHeader:
          console.log('Response header received!');
          break;
        case HttpEventType.DownloadProgress:
          const kbLoaded = Math.round(event.loaded / 1024);
          console.log(`Download in progress! ${ kbLoaded }Kb loaded`);
          break;
        case HttpEventType.Response:
          //console.log('😺 Done!', event.body);
          var feature_collection = event.body;
            feature_collection = feature_collection.features;
            for (var feature in feature_collection)
            {
                  if( feature_collection[feature] != null){
                      mapComponent.suburbs.push(feature_collection[feature].properties.POSTCODE);
                      mapComponent.suburbsstr = mapComponent.suburbsstr + ' ' +feature_collection[feature].properties.POSTCODE
                  }
            }
      }
    });
  }


  static get_wfs(epsg4326Extent){
      var query =  'SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=datavic:VMADMIN_POSTCODE_POLYGON&'
              + 'outputFormat=application/json&PROPERTYNAME=POSTCODE&BBOX='
              +  epsg4326Extent[0] + ',' + epsg4326Extent[1] + ',' +
              epsg4326Extent[2] + ',' + epsg4326Extent[3]
      return query;

  }


  static get_query(epsg4326Extent){
      var query = '(node' + '["place"="city"]' + '(' +
              epsg4326Extent[1] + ',' + epsg4326Extent[0] + ',' +
              epsg4326Extent[3] + ',' + epsg4326Extent[2] +
              ');rel(bn)->.foo;way(bn);node(w)->.foo;rel(bw););out ;';
      return query;
  }

  static get_query_test(epsg4326Extent){
      var query = '(node' + '["name"="City of Melbourne"]' + '(' +
              epsg4326Extent[1] + ',' + epsg4326Extent[0] + ',' +
              epsg4326Extent[3] + ',' + epsg4326Extent[2] +
              ');rel(bn)->.foo;way(bn);node(w)->.foo;rel(bw););out ;';
      return query;
  }


  private get_cities_xx(mapComponent) {
    var vectorSource = new VectorSource({
        format: new GeoJSON(),
        loader: function(extent, resolution, projection) {
          var epsg4326Extent = transformExtent(extent, projection, 'EPSG:4326');
          var client = new XMLHttpRequest();
          var url = 'https://services.land.vic.gov.au/catalogue/publicproxy/guest/dv_geoserver/wfs?'
                  + MapComponent.get_wfs(epsg4326Extent);
          client.open('GET', url);
          client.addEventListener('load', function() {
            var feature_collection = JSON.parse(client.responseText);
            feature_collection = feature_collection.features;
            for (var feature in feature_collection)
            {
                  if( feature_collection[feature] != null){
                      mapComponent.suburbs.push(feature_collection[feature].properties);
                  }
            }

          });
          client.send();
        },
        strategy: bboxStrategy
    });

   var vector = new VectorLayer({
        source: vectorSource,

      });


   this.map.addLayer(vector);
  }

 private getMarker(lon,lat) : VectorLayer
 {
    const markerStyle = new Style({
        image: new Icon( ({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          opacity: 0.75,
          src: '../../favicon.ico'
        }))
      });
    console.log('Inside the marker ' + lon + '  ' + lat)
    var marker = new OlFeature({
                          geometry: new Point(
                          fromLonLat([parseFloat(lon) , parseFloat(lat)])
                        ),
                      });

    var vectorSource = new VectorSource({
                          features: [marker]
                        });

    var markerVectorLayer = new VectorLayer({
                              source: vectorSource,
                              style: markerStyle,
                            });
    return markerVectorLayer;
 }
 private findLocation(mapcomponent,address) {
        //address = '9 Admiration Drive Craigieburn';
        fetch('http://nominatim.openstreetmap.org/search/' + address + '?format=json').then(function(response) {
          return response.json();
        }).then(function(json) {

          console.log(json[0].lon,json[0].lat);
          var markerVectorLayer = mapcomponent.getMarker(json[0].lon, json[0].lat)
          mapcomponent.map.removeLayer(mapcomponent.markerVectorLayer);
          mapcomponent.map.addLayer(markerVectorLayer);
          mapcomponent.markerVectorLayer = markerVectorLayer;
        })
  }

  displayAddress(event){
      console.log(event);
      this.findLocation(this,event);
  }

  private get_cities_osm() {
    var vectorSource = new VectorSource({
        format: new OSMXML(),
        loader: function(extent, resolution, projection) {
          var epsg4326Extent = transformExtent(extent, projection, 'EPSG:4326');
          var client = new XMLHttpRequest();
          client.open('POST', 'https://overpass-api.de/api/interpreter');
          client.addEventListener('load', function() {
            var features = new OSMXML().readFeatures(client.responseText, {
              featureProjection: 'this.map.getView().getProjection()'
            });
            vectorSource.addFeatures(features);
          });
          var query = MapComponent.get_query(epsg4326Extent);
          client.send(query);
        },
        strategy: bboxStrategy
    });
    var vector = new VectorLayer({
        source: vectorSource,
    });

   this.map.addLayer(vector);
  }



}

//http://services.land.vic.gov.au/catalogue/publicproxy/guest/dv_geoserver/wfs?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=datavic:VMADMIN_POSTCODE_POLYGON&BBOX=140.501%2C-39.137%2C150.068%2C-33.0
//http://services.land.vic.gov.au/catalogue/publicproxy/guest/dv_geoserver/wfs?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=datavic:VMADMIN_POSTCODE_POLYGON&BBOX=140.501%2C-34.137%2C141.068%2C-33.0
//http://services.land.vic.gov.au/catalogue/publicproxy/guest/dv_geoserver/wfs?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&TYPENAME=datavic:VMADMIN_POSTCODE_POLYGON&BBOX=140.501%2C-34.137%2C141.068%2C-33.0
//PROPERTYNAME=
