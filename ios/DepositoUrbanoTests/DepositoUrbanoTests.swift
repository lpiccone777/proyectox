import XCTest
@testable import DepositoUrbano

final class DepositoUrbanoTests: XCTestCase {
    
    func testUserModelDecoding() throws {
        let json = """
        {
            "id": 1,
            "email": "test@example.com",
            "firstName": "Test",
            "lastName": "User",
            "phone": "+1234567890",
            "role": "tenant",
            "profileImageUrl": null,
            "isVerified": true,
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        }
        """.data(using: .utf8)!
        
        let user = try JSONDecoder().decode(User.self, from: json)
        
        XCTAssertEqual(user.id, 1)
        XCTAssertEqual(user.email, "test@example.com")
        XCTAssertEqual(user.firstName, "Test")
        XCTAssertEqual(user.lastName, "User")
        XCTAssertEqual(user.role, .tenant)
        XCTAssertTrue(user.isVerified)
    }
    
    func testSpaceModelDecoding() throws {
        let json = """
        {
            "id": 1,
            "hostId": 2,
            "title": "Test Space",
            "description": "A test space",
            "type": "garage",
            "size": 20.5,
            "pricePerMonth": 300.0,
            "pricePerDay": 15.0,
            "latitude": 40.7128,
            "longitude": -74.0060,
            "address": "123 Test St",
            "city": "New York",
            "province": "NY",
            "postalCode": "10001",
            "features": ["24/7 Access", "Security"],
            "rules": ["No smoking"],
            "isActive": true,
            "images": [],
            "averageRating": 4.5,
            "totalReviews": 10,
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z"
        }
        """.data(using: .utf8)!
        
        let space = try JSONDecoder().decode(Space.self, from: json)
        
        XCTAssertEqual(space.id, 1)
        XCTAssertEqual(space.title, "Test Space")
        XCTAssertEqual(space.type, .garage)
        XCTAssertEqual(space.size, 20.5)
        XCTAssertEqual(space.pricePerMonth, 300.0)
        XCTAssertEqual(space.features.count, 2)
        XCTAssertEqual(space.averageRating, 4.5)
    }
    
    func testLoginRequestEncoding() throws {
        let loginRequest = LoginRequest(email: "test@example.com", password: "password123")
        let encoder = JSONEncoder()
        let data = try encoder.encode(loginRequest)
        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        
        XCTAssertEqual(json?["email"] as? String, "test@example.com")
        XCTAssertEqual(json?["password"] as? String, "password123")
    }
    
    func testBookingStatusDisplayName() {
        XCTAssertEqual(BookingStatus.pending.displayName, "Pendiente")
        XCTAssertEqual(BookingStatus.confirmed.displayName, "Confirmada")
        XCTAssertEqual(BookingStatus.cancelled.displayName, "Cancelada")
        XCTAssertEqual(BookingStatus.completed.displayName, "Completada")
    }
    
    func testSpaceTypeDisplayName() {
        XCTAssertEqual(SpaceType.garage.displayName, "Garaje")
        XCTAssertEqual(SpaceType.storageRoom.displayName, "Trastero")
        XCTAssertEqual(SpaceType.closet.displayName, "Armario")
        XCTAssertEqual(SpaceType.basement.displayName, "Sótano")
        XCTAssertEqual(SpaceType.attic.displayName, "Altillo")
        XCTAssertEqual(SpaceType.shed.displayName, "Galpón")
        XCTAssertEqual(SpaceType.other.displayName, "Otro")
    }
}

// MARK: - AuthViewModel Tests
final class AuthViewModelTests: XCTestCase {
    var viewModel: AuthViewModel!
    var mockAPIService: MockAPIService!
    
    override func setUp() {
        super.setUp()
        mockAPIService = MockAPIService()
        viewModel = AuthViewModel()
        // Inject mock service (would need dependency injection in real implementation)
    }
    
    func testLoginSuccess() async {
        // Given
        let expectedUser = User(
            id: 1,
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            phone: "+1234567890",
            role: .tenant,
            profileImageUrl: nil,
            isVerified: true,
            createdAt: Date(),
            updatedAt: Date()
        )
        mockAPIService.mockUser = expectedUser
        mockAPIService.mockToken = "mock-token"
        
        // When
        await viewModel.login(email: "test@example.com", password: "password123")
        
        // Then
        XCTAssertTrue(viewModel.isAuthenticated)
        XCTAssertEqual(viewModel.currentUser?.email, expectedUser.email)
        XCTAssertNil(viewModel.errorMessage)
    }
    
    func testLoginFailure() async {
        // Given
        mockAPIService.shouldFail = true
        mockAPIService.mockError = "Invalid credentials"
        
        // When
        await viewModel.login(email: "test@example.com", password: "wrongpassword")
        
        // Then
        XCTAssertFalse(viewModel.isAuthenticated)
        XCTAssertNil(viewModel.currentUser)
        XCTAssertEqual(viewModel.errorMessage, "Invalid credentials")
    }
}

// MARK: - Mock API Service
class MockAPIService: APIServiceProtocol {
    var mockUser: User?
    var mockToken: String?
    var mockError: String?
    var shouldFail = false
    
    func login(email: String, password: String) async throws -> (user: User, token: String) {
        if shouldFail {
            throw APIError.custom(mockError ?? "Error")
        }
        return (mockUser!, mockToken!)
    }
    
    func register(request: RegisterRequest) async throws -> (user: User, token: String) {
        if shouldFail {
            throw APIError.custom(mockError ?? "Error")
        }
        return (mockUser!, mockToken!)
    }
    
    func getCurrentUser() async throws -> User {
        if shouldFail {
            throw APIError.custom(mockError ?? "Error")
        }
        return mockUser!
    }
}

// Protocol for dependency injection
protocol APIServiceProtocol {
    func login(email: String, password: String) async throws -> (user: User, token: String)
    func register(request: RegisterRequest) async throws -> (user: User, token: String)
    func getCurrentUser() async throws -> User
}

enum APIError: Error {
    case custom(String)
}