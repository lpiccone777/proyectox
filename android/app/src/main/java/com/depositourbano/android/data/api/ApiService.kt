package com.depositourbano.android.data.api

import com.depositourbano.android.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // Auth endpoints
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
    
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>
    
    @GET("auth/me")
    suspend fun getCurrentUser(): Response<User>
    
    @POST("auth/logout")
    suspend fun logout(): Response<Unit>
    
    // Spaces endpoints
    @GET("spaces")
    suspend fun searchSpaces(
        @QueryMap params: Map<String, String>
    ): Response<List<Space>>
    
    @GET("spaces/{id}")
    suspend fun getSpace(@Path("id") id: Int): Response<Space>
    
    @POST("spaces")
    suspend fun createSpace(@Body space: Space): Response<Space>
    
    @PUT("spaces/{id}")
    suspend fun updateSpace(
        @Path("id") id: Int,
        @Body space: Space
    ): Response<Space>
    
    @DELETE("spaces/{id}")
    suspend fun deleteSpace(@Path("id") id: Int): Response<Unit>
    
    // User spaces
    @GET("users/me/spaces")
    suspend fun getMySpaces(): Response<List<Space>>
    
    // Bookings endpoints
    @GET("bookings")
    suspend fun getMyBookings(
        @Query("role") role: String? = null
    ): Response<List<Booking>>
    
    @GET("bookings/{id}")
    suspend fun getBooking(@Path("id") id: Int): Response<Booking>
    
    @POST("bookings")
    suspend fun createBooking(@Body request: CreateBookingRequest): Response<Booking>
    
    @PUT("bookings/{id}/status")
    suspend fun updateBookingStatus(
        @Path("id") id: Int,
        @Body status: Map<String, String>
    ): Response<Booking>
    
    // Payment endpoints
    @POST("payments/preference/{bookingId}")
    suspend fun createPaymentPreference(
        @Path("bookingId") bookingId: Int
    ): Response<PaymentPreference>
    
    @POST("payments/webhook")
    suspend fun handlePaymentWebhook(@Body data: Map<String, Any>): Response<Unit>
    
    // Reviews endpoints
    @GET("reviews/space/{spaceId}")
    suspend fun getSpaceReviews(@Path("spaceId") spaceId: Int): Response<List<Review>>
    
    @POST("reviews")
    suspend fun createReview(@Body request: CreateReviewRequest): Response<Review>
    
    // Stats endpoints
    @GET("stats/host")
    suspend fun getHostStats(): Response<Map<String, Any>>
    
    @GET("stats/tenant")
    suspend fun getTenantStats(): Response<Map<String, Any>>
}