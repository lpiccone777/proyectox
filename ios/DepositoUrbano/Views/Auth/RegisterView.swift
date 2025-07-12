import SwiftUI

struct RegisterView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) var dismiss
    
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var phone = ""
    @State private var selectedRole = UserRole.tenant
    @State private var showingPassword = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                VStack(alignment: .leading, spacing: 25) {
                    Text("Crear Cuenta")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                    
                    // Personal Information
                    Group {
                        VStack(alignment: .leading, spacing: 15) {
                            Text("Nombre")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            TextField("Juan", text: $firstName)
                                .textFieldStyle(CustomTextFieldStyle())
                        }
                        
                        VStack(alignment: .leading, spacing: 15) {
                            Text("Apellido")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            TextField("Pérez", text: $lastName)
                                .textFieldStyle(CustomTextFieldStyle())
                        }
                        
                        VStack(alignment: .leading, spacing: 15) {
                            Text("Teléfono")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            TextField("+54 11 1234-5678", text: $phone)
                                .textFieldStyle(CustomTextFieldStyle())
                                .keyboardType(.phonePad)
                        }
                    }
                    
                    // Account Information
                    Group {
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
                                    TextField("Mínimo 8 caracteres", text: $password)
                                } else {
                                    SecureField("Mínimo 8 caracteres", text: $password)
                                }
                                
                                Button(action: { showingPassword.toggle() }) {
                                    Image(systemName: showingPassword ? "eye.slash" : "eye")
                                        .foregroundColor(.secondary)
                                }
                            }
                            .textFieldStyle(CustomTextFieldStyle())
                        }
                        
                        VStack(alignment: .leading, spacing: 15) {
                            Text("Confirmar Contraseña")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            SecureField("Repetir contraseña", text: $confirmPassword)
                                .textFieldStyle(CustomTextFieldStyle())
                        }
                    }
                    
                    // Role Selection
                    VStack(alignment: .leading, spacing: 15) {
                        Text("¿Cómo quieres usar la app?")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        VStack(spacing: 10) {
                            ForEach(UserRole.allCases, id: \.self) { role in
                                RoleSelectionButton(
                                    role: role,
                                    isSelected: selectedRole == role,
                                    action: { selectedRole = role }
                                )
                            }
                        }
                    }
                }
                .padding(.horizontal)
                
                if let errorMessage = authViewModel.errorMessage {
                    Text(errorMessage)
                        .font(.caption)
                        .foregroundColor(.red)
                        .padding(.horizontal)
                }
                
                Button(action: { Task { await register() } }) {
                    if authViewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Crear Cuenta")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(isFormValid ? Color("PrimaryColor") : Color.gray)
                .foregroundColor(.white)
                .cornerRadius(10)
                .disabled(!isFormValid || authViewModel.isLoading)
                .padding(.horizontal)
                .padding(.vertical, 30)
            }
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
    
    private var isFormValid: Bool {
        !email.isEmpty &&
        !password.isEmpty &&
        password.count >= 8 &&
        password == confirmPassword &&
        !firstName.isEmpty &&
        !lastName.isEmpty &&
        !phone.isEmpty
    }
    
    private func register() async {
        await authViewModel.register(
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            role: selectedRole.rawValue
        )
        
        if authViewModel.isAuthenticated {
            dismiss()
        }
    }
}

struct RoleSelectionButton: View {
    let role: UserRole
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                VStack(alignment: .leading, spacing: 5) {
                    Text(role.displayName)
                        .font(.headline)
                    
                    Text(roleDescription)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(isSelected ? Color("PrimaryColor") : .secondary)
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(isSelected ? Color("PrimaryColor") : Color.gray.opacity(0.3), lineWidth: 2)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    private var roleDescription: String {
        switch role {
        case .tenant:
            return "Busco espacios para almacenar"
        case .host:
            return "Tengo espacios para ofrecer"
        case .both:
            return "Ambas opciones"
        }
    }
}