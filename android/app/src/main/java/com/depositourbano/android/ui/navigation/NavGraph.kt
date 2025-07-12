package com.depositourbano.android.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.depositourbano.android.ui.auth.LoginScreen
import com.depositourbano.android.ui.auth.RegisterScreen
import com.depositourbano.android.ui.auth.WelcomeScreen
import com.depositourbano.android.ui.spaces.SpaceDetailScreen
import com.depositourbano.android.ui.spaces.SpaceSearchScreen

@Composable
fun NavGraph(
    navController: NavHostController,
    startDestination: String
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        // Auth flow
        composable(Screen.Welcome.route) {
            WelcomeScreen(navController)
        }
        composable(Screen.Login.route) {
            LoginScreen(navController)
        }
        composable(Screen.Register.route) {
            RegisterScreen(navController)
        }
        
        // Main app flow
        composable(Screen.Home.route) {
            MainScreen()
        }
        composable(Screen.SpaceSearch.route) {
            SpaceSearchScreen(navController)
        }
        composable(Screen.SpaceDetail.route + "/{spaceId}") { backStackEntry ->
            val spaceId = backStackEntry.arguments?.getString("spaceId")?.toIntOrNull() ?: 0
            SpaceDetailScreen(navController, spaceId)
        }
    }
}

sealed class Screen(val route: String) {
    object Welcome : Screen("welcome")
    object Login : Screen("login")
    object Register : Screen("register")
    object Home : Screen("home")
    object SpaceSearch : Screen("space_search")
    object SpaceDetail : Screen("space_detail")
    object Bookings : Screen("bookings")
    object Profile : Screen("profile")
}