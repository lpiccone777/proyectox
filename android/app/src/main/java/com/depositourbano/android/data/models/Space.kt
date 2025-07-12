package com.depositourbano.android.data.models

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class Space(
    val id: Int,
    val hostId: Int,
    val title: String,
    val description: String,
    val type: SpaceType,
    val size: Double,
    val pricePerMonth: Double,
    val pricePerDay: Double? = null,
    val latitude: Double,
    val longitude: Double,
    val address: String,
    val city: String,
    val province: String,
    val postalCode: String,
    val features: List<String> = emptyList(),
    val rules: List<String> = emptyList(),
    val isActive: Boolean = true,
    val availableFrom: String? = null,
    val availableUntil: String? = null,
    val images: List<SpaceImage> = emptyList(),
    val averageRating: Double? = null,
    val totalReviews: Int = 0,
    val host: User? = null,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

@Parcelize
data class SpaceImage(
    val id: Int,
    val spaceId: Int,
    val url: String,
    val isPrimary: Boolean = false,
    val order: Int = 0
) : Parcelable

enum class SpaceType {
    GARAGE, STORAGE_ROOM, CLOSET, BASEMENT, ATTIC, SHED, OTHER;
    
    fun displayName(): String = when(this) {
        GARAGE -> "Garaje"
        STORAGE_ROOM -> "Trastero"
        CLOSET -> "Armario"
        BASEMENT -> "Sótano"
        ATTIC -> "Altillo"
        SHED -> "Galpón"
        OTHER -> "Otro"
    }
    
    fun icon(): Int = when(this) {
        GARAGE -> android.R.drawable.ic_menu_directions
        STORAGE_ROOM -> android.R.drawable.ic_menu_manage
        CLOSET -> android.R.drawable.ic_menu_agenda
        BASEMENT -> android.R.drawable.ic_menu_sort_by_size
        ATTIC -> android.R.drawable.ic_menu_upload
        SHED -> android.R.drawable.ic_menu_view
        OTHER -> android.R.drawable.ic_menu_help
    }
}

data class SpaceSearchParams(
    val lat: Double? = null,
    val lng: Double? = null,
    val radius: Int? = null,
    val type: SpaceType? = null,
    val minSize: Double? = null,
    val maxSize: Double? = null,
    val minPrice: Double? = null,
    val maxPrice: Double? = null,
    val features: List<String>? = null,
    val availableFrom: String? = null,
    val city: String? = null,
    val province: String? = null
)