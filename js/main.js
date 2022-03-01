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
            peliculasLength: 0,
            peliculasEditables: -1,
            editarNombre: '',
            editarDuracion: '',
            numeroResultadosPorPagina: 5,
            pag: 1
        }
    },
    computed: {
        maxPags: function() {
            return Math.ceil(this.peliculasLength / this.numeroResultadosPorPagina);
        }
    },
    methods: {
        getHeaders: function() {
            const rangoInicio = (this.pag - 1) * this.numeroResultadosPorPagina;
            const rangoFinal = rangoInicio + this.numeroResultadosPorPagina;
            // Clono headers
            let headersNuevoRango = JSON.parse(JSON.stringify(headers));
            // Modifico el rango
            headersNuevoRango.Range = `${rangoInicio}-${rangoFinal}`;
            return headersNuevoRango;
        },
        getPeliculasLength: async function() {
            // Obtengo mis headers y quito el Rango de paginar
            const myHeaders = this.getHeaders();
            myHeaders.Range = '';
            // Pido la lista con todas las peliculas
            const fetchPeliculas = await fetch(`${this.APIUrl}?select=*`, { headers: myHeaders });
            const dataPeliculas = await fetchPeliculas.json();
            this.peliculasLength = Math.ceil(dataPeliculas.length / this.numeroResultadosPorPagina);
        },
        getPeliculas: async function() {
            this.isLoading = true;
            const fetchPeliculas = await fetch(`${this.APIUrl}?select=*`, { headers: this.getHeaders() });
            this.peliculas = await fetchPeliculas.json();
            this.isLoading = false;
        },
        addPelicula: async function() {
            this.isLoading = true;
            // Ocultar el formulario
            this.verFormAnyadir = false;
            // Anyadir la pelicula a la base de datos
            const fetchPeliculas = await fetch(this.APIUrl, {
                headers: this.getHeaders(),
                method: 'POST',
                body: JSON.stringify({ "name": this.nuevoNombre, "duration": this.nuevaDuracion })
            });
            // Reiniciamos formulario
            this.nuevoNombre = '';
            this.nuevaDuracion = '';
            // Obtenemos de nuevo las peliculas
            this.getPeliculas();
            this.isLoading = false;
        },
        deletePelicula: async function(id) {
            // Borramos de la base de datos
            await fetch(`${this.APIUrl}?id=eq.${id}`, {
                headers: this.getHeaders(),
                method: 'DELETE'
            });
            this.getPeliculas();
        },
        verEditarPelicula: function(id) {
            // Mostramos el campo a editar
            this.peliculasEditables = id;
            // Obtenemos la informacion
            const peliculaAEditar = this.peliculas.filter(function(pelicula) {
                return pelicula.id === id;
            })[0];
            // Mostramos datos
            this.editarNombre = peliculaAEditar.name;
            this.editarDuracion = peliculaAEditar.duration;
        },
        editarPelicula: async function(id) {
            this.isLoading = true;
            this.peliculasEditables = -1;
            const fetchPeliculas = await fetch(`${this.APIUrl}?id=eq.${id}`, {
                headers: this.getHeaders(),
                method: 'PATCH',
                body: JSON.stringify({ "name": this.editarNombre, "duration": this.editarDuracion })
            });
            this.getPeliculas();
            this.isLoading = false;
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
        pag(value) {
            this.getPeliculas();
            this.getPeliculasLength();
        }
    },
    mounted: function() {
        this.getPeliculas();
        this.getPeliculasLength();
    }
}).mount('#app')