package com.depositourbano.android.data.repository

import com.depositourbano.android.data.api.ApiService
import com.depositourbano.android.data.models.Space
import com.depositourbano.android.data.models.SpaceSearchParams
import com.depositourbano.android.utils.Resource
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SpaceRepository @Inject constructor(
    private val apiService: ApiService
) {
    
    fun searchSpaces(params: SpaceSearchParams): Flow<Resource<List<Space>>> = flow {
        emit(Resource.Loading())
        try {
            val queryMap = mutableMapOf<String, String>()
            params.lat?.let { queryMap["lat"] = it.toString() }
            params.lng?.let { queryMap["lng"] = it.toString() }
            params.radius?.let { queryMap["radius"] = it.toString() }
            params.type?.let { queryMap["type"] = it.name }
            params.minSize?.let { queryMap["minSize"] = it.toString() }
            params.maxSize?.let { queryMap["maxSize"] = it.toString() }
            params.minPrice?.let { queryMap["minPrice"] = it.toString() }
            params.maxPrice?.let { queryMap["maxPrice"] = it.toString() }
            params.features?.let { queryMap["features"] = it.joinToString(",") }
            params.availableFrom?.let { queryMap["availableFrom"] = it }
            params.city?.let { queryMap["city"] = it }
            params.province?.let { queryMap["province"] = it }
            
            val response = apiService.searchSpaces(queryMap)
            if (response.isSuccessful) {
                emit(Resource.Success(response.body() ?: emptyList()))
            } else {
                emit(Resource.Error(response.message()))
            }
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Unknown error"))
        }
    }
    
    fun getSpace(id: Int): Flow<Resource<Space>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.getSpace(id)
            if (response.isSuccessful) {
                response.body()?.let {
                    emit(Resource.Success(it))
                } ?: emit(Resource.Error("Space not found"))
            } else {
                emit(Resource.Error(response.message()))
            }
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Unknown error"))
        }
    }
    
    fun getMySpaces(): Flow<Resource<List<Space>>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.getMySpaces()
            if (response.isSuccessful) {
                emit(Resource.Success(response.body() ?: emptyList()))
            } else {
                emit(Resource.Error(response.message()))
            }
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Unknown error"))
        }
    }
    
    fun createSpace(space: Space): Flow<Resource<Space>> = flow {
        emit(Resource.Loading())
        try {
            val response = apiService.createSpace(space)
            if (response.isSuccessful) {
                response.body()?.let {
                    emit(Resource.Success(it))
                } ?: emit(Resource.Error("Failed to create space"))
            } else {
                emit(Resource.Error(response.message()))
            }
        } catch (e: Exception) {
            emit(Resource.Error(e.message ?: "Unknown error"))
        }
    }
}