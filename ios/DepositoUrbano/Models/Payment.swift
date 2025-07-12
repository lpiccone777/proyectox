import Foundation

struct Payment: Codable, Identifiable {
    let id: Int
    let bookingId: Int
    let mercadopagoPaymentId: String
    let amount: Double
    let currency: String
    let status: PaymentTransactionStatus
    let paymentMethod: String?
    let payerEmail: String?
    let processedAt: Date?
    let refundedAt: Date?
    let refundAmount: Double?
    let createdAt: Date?
    let updatedAt: Date?
}

enum PaymentTransactionStatus: String, Codable {
    case pending = "pending"
    case approved = "approved"
    case rejected = "rejected"
    case cancelled = "cancelled"
    case refunded = "refunded"
    
    var displayName: String {
        switch self {
        case .pending:
            return "Pendiente"
        case .approved:
            return "Aprobado"
        case .rejected:
            return "Rechazado"
        case .cancelled:
            return "Cancelado"
        case .refunded:
            return "Reembolsado"
        }
    }
}

struct PaymentPreference: Codable {
    let id: String
    let initPoint: String
    let sandboxInitPoint: String?
    
    private enum CodingKeys: String, CodingKey {
        case id
        case initPoint = "init_point"
        case sandboxInitPoint = "sandbox_init_point"
    }
}