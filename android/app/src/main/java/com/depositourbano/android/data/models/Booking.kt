package com.depositourbano.android.data.models

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class Booking(
    val id: Int,
    val spaceId: Int,
    val tenantId: Int,
    val startDate: String,
    val endDate: String,
    val totalPrice: Double,
    val status: BookingStatus,
    val paymentStatus: PaymentStatus,
    val paymentId: Int? = null,
    val notes: String? = null,
    val space: Space? = null,
    val tenant: User? = null,
    val payment: Payment? = null,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

enum class BookingStatus {
    PENDING, CONFIRMED, CANCELLED, COMPLETED;
    
    fun displayName(): String = when(this) {
        PENDING -> "Pendiente"
        CONFIRMED -> "Confirmada"
        CANCELLED -> "Cancelada"
        COMPLETED -> "Completada"
    }
}

enum class PaymentStatus {
    PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED;
    
    fun displayName(): String = when(this) {
        PENDING -> "Pendiente"
        PROCESSING -> "Procesando"
        COMPLETED -> "Completado"
        FAILED -> "Fallido"
        REFUNDED -> "Reembolsado"
    }
}

data class CreateBookingRequest(
    val spaceId: Int,
    val startDate: String,
    val endDate: String,
    val notes: String? = null
)