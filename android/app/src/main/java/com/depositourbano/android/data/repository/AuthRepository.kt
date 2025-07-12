package com.depositourbano.android.data.repository

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import com.depositourbano.android.data.api.ApiService
import com.depositourbano.android.data.models.*
import com.depositourbano.android.utils.Resource
import com.google.gson.Gson
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: ApiService,
    private val dataStore: DataStore<Preferences>,
    private val gson: Gson
) {
    
    companion object {
        private val TOKEN_KEY = stringPreferencesKey("auth_token")
        private val USER_KEY = stringPreferencesKey("current_user")
    }
    
    fun getAuthToken(): Flow<String?> = dataStore.data.map { preferences ->
        preferences[TOKEN_KEY]
    }
    
    fun getCurrentUser(): Flow<User?> = dataStore.data.map { preferences ->
        preferences[USER_KEY]?.let { json ->
            gson.fromJson(json, User::class.java)
        }
    }
    
    fun login(email: String, password: String): Flow<Resource<AuthResponse>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.login(LoginRequest(email, password))
            if (response.isSuccessful) {
                response.body()?.let { authResponse ->
                    saveAuthData(authResponse)
                    emit(Resource.Success(authResponse))
                } ?: emit(Resource.Error("Empty response"))
            } else {
                emit(Resource.Error(response.message()))
            }
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Unknown error"))
        }
    }
    
    fun register(request: RegisterRequest): Flow<Resource<AuthResponse>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.register(request)
            if (response.isSuccessful) {
                response.body()?.let { authResponse ->
                    saveAuthData(authResponse)
                    emit(Resource.Success(authResponse))
                } ?: emit(Resource.Error("Empty response"))
            } else {
                emit(Resource.Error(response.message()))
            }
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Unknown error"))
        }
    }
    
    suspend fun logout() {
        try {
            apiService.logout()
        } catch (_: Exception) {
            // Ignore network errors on logout
        }
        clearAuthData()
    }
    
    private suspend fun saveAuthData(authResponse: AuthResponse) {
        dataStore.edit { preferences ->
            preferences[TOKEN_KEY] = authResponse.token
            preferences[USER_KEY] = gson.toJson(authResponse.user)
        }
    }
    
    private suspend fun clearAuthData() {
        dataStore.edit { preferences ->
            preferences.remove(TOKEN_KEY)
            preferences.remove(USER_KEY)
        }
    }
}