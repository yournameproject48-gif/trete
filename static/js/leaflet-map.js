(function (window) {
  'use strict';
  var DEFAULT = {lat: 15.3694, lng: 44.1910};
  function valid(point) {
    return point && Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lng)) &&
      Number(point.lat) >= -90 && Number(point.lat) <= 90 && Number(point.lng) >= -180 && Number(point.lng) <= 180;
  }
  window.ServiceMarketplaceOfflineMap = function (element, options) {
    options = options || {};
    if (!element || !window.L) return null;
    var point = valid(options.initial) ? {lat: Number(options.initial.lat), lng: Number(options.initial.lng)} : DEFAULT;
    var map = element._serviceMarketplaceMap;
    if (!map) {
      map = L.map(element, {scrollWheelZoom: true}).setView([point.lat, point.lng], options.zoom || 13);
      var streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });
      var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19, attribution: 'Tiles &copy; Esri'
      });
      streets.addTo(map);
      L.control.layers({'الخريطة': streets, 'القمر الصناعي': satellite}, null, {position: 'topleft'}).addTo(map);
      element._serviceMarketplaceMap = map;
    } else map.setView([point.lat, point.lng], options.zoom || map.getZoom());
    var marker = element._serviceMarketplaceMarker;
    function change(latlng) {
      marker.setLatLng(latlng); map.panTo(latlng);
      if (typeof options.onChange === 'function') options.onChange({lat: latlng.lat, lng: latlng.lng});
    }
    if (!marker) { marker = L.marker([point.lat, point.lng], {draggable: !options.readonly}).addTo(map); element._serviceMarketplaceMarker = marker; }
    marker.dragging[options.readonly ? 'disable' : 'enable']();
    marker.setLatLng([point.lat, point.lng]);
    marker.off('dragend').on('dragend', function () { if (!options.readonly) change(marker.getLatLng()); });
    map.off('click'); if (!options.readonly) map.on('click', function (event) { change(event.latlng); });
    setTimeout(function () { map.invalidateSize(); }, 0);
    window.addEventListener('resize', function () { map.invalidateSize(); }, {once: true});
    return {map: map, marker: marker, placeMarker: function (next) { if (valid(next)) change(L.latLng(next.lat, next.lng)); }};
  };
}(window));
