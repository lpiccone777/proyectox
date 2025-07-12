import SwiftUI
import MapKit

struct SpaceSearchView: View {
    @StateObject private var viewModel = SpaceSearchViewModel()
    @State private var showingFilters = false
    @State private var showingMap = false
    
    var body: some View {
        NavigationView {
            ZStack {
                if showingMap {
                    SpaceMapView(spaces: viewModel.spaces)
                        .ignoresSafeArea(edges: .top)
                } else {
                    SpaceListView(spaces: viewModel.spaces)
                }
                
                VStack {
                    Spacer()
                    
                    // Toggle Map/List Button
                    HStack {
                        Spacer()
                        
                        Button(action: { showingMap.toggle() }) {
                            Image(systemName: showingMap ? "list.bullet" : "map")
                                .font(.title2)
                                .foregroundColor(.white)
                                .frame(width: 56, height: 56)
                                .background(Color("PrimaryColor"))
                                .clipShape(Circle())
                                .shadow(radius: 4)
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Buscar Espacios")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingFilters = true }) {
                        Image(systemName: "slider.horizontal.3")
                    }
                }
            }
            .sheet(isPresented: $showingFilters) {
                SpaceFiltersView(viewModel: viewModel)
            }
            .onAppear {
                viewModel.searchSpaces()
            }
        }
    }
}

struct SpaceListView: View {
    let spaces: [Space]
    @EnvironmentObject var navigationViewModel: NavigationViewModel
    
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                ForEach(spaces) { space in
                    SpaceCardView(space: space)
                        .onTapGesture {
                            navigationViewModel.navigateToSpaceDetail(space)
                        }
                }
            }
            .padding()
        }
        .sheet(item: $navigationViewModel.showingSpaceDetail) { space in
            NavigationView {
                SpaceDetailView(space: space)
            }
        }
    }
}

struct SpaceCardView: View {
    let space: Space
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Image
            AsyncImage(url: URL(string: space.mainImageUrl ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .foregroundColor(.gray.opacity(0.2))
                    .overlay(
                        Image(systemName: space.type.icon)
                            .font(.largeTitle)
                            .foregroundColor(.gray)
                    )
            }
            .frame(height: 200)
            .clipped()
            
            // Content
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Label(space.type.displayName, systemImage: space.type.icon)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    if let rating = space.averageRating, rating > 0 {
                        HStack(spacing: 4) {
                            Image(systemName: "star.fill")
                                .font(.caption)
                                .foregroundColor(.yellow)
                            Text(String(format: "%.1f", rating))
                                .font(.caption)
                                .fontWeight(.medium)
                        }
                    }
                }
                
                Text(space.title)
                    .font(.headline)
                    .lineLimit(2)
                
                HStack {
                    Image(systemName: "location.circle")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Text("\(space.city), \(space.province)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                HStack {
                    Text("$\(Int(space.pricePerMonth))")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(Color("PrimaryColor"))
                    
                    Text("/mes")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    Text("\(Int(space.size)) m²")
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(4)
                }
            }
            .padding()
        }
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
    }
}