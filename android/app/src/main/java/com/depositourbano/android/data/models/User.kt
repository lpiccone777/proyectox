package com.depositourbano.android.data.models

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class User(
    val id: Int,
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String,
    val role: UserRole,
    val profileImageUrl: String? = null,
    val isVerified: Boolean = false,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

enum class UserRole {
    TENANT, HOST, BOTH;
    
    fun displayName(): String = when(this) {
        TENANT -> "Inquilino"
        HOST -> "Anfitrión"
        BOTH -> "Ambos"
    }
}

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val firstName: String,
    val lastName: String,
    val phone: String,
    val role: String
)

data class AuthResponse(
    val token: String,
    val user: User
)