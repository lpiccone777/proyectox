import Foundation

struct User: Codable, Identifiable {
    let id: Int
    let email: String
    let firstName: String
    let lastName: String
    let phone: String
    let role: UserRole
    let profilePicture: String?
    let verifiedEmail: Bool
    let verifiedPhone: Bool
    let createdAt: Date?
    
    var fullName: String {
        "\(firstName) \(lastName)"
    }
    
    var isHost: Bool {
        role == .host || role == .both
    }
    
    var isTenant: Bool {
        role == .tenant || role == .both
    }
}

enum UserRole: String, Codable, CaseIterable {
    case host = "host"
    case tenant = "tenant"
    case both = "both"
    
    var displayName: String {
        switch self {
        case .host:
            return "Anfitrión"
        case .tenant:
            return "Inquilino"
        case .both:
            return "Anfitrión e Inquilino"
        }
    }
}

struct AuthResponse: Codable {
    let user: User
    let token: String
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct RegisterRequest: Codable {
    let email: String
    let password: String
    let firstName: String
    let lastName: String
    let phone: String
    let role: String
}