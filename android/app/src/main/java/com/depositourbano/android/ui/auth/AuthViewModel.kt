package com.depositourbano.android.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.depositourbano.android.data.models.RegisterRequest
import com.depositourbano.android.data.models.User
import com.depositourbano.android.data.repository.AuthRepository
import com.depositourbano.android.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _loginState = MutableStateFlow<AuthState>(AuthState.Idle)
    val loginState: StateFlow<AuthState> = _loginState.asStateFlow()
    
    private val _registerState = MutableStateFlow<AuthState>(AuthState.Idle)
    val registerState: StateFlow<AuthState> = _registerState.asStateFlow()
    
    val isAuthenticated: StateFlow<Boolean> = authRepository.getAuthToken()
        .map { it != null }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = false
        )
    
    val currentUser: StateFlow<User?> = authRepository.getCurrentUser()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )
    
    fun login(email: String, password: String) {
        viewModelScope.launch {
            authRepository.login(email, password).collect { result ->
                _loginState.value = when (result) {
                    is Resource.Loading -> AuthState.Loading
                    is Resource.Success -> AuthState.Success
                    is Resource.Error -> AuthState.Error(result.message ?: "Login failed")
                }
            }
        }
    }
    
    fun register(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        phone: String,
        role: String
    ) {
        viewModelScope.launch {
            val request = RegisterRequest(
                email = email,
                password = password,
                firstName = firstName,
                lastName = lastName,
                phone = phone,
                role = role
            )
            
            authRepository.register(request).collect { result ->
                _registerState.value = when (result) {
                    is Resource.Loading -> AuthState.Loading
                    is Resource.Success -> AuthState.Success
                    is Resource.Error -> AuthState.Error(result.message ?: "Registration failed")
                }
            }
        }
    }
    
    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
        }
    }
    
    fun clearErrors() {
        _loginState.value = AuthState.Idle
        _registerState.value = AuthState.Idle
    }
}

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    object Success : AuthState()
    data class Error(val message: String) : AuthState()
}