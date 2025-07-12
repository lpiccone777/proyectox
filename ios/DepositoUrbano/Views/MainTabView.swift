import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var navigationViewModel: NavigationViewModel
    
    var body: some View {
        TabView(selection: $navigationViewModel.selectedTab) {
            SpaceSearchView()
                .tabItem {
                    Label("Buscar", systemImage: "magnifyingglass")
                }
                .tag(0)
            
            if authViewModel.currentUser?.isHost == true {
                MySpacesView()
                    .tabItem {
                        Label("Mis Espacios", systemImage: "house.fill")
                    }
                    .tag(1)
            }
            
            BookingsView()
                .tabItem {
                    Label("Reservas", systemImage: "calendar")
                }
                .tag(authViewModel.currentUser?.isHost == true ? 2 : 1)
            
            ProfileView()
                .tabItem {
                    Label("Perfil", systemImage: "person.fill")
                }
                .tag(authViewModel.currentUser?.isHost == true ? 3 : 2)
        }
        .accentColor(Color("PrimaryColor"))
    }
}