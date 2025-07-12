import Foundation

struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T?
    let error: APIError?
    let meta: PaginationMeta?
}

struct APIError: Codable {
    let code: String
    let message: String
    let details: [String: String]?
}

struct PaginationMeta: Codable {
    let page: Int
    let limit: Int
    let total: Int
    let totalPages: Int
}

enum NetworkError: LocalizedError {
    case invalidURL
    case noData
    case decodingError
    case serverError(message: String)
    case unauthorized
    case networkError(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "URL inválida"
        case .noData:
            return "No se recibieron datos"
        case .decodingError:
            return "Error al procesar los datos"
        case .serverError(let message):
            return message
        case .unauthorized:
            return "No autorizado. Por favor, inicia sesión nuevamente"
        case .networkError(let error):
            return error.localizedDescription
        }
    }
}