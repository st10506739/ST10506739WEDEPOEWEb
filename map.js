var LOCATIONS = [
  { name: 'Johannesburg programme hub', area: 'Johannesburg, Gauteng', lat: -26.2041, lng: 28.0473 },
  { name: 'Durban programme hub', area: 'Durban, KwaZulu-Natal', lat: -29.8587, lng: 31.0218 },
  { name: 'Cape Town programme hub', area: 'Cape Town, Western Cape', lat: -33.9249, lng: 18.4241 }
];

document.addEventListener('DOMContentLoaded', function () {
  var mapEl = document.getElementById('map');
  if (!mapEl) return;

  if (typeof L === 'undefined') {
    mapEl.innerHTML = '<p class="map-note">The interactive map could not load. Please check your internet connection and refresh the page.</p>';
    return;
  }

  var map = L.map('map', { scrollWheelZoom: false }).setView([-29, 25], 5);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var buttonBox = document.getElementById('location-buttons');
  var bounds = [];

  LOCATIONS.forEach(function (loc) {
    var marker = L.marker([loc.lat, loc.lng]).addTo(map);
    var popup = document.createElement('div');
    var title = document.createElement('strong');
    title.textContent = loc.name;
    popup.append(title, document.createElement('br'), document.createTextNode(loc.area));
    marker.bindPopup(popup);
    bounds.push([loc.lat, loc.lng]);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--dark';
    btn.textContent = loc.area.split(',')[0];
    btn.addEventListener('click', function () {
      map.flyTo([loc.lat, loc.lng], 11, { duration: 1.2 });
      marker.openPopup();
    });
    buttonBox.appendChild(btn);
  });

  map.fitBounds(bounds, { padding: [40, 40] });
  var all = document.createElement('button');
  all.type = 'button';
  all.className = 'btn btn--ghost';
  all.textContent = 'Show all locations';
  all.addEventListener('click', function () { map.flyToBounds(bounds, { padding: [40, 40] }); });
  buttonBox.appendChild(all);
});
