import 'package:flutter/foundation.dart';
import '../data/models/dashboard_stats.dart';
import '../data/repositories/dashboard_repository.dart';
import '../services/socket_service.dart';

class DashboardProvider extends ChangeNotifier {
  final DashboardRepository _repository = DashboardRepository();

  DashboardStats _stats = DashboardStats.empty();
  bool _isLoading = false;
  String? _error;
  bool _isInitialized = false;

  DashboardStats get stats => _stats;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isInitialized => _isInitialized;

  int get totalUsers => _stats.totalUsers;
  int get activeAdmins => _stats.activeAdmins;
  int get totalTickets => _stats.totalTickets;
  int get totalHospitals => _stats.totalHospitals;
  Map<String, int> get statsByType => _stats.statsByType;

  void initialize() {
    if (_isInitialized) return;
    _isInitialized = true;

    SocketService.instance.connect();
    SocketService.instance.addDashboardListener(_onDashboardUpdate);
    loadStats();
  }

  void _onDashboardUpdate(Map<String, dynamic> data) {
    debugPrint('DashboardProvider: Received real-time update: $data');
    _stats = DashboardStats.fromJson(data);
    notifyListeners();
  }

  Future<void> loadStats() async {
    _setLoading(true);
    _clearError();
    try {
      debugPrint('DashboardProvider: Loading stats...');
      _stats = await _repository.fetchDashboardStats();
      debugPrint('DashboardProvider: Stats loaded: ${_stats.totalUsers} users');
      notifyListeners();
    } catch (e) {
      debugPrint('DashboardProvider: Error loading stats: $e');
      _error = 'Failed to load dashboard stats';
      _stats = DashboardStats.empty();
      notifyListeners();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> refreshStats() async {
    await loadStats();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
  }

  @override
  void dispose() {
    SocketService.instance.removeDashboardListener(_onDashboardUpdate);
    super.dispose();
  }
}
