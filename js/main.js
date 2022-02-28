// Constante
const headers = {
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hc3Vza2ZnaXVxbXV3enRzYmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDU3ODI4NjEsImV4cCI6MTk2MTM1ODg2MX0.xbkOOIQEOzI5kYkf2qhJdnGORcfCKT6dyxffZ5NkJuo',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hc3Vza2ZnaXVxbXV3enRzYmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDU3ODI4NjEsImV4cCI6MTk2MTM1ODg2MX0.xbkOOIQEOzI5kYkf2qhJdnGORcfCKT6dyxffZ5NkJuo',
    'Range': '0-9'
};


Vue.createApp({
    data() {
        return {
            peliculas: [],
            APIUrl: 'https://masuskfgiuqmuwztsbdj.supabase.co/rest/v1/peliculas',
            verFormAnyadir: false,
            nuevoNombre: '',
            nuevaDuracion: '',
            isLoading: false,
            peliculasEditables: -1,
            editarNombre: '',
            editarDuracion: '',
            numeroResultadosPorPagina: 5,
            pag: 1
        }
    },
    methods: {
        getHeader: function() {
            // Página 1: 0*5 = 0
            const rangoInicio = (this.pag - 1) * this.numeroResultadosPorPagina;
            // Rango inicio 0: 0 + 5 = 5  --- DEL 0 AL 5
            const rangoFinal = rangoInicio + this.numeroResultadosPorPagina;
            // Clono headers
            let headersNuevoRango = JSON.parse(JSON.stringify(headers));
            // Modifico el rango
            headersNuevoRango.Range = `${rangoInicio}-${rangoFinal}`;
            return headersNuevoRango;
        },
        getPeliculas: async function() {
            this.isLoading = true;
            const fetchPeliculas = await fetch(`${this.APIUrl}?select=*`, { headers: this.getHeader() });
            this.peliculas = await fetchPeliculas.json();
            this.isLoading = false;
        },
        addPelicula: async function() {
            this.isLoading = true;
            // Ocultar el formulario
            this.verFormAnyadir = false;
            // Hacer el POST a la base de datos
            await fetch(this.APIUrl, {
                headers: this.getHeader(),
                method: 'POST',
                body: JSON.stringify({ "name": this.nuevoNombre, "duration": this.nuevaDuracion })
            });
            // Reiniciamos variables
            this.nuevoNombre = '';
            this.nuevaDuracion = '';
            // Obtenemos de nuevo las películas
            this.getPeliculas();
            this.isLoading = false;
        },
        deletePelicula: async function(id) {
            // Borramos visualmente - para que en el retardo el usuario no le de a borrar más veces
            //this.$refs[`pelicula-${id}`][0].remove(); -- No funciona bien
            // Borramos de la base de datos
            await fetch(`${this.APIUrl}?id=eq.${id}`, {
                headers: this.getHeader(),
                method: 'DELETE'
            });
            this.getPeliculas();
        },
        verEditarPelicula: function(id) {
            // Mostramos el campo a editar
            this.peliculasEditables = id;
            // Obtenemos la información
            const peliculaEditar = this.peliculas.filter(pelicula => {
                return pelicula.id === id;
            })[0];
            // Mostramos datos
            this.editarNombre = peliculaEditar.name;
            this.editarDuracion = peliculaEditar.duration;
        },
        editarPelicula: async function(id) {
            this.peliculasEditables = -1;
            await fetch(`${this.APIUrl}?id=eq.${id}`, {
                headers: this.getHeader(),
                method: 'PATCH',
                body: JSON.stringify({ "name": this.editarNombre, "duration": this.editarDuracion })
            });
            this.getPeliculas();
        }
    },
    watch: {
        isLoading(value) {
            if (value) {
                NProgress.start();
            } else {
                NProgress.done();
            }
        },
        // Cuando haya un cambio dentro de pag...
        pag(value) {
            this.getPeliculas();
        }
    },
    mounted: function() {
        this.getPeliculas();
    },
}).mount('#app')