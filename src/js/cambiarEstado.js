(function () {
    const cambiarEstadoBotones = document.querySelectorAll('.cambiar-estado');
    const token = document.querySelector("meta[name='csrf-token']").getAttribute('content');

    cambiarEstadoBotones.forEach(boton => {
        boton.addEventListener('click', mostrarModalConfirmacion);
    });

    async function mostrarModalConfirmacion(e) {
        const confirmacion = await Swal.fire({
            title: "Confirmación de cambio de estado",
            text: "¿Estás seguro de cambiar el estado de esta propiedad?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#36b9cc",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, cambiar estado",
            cancelButtonText: "Cancelar",
        });

        if (confirmacion.isConfirmed) {
            cambiarEstadoPropiedad(e);
        }
    }

    async function cambiarEstadoPropiedad(e) {
        const { propiedadId: id } = e.target.dataset;

        try {
            const url = `/propiedades/${id}`;
            const respuesta = await fetch(url, {
                method: 'PUT',
                headers: {
                    'CSRF-Token': token
                }
            });

            const { resultado } = await respuesta.json();
            if (resultado) {
                // Mostrar el modal de éxito
                Swal.fire({
                    title: "Cambio de estado exitoso",
                    text: "El estado de la propiedad ha sido cambiado con éxito.",
                    icon: "success",
                    showCancelButton: false,
                    confirmButtonText: "OK"
                });

                // Actualizar el botón y realizar otros cambios visuales
                actualizarBotonEstado(e);
            }
        } catch (error) {
            console.log(error);
            // Mostrar el modal de error
            Swal.fire({
                title: "Error",
                text: "Hubo un error al cambiar el estado de la propiedad.",
                icon: "error",
                confirmButtonText: "OK"
            });
        }
    }

    function actualizarBotonEstado(e) {
        // Actualizar el botón y realizar otros cambios visuales
        if (e.target.classList.contains('bg-yellow-100')) {
            e.target.classList.add('bg-green-100', 'text-green-800');
            e.target.classList.remove('bg-yellow-100', 'text-yellow-800');
            e.target.textContent = 'Publicado';
        } else {
            e.target.classList.add('bg-yellow-100', 'text-yellow-800');
            e.target.classList.remove('bg-green-100', 'text-green-800');
            e.target.textContent = 'No publicado';
        }
    }
})();
