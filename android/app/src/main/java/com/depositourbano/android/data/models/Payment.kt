package com.depositourbano.android.data.models

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class Payment(
    val id: Int,
    val bookingId: Int,
    val amount: Double,
    val status: PaymentStatus,
    val mercadopagoPaymentId: String? = null,
    val preferenceId: String? = null,
    val paymentMethod: String? = null,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

data class PaymentPreference(
    val preferenceId: String,
    val initPoint: String,
    val sandboxInitPoint: String
)