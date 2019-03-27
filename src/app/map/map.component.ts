import { Component, OnInit } from '@angular/core';

import OlMap from 'ol/Map';
import OlXYZ from 'ol/source/XYZ';
import OlTileLayer from 'ol/layer/Tile';
import OlView from 'ol/View';
import {DragBox, Select, DragAndDrop} from 'ol/interaction';
import {platformModifierKeyOnly} from 'ol/events/condition';
import VectorSource from 'ol/source/Vector';
import {Style, Stroke} from 'ol/style';
import { fromLonLat } from 'ol/proj';
import {defaults as defaultControls, OverviewMap} from 'ol/control';
import OSMXML from 'ol/format/OSMXML';
import {transformExtent} from 'ol/proj';
import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON';
//import {SomeModule} from '../results/results.component';

import {
HttpClient,
HttpRequest,
HttpEvent,
HttpEventType
} from '@angular/common/http';


function Business(name, email , phone , address) {
   this.name = name;
   this.email = email;
   this.phone = phone;
   this.address = address;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})



export class MapComponent implements OnInit {
  map: OlMap;
  source: OlXYZ;
  layer: OlTileLayer;
  view: OlView;
  suburbs: Array<any>;
  business_type: String = 'Restuarents';
  businesses: Array<any>;
  constructor(private http: HttpClient){

  }

  ngOnInit() {
      this.suburbs = [];
      this.businesses = [];
      this.source = new OlXYZ({
        url: 'http://tile.osm.org/{z}/{x}/{y}.png'
      });

      this.layer = new OlTileLayer({
        source: this.source
      });

      this.view = new OlView({
        center: fromLonLat([144.7751, -37.6744]),
        zoom: 14,
        //bounds: [-125, 25, -65, 50]

      });

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

      dragBox.on('boxend', (function() {
        var extent = dragBox.getGeometry().getExtent();
        var projection = this.layer.getSource().getProjection();
        this.suburbs = [];
        //this.businesses = [];
        this.get_cities(this, extent, projection);
      }).bind(this)
      );
  }

  private get_businesses1(){
    let bus = new Business('name1','email1','phone1','address1');
    console.log(this.businesses);
    this.businesses.push(bus);
  }

  private get_businesses() {
    this.businesses = [];
    var url = 'http://localhost:8080/postcodes?locations=' + this.suburbs.join() + '&types=' +
                this.business_type;

    console.log(url);
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
                 this.businesses.push(bus);
            }
            console.log(this.businesses)
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
          console.log('😺 Done!', event.body);
          var feature_collection = event.body;
            feature_collection = feature_collection.features;
            for (var feature in feature_collection)
            {
                  if( feature_collection[feature] != null){
                      console.log(feature_collection[feature].properties.POSTCODE);
                      mapComponent.suburbs.push(feature_collection[feature].properties.POSTCODE);
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
      console.log(query);
      return query;
  }

  static get_query_test(epsg4326Extent){
      var query = '(node' + '["name"="City of Melbourne"]' + '(' +
              epsg4326Extent[1] + ',' + epsg4326Extent[0] + ',' +
              epsg4326Extent[3] + ',' + epsg4326Extent[2] +
              ');rel(bn)->.foo;way(bn);node(w)->.foo;rel(bw););out ;';
      console.log(query);
      return query;
  }


  private get_cities_xx(mapComponent) {
    console.log('send--1');

    var vectorSource = new VectorSource({
        format: new GeoJSON(),
        loader: function(extent, resolution, projection) {
          console.log(projection);
          var epsg4326Extent = transformExtent(extent, projection, 'EPSG:4326');
          var client = new XMLHttpRequest();
          var url = 'https://services.land.vic.gov.au/catalogue/publicproxy/guest/dv_geoserver/wfs?'
                  + MapComponent.get_wfs(epsg4326Extent);
          client.open('GET', url);
          client.addEventListener('load', function() {
            console.log(client.responseText);
            var feature_collection = JSON.parse(client.responseText);
            feature_collection = feature_collection.features;
            for (var feature in feature_collection)
            {
                  if( feature_collection[feature] != null){
                      console.log(feature_collection[feature].properties.POSTCODE);
                      mapComponent.suburbs.push(feature_collection[feature].properties);
                  }
            }
            //console.log('send ');
            //client.send();
          });
          console.log('send ');
          client.send();
        },
        strategy: bboxStrategy
    });

   var vector = new VectorLayer({
        source: vectorSource,

      });


   this.map.addLayer(vector);
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
