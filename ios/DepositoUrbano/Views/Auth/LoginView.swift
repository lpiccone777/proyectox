import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) var dismiss
    
    @State private var email = ""
    @State private var password = ""
    @State private var showingPassword = false
    
    var body: some View {
        VStack(spacing: 20) {
            VStack(alignment: .leading, spacing: 25) {
                Text("Bienvenido de vuelta")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                VStack(alignment: .leading, spacing: 15) {
                    Text("Email")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    TextField("tu@email.com", text: $email)
                        .textFieldStyle(CustomTextFieldStyle())
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                }
                
                VStack(alignment: .leading, spacing: 15) {
                    Text("Contraseña")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    HStack {
                        if showingPassword {
                            TextField("Contraseña", text: $password)
                        } else {
                            SecureField("Contraseña", text: $password)
                        }
                        
                        Button(action: { showingPassword.toggle() }) {
                            Image(systemName: showingPassword ? "eye.slash" : "eye")
                                .foregroundColor(.secondary)
                        }
                    }
                    .textFieldStyle(CustomTextFieldStyle())
                }
                
                Button(action: {}) {
                    Text("¿Olvidaste tu contraseña?")
                        .font(.caption)
                        .foregroundColor(Color("PrimaryColor"))
                }
            }
            .padding(.horizontal)
            
            Spacer()
            
            if let errorMessage = authViewModel.errorMessage {
                Text(errorMessage)
                    .font(.caption)
                    .foregroundColor(.red)
                    .padding(.horizontal)
            }
            
            Button(action: { Task { await login() } }) {
                if authViewModel.isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else {
                    Text("Iniciar Sesión")
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(Color("PrimaryColor"))
            .foregroundColor(.white)
            .cornerRadius(10)
            .disabled(authViewModel.isLoading || email.isEmpty || password.isEmpty)
            .padding(.horizontal)
            .padding(.bottom, 30)
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button("Cancelar") {
                    dismiss()
                }
            }
        }
    }
    
    private func login() async {
        await authViewModel.login(email: email, password: password)
        if authViewModel.isAuthenticated {
            dismiss()
        }
    }
}

struct CustomTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding()
            .background(Color.gray.opacity(0.1))
            .cornerRadius(10)
    }
}