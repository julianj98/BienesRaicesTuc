/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/mapa.js":
/*!************************!*\
  !*** ./src/js/mapa.js ***!
  \************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n(function() {\r\n    //usamos el OR logico\r\n    const lat = document.querySelector('#lat').value || -26.8319642;\r\n    const lng = document.querySelector('#lng').value ||  -65.2075965;\r\n    const mapa = L.map('mapa').setView([lat, lng ], 14);\r\n    let marker;\r\n    //utilizar provider y geocoder\r\n    const geocodeService = L.esri.Geocoding.geocodeService();\r\n    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {\r\n        attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'\r\n    }).addTo(mapa);\r\n\r\n    //pin\r\n    marker = new L.marker([lat,lng],{\r\n        draggable:true, // para mover el pin\r\n        autoPan:true, // para centrar el mapa\r\n    })\r\n    .addTo(mapa)\r\n\r\n    //detectar el modiviento del pin\r\n    marker.on(\"moveend\",function(event){\r\n        marker = event.target\r\n        const posicion = marker.getLatLng()\r\n        mapa.panTo(new L.LatLng(posicion.lat,posicion.lng)) //para centrar el mapa\r\n\r\n        //obtener informacion de las calles\r\n        geocodeService.reverse().latlng(posicion,14).run(function(error,resultado){\r\n\r\n            marker.bindPopup(resultado.address.LongLabel)\r\n\r\n            //llenar los campos\r\n            document.querySelector(\".calle\").textContent = resultado?.address?.Address ?? '';\r\n            document.querySelector(\"#calle\").value = resultado?.address?.Address ?? '';\r\n            document.querySelector(\"#lat\").value = resultado?.latlng?.lat ?? '';\r\n            document.querySelector(\"#lng\").value = resultado?.latlng?.lng ?? '';\r\n\r\n        })\r\n    })\r\n\r\n})()\n\n//# sourceURL=webpack://finalweb/./src/js/mapa.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/js/mapa.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;