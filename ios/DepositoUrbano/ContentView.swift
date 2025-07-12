import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var navigationViewModel: NavigationViewModel
    
    var body: some View {
        Group {
            if authViewModel.isAuthenticated {
                MainTabView()
            } else if authViewModel.isLoading {
                LoadingView()
            } else {
                AuthenticationView()
            }
        }
        .onAppear {
            authViewModel.checkAuthStatus()
        }
    }
}

struct LoadingView: View {
    var body: some View {
        ZStack {
            Color("BackgroundColor")
                .ignoresSafeArea()
            
            VStack(spacing: 20) {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: Color("PrimaryColor")))
                    .scaleEffect(1.5)
                
                Text("Cargando...")
                    .font(.headline)
                    .foregroundColor(.secondary)
            }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthViewModel())
        .environmentObject(NavigationViewModel())
}