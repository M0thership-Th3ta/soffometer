window.addEventListener('load', init);

// globals

function init() {
    let map = L.map('map', {
        attributionControl: false,
        maxBounds: [[0, 0], [2048, 2048]],
        minZoom: 0,
        maxZoom: 0,
        crs: L.CRS.Simple,
        preferCanvas: true,
        center: [1024, 1024],
        zoom: 0,
        zoomControl: false,
    });

    L.tileLayer('../images/posts/mint_easter.png', {
        tileSize: 2048,
        noWrap: true,
        maxZoom: 0,
    }).addTo(map);

    L.marker([1445, 1176]).addTo(map)
        .bindPopup('A Minty snoot.<br> Easily boopable.')

    L.marker([1190, 1016]).addTo(map)
        .bindPopup('Snack compartment.<br> Can contain many snacks.')

    // Create a sidebar element
    const sidebar = document.createElement('div');
    sidebar.id = 'sidebar';
    sidebar.style.position = 'absolute';
    sidebar.style.top = '10px';
    sidebar.style.right = '10px';
    sidebar.style.padding = '10px';
    sidebar.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    sidebar.style.border = '1px solid #ccc';
    sidebar.style.borderRadius = '4px';
    sidebar.style.zIndex = '1000';
    sidebar.innerText = 'Hover over the map to see coordinates';

    // Append the sidebar to the map container
    map.getContainer().appendChild(sidebar);

    // Update sidebar with coordinates on mousemove
    map.on('mousemove', function (e) {
        const { lat, lng } = e.latlng;
        sidebar.innerText = `Coordinates: Lat ${lat.toFixed(2)}, Lng ${lng.toFixed(2)}`;
    });
}