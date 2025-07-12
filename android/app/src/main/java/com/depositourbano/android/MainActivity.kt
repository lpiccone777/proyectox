package com.depositourbano.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.rememberNavController
import com.depositourbano.android.ui.auth.AuthViewModel
import com.depositourbano.android.ui.navigation.NavGraph
import com.depositourbano.android.ui.navigation.Screen
import com.depositourbano.android.ui.theme.DepositoUrbanoTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            DepositoUrbanoTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    DepositoUrbanoApp()
                }
            }
        }
    }
}

@Composable
fun DepositoUrbanoApp() {
    val navController = rememberNavController()
    val authViewModel: AuthViewModel = hiltViewModel()
    val isAuthenticated by authViewModel.isAuthenticated.collectAsState()
    
    val startDestination = if (isAuthenticated) {
        Screen.Home.route
    } else {
        Screen.Welcome.route
    }
    
    NavGraph(
        navController = navController,
        startDestination = startDestination
    )
}