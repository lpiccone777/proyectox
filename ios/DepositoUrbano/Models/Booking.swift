import Foundation

struct Booking: Codable, Identifiable {
    let id: Int
    let spaceId: Int
    let tenantId: Int
    let startDate: Date
    let endDate: Date
    let totalPrice: Double
    let status: BookingStatus
    let paymentStatus: PaymentStatus
    let specialInstructions: String?
    let cancellationReason: String?
    let createdAt: Date?
    let updatedAt: Date?
    
    // Relations
    let space: Space?
    let tenant: User?
    let payment: Payment?
    
    var durationInDays: Int {
        Calendar.current.dateComponents([.day], from: startDate, to: endDate).day ?? 0
    }
    
    var isActive: Bool {
        status == .confirmed && endDate > Date()
    }
}

enum BookingStatus: String, Codable, CaseIterable {
    case pending = "pending"
    case confirmed = "confirmed"
    case cancelled = "cancelled"
    case completed = "completed"
    
    var displayName: String {
        switch self {
        case .pending:
            return "Pendiente"
        case .confirmed:
            return "Confirmada"
        case .cancelled:
            return "Cancelada"
        case .completed:
            return "Completada"
        }
    }
    
    var color: String {
        switch self {
        case .pending:
            return "orange"
        case .confirmed:
            return "green"
        case .cancelled:
            return "red"
        case .completed:
            return "blue"
        }
    }
}

enum PaymentStatus: String, Codable {
    case pending = "pending"
    case paid = "paid"
    case refunded = "refunded"
    
    var displayName: String {
        switch self {
        case .pending:
            return "Pendiente"
        case .paid:
            return "Pagado"
        case .refunded:
            return "Reembolsado"
        }
    }
}

struct CreateBookingRequest: Codable {
    let spaceId: Int
    let startDate: Date
    let endDate: Date
    let specialInstructions: String?
}

struct UpdateBookingStatusRequest: Codable {
    let status: String
    let cancellationReason: String?
}