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

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {
  map: OlMap;
  source: OlXYZ;
  layer: OlTileLayer;
  view: OlView;

  ngOnInit() {
      this.source = new OlXYZ({
        url: 'http://tile.osm.org/{z}/{x}/{y}.png'
      });

      this.layer = new OlTileLayer({
        source: this.source
      });

      this.view = new OlView({
        center: fromLonLat([144.7751, -37.2744]),
        zoom: 9,
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
      dragBox.on('boxend', function() {
        var extent = dragBox.getGeometry().getExtent();
        console.log(extent);
      });


  }
////////////////////////////////////////

   /*var vectorSource = new VectorSource({
        format: new OSMXML(),
        loader: function(extent, resolution, projection) {
          var epsg4326Extent = transformExtent(extent, projection, 'EPSG:4326');
          var client = new XMLHttpRequest();
          client.open('POST', 'https://overpass-api.de/api/interpreter');
          client.addEventListener('load', function() {
            var features = new OSMXML().readFeatures(client.responseText, {
              featureProjection: this.map.getView().getProjection()
            });
            vectorSource.addFeatures(features);
          });
          var query = '(node(' +
              epsg4326Extent[1] + ',' + epsg4326Extent[0] + ',' +
              epsg4326Extent[3] + ',' + epsg4326Extent[2] +
              ');rel(bn)->.foo;way(bn);node(w)->.foo;rel(bw););out meta;';
          client.send(query);
        },
        strategy: bboxStrategy
   });*/

  private log(message) {
    console.log(message);
  }

//////////////////////////////

}
