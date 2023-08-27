(function() {
    //usamos el OR logico
    const lat = document.querySelector('#lat').value || -26.8319642;
    const lng = document.querySelector('#lng').value ||  -65.2075965;
    const mapa = L.map('mapa').setView([lat, lng ], 14);
    let marker;
    //utilizar provider y geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    //pin
    marker = new L.marker([lat,lng],{
        draggable:true,
        autoPan:true,
    })
    .addTo(mapa)

    //detectar el modiviento del pin
    marker.on("moveend",function(event){
        marker = event.target
        const posicion = marker.getLatLng()
        mapa.panTo(new L.LatLng(posicion.lat,posicion.lng)) //para centrar el mapa

        //obtenerinformacion de las calles
        geocodeService.reverse().latlng(posicion,14).run(function(error,resultado){

            marker.bindPopup(resultado.address.LongLabel)

            //llenar los campos
            document.querySelector(".calle").textContent = resultado?.address?.Address ?? '';
            document.querySelector("#calle").value = resultado?.address?.Address ?? '';
            document.querySelector("#lat").value = resultado?.latlng?.lat ?? '';
            document.querySelector("#lng").value = resultado?.latlng?.lng ?? '';

        })
    })

})()