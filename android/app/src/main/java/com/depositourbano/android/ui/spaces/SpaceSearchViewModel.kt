package com.depositourbano.android.ui.spaces

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.depositourbano.android.data.models.Space
import com.depositourbano.android.data.models.SpaceSearchParams
import com.depositourbano.android.data.repository.SpaceRepository
import com.depositourbano.android.utils.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SpaceSearchViewModel @Inject constructor(
    private val spaceRepository: SpaceRepository
) : ViewModel() {
    
    private val _spaces = MutableStateFlow<List<Space>>(emptyList())
    val spaces: StateFlow<List<Space>> = _spaces.asStateFlow()
    
    private val _searchState = MutableStateFlow<SpaceSearchState>(SpaceSearchState.Success)
    val searchState: StateFlow<SpaceSearchState> = _searchState.asStateFlow()
    
    init {
        searchSpaces()
    }
    
    fun searchSpaces(params: SpaceSearchParams = SpaceSearchParams()) {
        viewModelScope.launch {
            spaceRepository.searchSpaces(params).collect { result ->
                when (result) {
                    is Resource.Loading -> {
                        _searchState.value = SpaceSearchState.Loading
                    }
                    is Resource.Success -> {
                        _spaces.value = result.data ?: emptyList()
                        _searchState.value = SpaceSearchState.Success
                    }
                    is Resource.Error -> {
                        _searchState.value = SpaceSearchState.Error(
                            result.message ?: "Error al buscar espacios"
                        )
                    }
                }
            }
        }
    }
}

sealed class SpaceSearchState {
    object Loading : SpaceSearchState()
    object Success : SpaceSearchState()
    data class Error(val message: String) : SpaceSearchState()
}