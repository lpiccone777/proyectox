package com.depositourbano.android.utils

object Constants {
    const val BASE_URL = "http://localhost:3000/api/"
    const val DATASTORE_NAME = "deposito_urbano_preferences"
    
    object DateFormat {
        const val API_FORMAT = "yyyy-MM-dd"
        const val DISPLAY_FORMAT = "dd/MM/yyyy"
    }
    
    object Features {
        val SPACE_FEATURES = listOf(
            "Acceso 24/7",
            "Seguridad con cámaras",
            "Control de temperatura",
            "Seco",
            "Iluminado",
            "Planta baja",
            "Ascensor",
            "Estacionamiento"
        )
    }
    
    object Rules {
        val SPACE_RULES = listOf(
            "No inflamables",
            "No alimentos",
            "No mascotas",
            "Acceso con aviso previo",
            "Horario restringido"
        )
    }
}