import Foundation
import SwiftUI

@MainActor
class NavigationViewModel: ObservableObject {
    @Published var selectedTab = 0
    @Published var showingSpaceDetail: Space?
    @Published var showingBookingDetail: Booking?
    @Published var showingCreateSpace = false
    @Published var showingCreateBooking = false
    @Published var showingPaymentWebView = false
    
    func navigateToSpaceDetail(_ space: Space) {
        showingSpaceDetail = space
    }
    
    func navigateToBookingDetail(_ booking: Booking) {
        showingBookingDetail = booking
    }
    
    func navigateToTab(_ index: Int) {
        selectedTab = index
    }
    
    func dismissAll() {
        showingSpaceDetail = nil
        showingBookingDetail = nil
        showingCreateSpace = false
        showingCreateBooking = false
        showingPaymentWebView = false
    }
}