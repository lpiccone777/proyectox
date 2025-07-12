package com.depositourbano.android.data.models

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class Review(
    val id: Int,
    val bookingId: Int,
    val spaceId: Int,
    val reviewerId: Int,
    val rating: Int,
    val comment: String? = null,
    val reviewer: User? = null,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

data class CreateReviewRequest(
    val bookingId: Int,
    val rating: Int,
    val comment: String? = null
)