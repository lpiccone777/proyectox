import Foundation

struct Review: Codable, Identifiable {
    let id: Int
    let bookingId: Int
    let spaceId: Int
    let reviewerId: Int
    let reviewedId: Int
    let reviewType: ReviewType
    let rating: Int
    let comment: String
    let createdAt: Date?
    let updatedAt: Date?
    
    // Relations
    let reviewer: User?
    let reviewed: User?
    let space: Space?
    let booking: Booking?
}

enum ReviewType: String, Codable {
    case hostToTenant = "host_to_tenant"
    case tenantToHost = "tenant_to_host"
    case tenantToSpace = "tenant_to_space"
    
    var displayName: String {
        switch self {
        case .hostToTenant:
            return "Anfitrión a Inquilino"
        case .tenantToHost:
            return "Inquilino a Anfitrión"
        case .tenantToSpace:
            return "Inquilino a Espacio"
        }
    }
}

struct CreateReviewRequest: Codable {
    let bookingId: Int
    let reviewType: String
    let rating: Int
    let comment: String
}