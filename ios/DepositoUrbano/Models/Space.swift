import Foundation
import CoreLocation

struct Space: Codable, Identifiable {
    let id: Int
    let hostId: Int
    let title: String
    let description: String
    let type: SpaceType
    let address: String
    let city: String
    let province: String
    let postalCode: String
    let latitude: Double
    let longitude: Double
    let size: Double
    let pricePerMonth: Double
    let pricePerDay: Double?
    let available: Bool
    let features: [String]
    let rules: String?
    let minBookingDays: Int
    let maxBookingDays: Int?
    let createdAt: Date?
    let updatedAt: Date?
    
    // Relations
    let host: User?
    let images: [SpaceImage]?
    let averageRating: Double?
    let reviewCount: Int?
    
    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
    
    var mainImageUrl: String? {
        images?.first?.url
    }
}

enum SpaceType: String, Codable, CaseIterable {
    case room = "room"
    case garage = "garage"
    case warehouse = "warehouse"
    case locker = "locker"
    case other = "other"
    
    var displayName: String {
        switch self {
        case .room:
            return "Habitación"
        case .garage:
            return "Garage"
        case .warehouse:
            return "Depósito"
        case .locker:
            return "Baulera"
        case .other:
            return "Otro"
        }
    }
    
    var icon: String {
        switch self {
        case .room:
            return "bed.double.fill"
        case .garage:
            return "car.fill"
        case .warehouse:
            return "shippingbox.fill"
        case .locker:
            return "lock.fill"
        case .other:
            return "questionmark.square.fill"
        }
    }
}

struct SpaceImage: Codable, Identifiable {
    let id: Int
    let spaceId: Int
    let url: String
    let order: Int
}