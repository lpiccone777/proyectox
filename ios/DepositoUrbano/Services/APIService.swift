import Foundation

class APIService {
    static let shared = APIService()
    
    private let baseURL = "http://localhost:3000/api/v1"
    private let session = URLSession.shared
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    
    private var authToken: String? {
        get { UserDefaults.standard.string(forKey: "authToken") }
        set { UserDefaults.standard.set(newValue, forKey: "authToken") }
    }
    
    private init() {
        decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
        
        encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        encoder.dateEncodingStrategy = .iso8601
    }
    
    // MARK: - Request Building
    
    private func buildRequest(
        path: String,
        method: String = "GET",
        body: Data? = nil,
        authenticated: Bool = true
    ) throws -> URLRequest {
        guard let url = URL(string: "\(baseURL)\(path)") else {
            throw NetworkError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if authenticated, let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        request.httpBody = body
        
        return request
    }
    
    // MARK: - Generic Request
    
    private func performRequest<T: Codable>(
        _ request: URLRequest,
        expecting: T.Type
    ) async throws -> T {
        do {
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw NetworkError.serverError(message: "Invalid response")
            }
            
            if httpResponse.statusCode == 401 {
                authToken = nil
                throw NetworkError.unauthorized
            }
            
            let apiResponse = try decoder.decode(APIResponse<T>.self, from: data)
            
            if apiResponse.success, let data = apiResponse.data {
                return data
            } else {
                throw NetworkError.serverError(
                    message: apiResponse.error?.message ?? "Unknown error"
                )
            }
        } catch let error as NetworkError {
            throw error
        } catch {
            throw NetworkError.networkError(error)
        }
    }
    
    // MARK: - Authentication
    
    func login(email: String, password: String) async throws -> AuthResponse {
        let loginRequest = LoginRequest(email: email, password: password)
        let body = try encoder.encode(loginRequest)
        
        let request = try buildRequest(
            path: "/auth/login",
            method: "POST",
            body: body,
            authenticated: false
        )
        
        let response = try await performRequest(request, expecting: AuthResponse.self)
        authToken = response.token
        return response
    }
    
    func register(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        phone: String,
        role: String
    ) async throws -> AuthResponse {
        let registerRequest = RegisterRequest(
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            role: role
        )
        let body = try encoder.encode(registerRequest)
        
        let request = try buildRequest(
            path: "/auth/register",
            method: "POST",
            body: body,
            authenticated: false
        )
        
        let response = try await performRequest(request, expecting: AuthResponse.self)
        authToken = response.token
        return response
    }
    
    func logout() {
        authToken = nil
    }
    
    // MARK: - User
    
    func getCurrentUser() async throws -> User {
        let request = try buildRequest(path: "/users/profile")
        return try await performRequest(request, expecting: User.self)
    }
    
    func updateProfile(
        firstName: String?,
        lastName: String?,
        phone: String?,
        profilePicture: Data?
    ) async throws -> User {
        // TODO: Implement multipart form data for image upload
        var body: [String: Any] = [:]
        if let firstName = firstName { body["firstName"] = firstName }
        if let lastName = lastName { body["lastName"] = lastName }
        if let phone = phone { body["phone"] = phone }
        
        let jsonData = try JSONSerialization.data(withJSONObject: body)
        let request = try buildRequest(
            path: "/users/profile",
            method: "PUT",
            body: jsonData
        )
        
        return try await performRequest(request, expecting: User.self)
    }
    
    // MARK: - Spaces
    
    func searchSpaces(
        latitude: Double? = nil,
        longitude: Double? = nil,
        radius: Int = 5,
        type: SpaceType? = nil,
        minPrice: Double? = nil,
        maxPrice: Double? = nil,
        city: String? = nil,
        page: Int = 1,
        limit: Int = 20
    ) async throws -> [Space] {
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "page", value: "\(page)"),
            URLQueryItem(name: "limit", value: "\(limit)")
        ]
        
        if let lat = latitude { queryItems.append(URLQueryItem(name: "lat", value: "\(lat)")) }
        if let lng = longitude { queryItems.append(URLQueryItem(name: "lng", value: "\(lng)")) }
        queryItems.append(URLQueryItem(name: "radius", value: "\(radius)"))
        if let type = type { queryItems.append(URLQueryItem(name: "type", value: type.rawValue)) }
        if let minPrice = minPrice { queryItems.append(URLQueryItem(name: "minPrice", value: "\(minPrice)")) }
        if let maxPrice = maxPrice { queryItems.append(URLQueryItem(name: "maxPrice", value: "\(maxPrice)")) }
        if let city = city { queryItems.append(URLQueryItem(name: "city", value: city)) }
        
        var components = URLComponents(string: "\(baseURL)/spaces")!
        components.queryItems = queryItems
        
        var request = URLRequest(url: components.url!)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        return try await performRequest(request, expecting: [Space].self)
    }
    
    func getSpace(id: Int) async throws -> Space {
        let request = try buildRequest(path: "/spaces/\(id)")
        return try await performRequest(request, expecting: Space.self)
    }
    
    // MARK: - Bookings
    
    func getMyBookings(role: String? = nil, status: BookingStatus? = nil) async throws -> [Booking] {
        var queryItems: [URLQueryItem] = []
        if let role = role { queryItems.append(URLQueryItem(name: "role", value: role)) }
        if let status = status { queryItems.append(URLQueryItem(name: "status", value: status.rawValue)) }
        
        var components = URLComponents(string: "\(baseURL)/bookings")!
        if !queryItems.isEmpty {
            components.queryItems = queryItems
        }
        
        var request = URLRequest(url: components.url!)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        return try await performRequest(request, expecting: [Booking].self)
    }
    
    func createBooking(
        spaceId: Int,
        startDate: Date,
        endDate: Date,
        specialInstructions: String?
    ) async throws -> Booking {
        let createRequest = CreateBookingRequest(
            spaceId: spaceId,
            startDate: startDate,
            endDate: endDate,
            specialInstructions: specialInstructions
        )
        let body = try encoder.encode(createRequest)
        
        let request = try buildRequest(
            path: "/bookings",
            method: "POST",
            body: body
        )
        
        return try await performRequest(request, expecting: Booking.self)
    }
}