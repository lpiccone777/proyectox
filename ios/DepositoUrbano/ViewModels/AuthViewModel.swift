import Foundation
import SwiftUI

@MainActor
class AuthViewModel: ObservableObject {
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = APIService.shared
    
    init() {
        checkAuthStatus()
    }
    
    func checkAuthStatus() {
        guard UserDefaults.standard.string(forKey: "authToken") != nil else {
            isAuthenticated = false
            currentUser = nil
            return
        }
        
        Task {
            await loadCurrentUser()
        }
    }
    
    func login(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let response = try await apiService.login(email: email, password: password)
            currentUser = response.user
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
            isAuthenticated = false
        }
        
        isLoading = false
    }
    
    func register(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        phone: String,
        role: String
    ) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let response = try await apiService.register(
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                role: role
            )
            currentUser = response.user
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
            isAuthenticated = false
        }
        
        isLoading = false
    }
    
    func logout() {
        apiService.logout()
        currentUser = nil
        isAuthenticated = false
    }
    
    private func loadCurrentUser() async {
        isLoading = true
        
        do {
            currentUser = try await apiService.getCurrentUser()
            isAuthenticated = true
        } catch {
            if case NetworkError.unauthorized = error {
                logout()
            }
        }
        
        isLoading = false
    }
}