import SwiftUI

struct AuthenticationView: View {
    @State private var isShowingLogin = true
    
    var body: some View {
        NavigationView {
            ZStack {
                LinearGradient(
                    colors: [Color("PrimaryColor"), Color("SecondaryColor")],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                VStack(spacing: 30) {
                    VStack(spacing: 10) {
                        Image(systemName: "shippingbox.fill")
                            .font(.system(size: 80))
                            .foregroundColor(.white)
                        
                        Text("Depósito Urbano")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        Text("Tu espacio de almacenamiento compartido")
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.8))
                    }
                    .padding(.top, 50)
                    
                    Spacer()
                    
                    VStack(spacing: 20) {
                        NavigationLink(destination: LoginView()) {
                            Text("Iniciar Sesión")
                                .font(.headline)
                                .foregroundColor(Color("PrimaryColor"))
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .background(Color.white)
                                .cornerRadius(25)
                        }
                        
                        NavigationLink(destination: RegisterView()) {
                            Text("Crear Cuenta")
                                .font(.headline)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 25)
                                        .stroke(Color.white, lineWidth: 2)
                                )
                        }
                        
                        HStack(spacing: 20) {
                            SocialLoginButton(
                                icon: "applelogo",
                                text: "Apple",
                                action: {
                                    // TODO: Implement Apple Sign In
                                }
                            )
                            
                            SocialLoginButton(
                                icon: "g.circle.fill",
                                text: "Google",
                                action: {
                                    // TODO: Implement Google Sign In
                                }
                            )
                        }
                    }
                    .padding(.horizontal, 30)
                    .padding(.bottom, 50)
                }
            }
            .navigationBarHidden(true)
        }
    }
}

struct SocialLoginButton: View {
    let icon: String
    let text: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .font(.title2)
                Text(text)
                    .font(.caption)
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 44)
            .overlay(
                RoundedRectangle(cornerRadius: 22)
                    .stroke(Color.white.opacity(0.5), lineWidth: 1)
            )
        }
    }
}

#Preview {
    AuthenticationView()
}