import axios from 'axios';

// Tạo axios instance riêng cho location service (không cần auth)
const locationApi = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

class LocationService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 phút
    this.searchCache = new Map(); // Cache cho tìm kiếm
    this.searchCacheTimeout = 2 * 60 * 1000; // 2 phút cho cache tìm kiếm
  }

  // Lấy dữ liệu từ cache hoặc API
  async getCachedData(key, fetchFunction) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const data = await fetchFunction();
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    return data;
  }

  // Lấy tất cả địa điểm từ database
  async getAllLocations() {
    try {
      const [hotels, restaurants, checkinPlaces] = await Promise.all([
        this.getHotels(),
        this.getRestaurants(),
        this.getCheckinPlaces()
      ]);

      const allLocations = [
        ...hotels.map(hotel => ({
          id: `hotel_${hotel.id}`,
          name: hotel.name,
          detail: hotel.address,
          type: 'hotel',
          rating: hotel.rating,
          price_range: hotel.price_range,
          latitude: hotel.latitude,
          longitude: hotel.longitude
        })),
        ...restaurants.map(restaurant => ({
          id: `restaurant_${restaurant.id}`,
          name: restaurant.name,
          detail: restaurant.address,
          type: 'restaurant',
          rating: restaurant.rating,
          price_range: restaurant.price_range,
          latitude: restaurant.latitude,
          longitude: restaurant.longitude
        })),
        ...checkinPlaces.map(place => ({
          id: `place_${place.id}`,
          name: place.name,
          detail: place.address,
          type: 'attraction',
          rating: place.rating,
          latitude: place.latitude,
          longitude: place.longitude
        }))
      ];

      return allLocations;
    } catch (error) {
      console.error('Error fetching all locations:', error);
      return [];
    }
  }

  // Lấy khách sạn
  async getHotels() {
    return this.getCachedData('hotels', async () => {
      console.log('🏨 Fetching hotels...');
      const response = await locationApi.get('/hotels?per_page=1000');
      console.log('🏨 Hotels fetched:', response.data.data?.length || 0);
      return response.data.data || [];
    });
  }

  // Lấy nhà hàng
  async getRestaurants() {
    return this.getCachedData('restaurants', async () => {
      console.log('🍽️ Fetching restaurants...');
      const response = await locationApi.get('/restaurants?per_page=1000');
      console.log('🍽️ Restaurants fetched:', response.data.data?.length || 0);
      
      // Debug: Kiểm tra một số nhà hàng có chứa "Cự" hoặc "Thào"
      const restaurants = response.data.data || [];
      const matchingRestaurants = restaurants.filter(r => 
        r.name.toLowerCase().includes('cự') || r.name.toLowerCase().includes('thào')
      );
      console.log('🍽️ Restaurants with "Cự" or "Thào":', matchingRestaurants.length);
      if (matchingRestaurants.length > 0) {
        console.log('🍽️ Sample matching restaurants:', matchingRestaurants.slice(0, 3).map(r => r.name));
      }
      
      return restaurants;
    });
  }

  // Lấy địa điểm tham quan
  async getCheckinPlaces() {
    return this.getCachedData('checkin_places', async () => {
      console.log('🏛️ Fetching checkin places...');
      const response = await locationApi.get('/checkin-places?per_page=1000');
      console.log('🏛️ Checkin places fetched:', response.data.data?.length || 0);
      return response.data.data || [];
    });
  }

  // Tìm kiếm địa điểm từ Google Maps
  async searchGooglePlaces(query) {
    if (!query || query.length < 2) return [];

    try {
      console.log('🗺️ Searching Google Places for:', query);
      const response = await locationApi.get('/google-places', {
        params: { query }
      });
      
      console.log('🗺️ Google Places API response:', response.data);
      
      if (response.data.success && response.data.data) {
        const places = response.data.data.map(place => ({
          id: `google_${place.place_id}`,
          name: place.name,
          detail: place.formatted_address,
          type: 'google',
          rating: place.rating || null,
          user_ratings_total: place.user_ratings_total || null,
          latitude: place.geometry?.location?.lat || null,
          longitude: place.geometry?.location?.lng || null
        }));
        console.log('🗺️ Google Places results:', places.length);
        console.log('🗺️ Sample Google place:', places[0]);
        return places;
      }
      console.log('🗺️ Google Places no results or invalid response');
      return [];
    } catch (error) {
      console.error('❌ Error searching Google Places:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      return [];
    }
  }

  // Tìm kiếm tổng hợp từ tất cả nguồn - Tối ưu hóa
  async searchLocations(query) {
    if (!query || query.length < 2) return [];

    const searchTerm = query.toLowerCase().trim();
    console.log('🔍 Searching for:', searchTerm);
    
    // Kiểm tra cache tìm kiếm
    const cacheKey = `search_${searchTerm}`;
    const cached = this.searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.searchCacheTimeout) {
      console.log('📦 Returning cached results:', cached.data.length);
      return cached.data;
    }
    
    try {
      console.log('🌐 Fetching from database and Google Maps...');
      
             // Tìm kiếm song song từ database và Google Maps
       const [dbResults, googleResults] = await Promise.all([
         this.searchDatabase(searchTerm),
         this.searchGooglePlaces(query)
       ]);

       console.log('📊 Database results:', dbResults.length);
       console.log('🗺️ Google results:', googleResults.length);
       console.log('📊 Sample DB result:', dbResults[0]);
       console.log('🗺️ Sample Google result:', googleResults[0]);

      // Kết hợp và sắp xếp kết quả
      const allResults = [...dbResults, ...googleResults];
      
      // Loại bỏ trùng lặp và sắp xếp theo độ phù hợp
      const uniqueResults = this.removeDuplicatesAndSort(allResults, searchTerm);
      
      // Đảm bảo có ít nhất một số Google Places trong kết quả
      const databaseResults = uniqueResults.filter(r => r.type !== 'google').slice(0, 15);
      const filteredGoogleResults = uniqueResults.filter(r => r.type === 'google').slice(0, 5);
      const finalResults = [...databaseResults, ...filteredGoogleResults];

             console.log('✅ Final results:', finalResults.length);
       console.log('✅ Final results by type:', {
         database: finalResults.filter(r => r.type !== 'google').length,
         google: finalResults.filter(r => r.type === 'google').length
       });
       console.log('✅ Sample final results:', finalResults.slice(0, 3).map(r => ({ name: r.name, type: r.type })));

       // Cache kết quả
       this.searchCache.set(cacheKey, {
         data: finalResults,
         timestamp: Date.now()
       });

       return finalResults;
    } catch (error) {
      console.error('❌ Error searching locations:', error);
      return [];
    }
  }

  // Tìm kiếm trong database với tối ưu hóa
  async searchDatabase(searchTerm) {
    try {
      // Lấy dữ liệu từ cache hoặc API
      const dbLocations = await this.getAllLocations();
      console.log('🔍 Search term:', searchTerm);
      console.log('🔍 Total locations in DB:', dbLocations.length);
      
      // Tìm kiếm thông minh với điểm số
      const results = dbLocations
        .map(location => {
          const nameMatch = location.name.toLowerCase();
          const detailMatch = location.detail.toLowerCase();
          const searchTermLower = searchTerm.toLowerCase();
          
          let score = 0;
          
          // Điểm cao cho tên chính xác
          if (nameMatch === searchTermLower) score += 100;
          else if (nameMatch.startsWith(searchTermLower)) score += 50;
          else if (nameMatch.includes(searchTermLower)) score += 30;
          
          // Điểm cho địa chỉ
          if (detailMatch.includes(searchTermLower)) score += 10;
          
          // Điểm cho rating
          if (location.rating) score += location.rating * 2;
          
          return { ...location, score };
        })
        .filter(location => location.score > 0)
        .sort((a, b) => b.score - a.score);

      console.log('🔍 Found results:', results.length);
      if (results.length > 0) {
        console.log('🔍 Top results:', results.slice(0, 3).map(r => ({ name: r.name, score: r.score, type: r.type })));
      }
      
      return results;
    } catch (error) {
      console.error('Error searching database:', error);
      return [];
    }
  }

  // Loại bỏ trùng lặp và sắp xếp kết quả
  removeDuplicatesAndSort(allResults, searchTerm) {
    console.log('🔄 Processing', allResults.length, 'total results');
    console.log('🔄 Results by type:', {
      database: allResults.filter(r => r.type !== 'google').length,
      google: allResults.filter(r => r.type === 'google').length
    });
    
    const uniqueResults = [];
    const seenNames = new Set();
    
    allResults.forEach(result => {
      const normalizedName = result.name.toLowerCase().trim();
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        uniqueResults.push(result);
      }
    });

    console.log('🔄 After deduplication:', uniqueResults.length, 'unique results');

    // Sắp xếp theo độ phù hợp - Đảm bảo cả database và Google đều xuất hiện
    const sortedResults = uniqueResults.sort((a, b) => {
      // Ưu tiên database hơn Google, nhưng không loại bỏ hoàn toàn Google
      if (a.type !== 'google' && b.type === 'google') return -1;
      if (a.type === 'google' && b.type !== 'google') return 1;
      
      // Sắp xếp theo điểm số nếu có
      if (a.score && b.score) return b.score - a.score;
      
      // Sắp xếp theo rating
      if (a.rating && b.rating) return b.rating - a.rating;
      
      return 0;
    });

    console.log('🔄 Final sorted results:', sortedResults.length);
    console.log('🔄 Top 3 results:', sortedResults.slice(0, 3).map(r => ({ name: r.name, type: r.type, score: r.score })));
    
    return sortedResults;
  }

  // Xóa cache
  clearCache() {
    this.cache.clear();
  }

  // Xóa cache cho một key cụ thể
  clearCacheFor(key) {
    this.cache.delete(key);
  }

  // Xóa cache tìm kiếm
  clearSearchCache() {
    this.searchCache.clear();
  }

  // Xóa tất cả cache
  clearAllCache() {
    this.cache.clear();
    this.searchCache.clear();
  }

  // Force refresh tất cả dữ liệu
  async refreshAllData() {
    console.log('🔄 Force refreshing all location data...');
    this.clearAllCache();
    return await this.getAllLocations();
  }
}

export const locationService = new LocationService();
