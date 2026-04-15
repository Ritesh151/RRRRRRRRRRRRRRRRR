import 'package:flutter/foundation.dart';
import '../../services/api_service.dart';
import '../models/dashboard_stats.dart';
import '../../core/constants/app_constants.dart';

class DashboardRepository {
  final ApiService _apiService = ApiService();

  Future<DashboardStats> fetchDashboardStats() async {
    try {
      debugPrint(
        'DashboardRepository: Fetching stats from ${AppConstants.dashboardStats}',
      );
      final response = await _apiService.get(AppConstants.dashboardStats);
      debugPrint('DashboardRepository: Response received: ${response.data}');
      return DashboardStats.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      debugPrint('DashboardRepository: Error fetching stats: $e');
      rethrow;
    }
  }
}
