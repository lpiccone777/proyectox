package com.depositourbano.android

import com.depositourbano.android.data.models.*
import com.depositourbano.android.data.repository.AuthRepository
import com.depositourbano.android.data.repository.SpaceRepository
import com.depositourbano.android.utils.Resource
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Test
import org.junit.Assert.*
import org.mockito.kotlin.*
import java.util.Date

class UserModelTest {
    
    @Test
    fun `test UserRole display names`() {
        assertEquals("Inquilino", UserRole.TENANT.displayName())
        assertEquals("Anfitrión", UserRole.HOST.displayName())
        assertEquals("Ambos", UserRole.BOTH.displayName())
    }
    
    @Test
    fun `test LoginRequest creation`() {
        val loginRequest = LoginRequest(
            email = "test@example.com",
            password = "password123"
        )
        
        assertEquals("test@example.com", loginRequest.email)
        assertEquals("password123", loginRequest.password)
    }
    
    @Test
    fun `test RegisterRequest creation`() {
        val registerRequest = RegisterRequest(
            email = "test@example.com",
            password = "password123",
            firstName = "Test",
            lastName = "User",
            phone = "+1234567890",
            role = "tenant"
        )
        
        assertEquals("test@example.com", registerRequest.email)
        assertEquals("Test", registerRequest.firstName)
        assertEquals("tenant", registerRequest.role)
    }
}

class SpaceModelTest {
    
    @Test
    fun `test SpaceType display names`() {
        assertEquals("Garaje", SpaceType.GARAGE.displayName())
        assertEquals("Trastero", SpaceType.STORAGE_ROOM.displayName())
        assertEquals("Armario", SpaceType.CLOSET.displayName())
        assertEquals("Sótano", SpaceType.BASEMENT.displayName())
        assertEquals("Altillo", SpaceType.ATTIC.displayName())
        assertEquals("Galpón", SpaceType.SHED.displayName())
        assertEquals("Otro", SpaceType.OTHER.displayName())
    }
    
    @Test
    fun `test Space creation with all fields`() {
        val space = Space(
            id = 1,
            hostId = 2,
            title = "Test Space",
            description = "A test space",
            type = SpaceType.GARAGE,
            size = 20.5,
            pricePerMonth = 300.0,
            pricePerDay = 15.0,
            latitude = 40.7128,
            longitude = -74.0060,
            address = "123 Test St",
            city = "New York",
            province = "NY",
            postalCode = "10001",
            features = listOf("24/7 Access", "Security"),
            rules = listOf("No smoking"),
            isActive = true,
            images = emptyList(),
            averageRating = 4.5,
            totalReviews = 10,
            host = null,
            createdAt = "2024-01-01",
            updatedAt = "2024-01-01"
        )
        
        assertEquals(1, space.id)
        assertEquals("Test Space", space.title)
        assertEquals(SpaceType.GARAGE, space.type)
        assertEquals(20.5, space.size, 0.01)
        assertEquals(2, space.features.size)
        assertEquals(4.5, space.averageRating ?: 0.0, 0.01)
    }
}

class BookingModelTest {
    
    @Test
    fun `test BookingStatus display names`() {
        assertEquals("Pendiente", BookingStatus.PENDING.displayName())
        assertEquals("Confirmada", BookingStatus.CONFIRMED.displayName())
        assertEquals("Cancelada", BookingStatus.CANCELLED.displayName())
        assertEquals("Completada", BookingStatus.COMPLETED.displayName())
    }
    
    @Test
    fun `test PaymentStatus display names`() {
        assertEquals("Pendiente", PaymentStatus.PENDING.displayName())
        assertEquals("Procesando", PaymentStatus.PROCESSING.displayName())
        assertEquals("Completado", PaymentStatus.COMPLETED.displayName())
        assertEquals("Fallido", PaymentStatus.FAILED.displayName())
        assertEquals("Reembolsado", PaymentStatus.REFUNDED.displayName())
    }
}

class AuthRepositoryTest {
    
    private val mockApiService = mock<com.depositourbano.android.data.api.ApiService>()
    private val mockDataStore = mock<androidx.datastore.core.DataStore<androidx.datastore.preferences.core.Preferences>>()
    private val mockGson = mock<com.google.gson.Gson>()
    
    private lateinit var authRepository: AuthRepository
    
    @Test
    fun `test login success returns Success resource`() = runBlocking {
        // Given
        val authResponse = AuthResponse(
            token = "mock-token",
            user = User(
                id = 1,
                email = "test@example.com",
                firstName = "Test",
                lastName = "User",
                phone = "+1234567890",
                role = UserRole.TENANT,
                profileImageUrl = null,
                isVerified = true,
                createdAt = "2024-01-01",
                updatedAt = "2024-01-01"
            )
        )
        
        whenever(mockApiService.login(any())).thenReturn(
            retrofit2.Response.success(authResponse)
        )
        
        authRepository = AuthRepository(mockApiService, mockDataStore, mockGson)
        
        // When
        val result = authRepository.login("test@example.com", "password123").first()
        
        // Then
        assertTrue(result is Resource.Success)
        assertEquals("test@example.com", (result as Resource.Success).data?.user?.email)
    }
    
    @Test
    fun `test login failure returns Error resource`() = runBlocking {
        // Given
        whenever(mockApiService.login(any())).thenThrow(RuntimeException("Network error"))
        
        authRepository = AuthRepository(mockApiService, mockDataStore, mockGson)
        
        // When
        val result = authRepository.login("test@example.com", "password123").first()
        
        // Then
        assertTrue(result is Resource.Error)
        assertEquals("Network error", (result as Resource.Error).message)
    }
}

class SpaceRepositoryTest {
    
    private val mockApiService = mock<com.depositourbano.android.data.api.ApiService>()
    private lateinit var spaceRepository: SpaceRepository
    
    @Test
    fun `test searchSpaces with filters`() = runBlocking {
        // Given
        val spaces = listOf(
            Space(
                id = 1,
                hostId = 2,
                title = "Test Space",
                description = "Test",
                type = SpaceType.GARAGE,
                size = 20.0,
                pricePerMonth = 300.0,
                latitude = 40.7128,
                longitude = -74.0060,
                address = "123 Test St",
                city = "New York",
                province = "NY",
                postalCode = "10001",
                createdAt = "2024-01-01",
                updatedAt = "2024-01-01"
            )
        )
        
        whenever(mockApiService.searchSpaces(any())).thenReturn(
            retrofit2.Response.success(spaces)
        )
        
        spaceRepository = SpaceRepository(mockApiService)
        
        // When
        val params = SpaceSearchParams(
            type = SpaceType.GARAGE,
            minPrice = 200.0,
            maxPrice = 400.0
        )
        val result = spaceRepository.searchSpaces(params).first()
        
        // Then
        assertTrue(result is Resource.Success)
        assertEquals(1, (result as Resource.Success).data?.size)
        assertEquals("Test Space", result.data?.first()?.title)
    }
}