import 'package:flutter/material.dart';
import '../data/models/hospital_model.dart';
import '../data/repositories/hospital_repository.dart';

class HospitalProvider extends ChangeNotifier {
  final HospitalRepository _repository = HospitalRepository();

  List<HospitalModel> _hospitals = [];
  String _searchQuery = "";
  bool _isLoading = false;
  String? _error;
  VoidCallback? _onStatsRefresh;

  List<HospitalModel> get hospitals {
    if (_searchQuery.isEmpty) return _hospitals;
    return _hospitals.where((h) {
      final nameMatches = h.name.toLowerCase().contains(
        _searchQuery.toLowerCase(),
      );
      final cityMatches = h.city.toLowerCase().contains(
        _searchQuery.toLowerCase(),
      );
      return nameMatches || cityMatches;
    }).toList();
  }

  bool get isLoading => _isLoading;
  String? get error => _error;

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void setStatsRefreshCallback(VoidCallback callback) {
    _onStatsRefresh = callback;
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }

  Future<void> loadHospitals() async {
    _setLoading(true);
    _clearError();
    try {
      _hospitals = await _repository.fetchHospitals();
      notifyListeners();
    } catch (e) {
      _error = _parseError(e);
      notifyListeners();
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> addHospital(
    String name,
    String type,
    String address,
    String city,
  ) async {
    _setLoading(true);
    _clearError();
    try {
      await _repository.addHospital(name, type, address, city);
      await loadHospitals();
      _triggerStatsRefresh();
    } catch (e) {
      _error = _parseError(e);
      notifyListeners();
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> removeHospital(String id) async {
    _setLoading(true);
    _clearError();
    try {
      await _repository.deleteHospital(id);

      _hospitals.removeWhere((hospital) => hospital.id == id);
      notifyListeners();

      await loadHospitals();
      _triggerStatsRefresh();
    } catch (e) {
      _error = _parseError(e);
      notifyListeners();
      await loadHospitals();
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  void _triggerStatsRefresh() {
    _onStatsRefresh?.call();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  String _parseError(dynamic error) {
    if (error is Map && error['message'] != null) {
      final message = error['message'] as String;
      final code = error['code'] as String?;

      switch (code) {
        case 'ACTIVE_TICKETS_EXIST':
          final details = error['details'] as Map<String, dynamic>?;
          final count = details?['activeTicketsCount'] as int? ?? 0;
          return 'Cannot delete hospital with $count active ${count == 1 ? 'ticket' : 'tickets'}. Please resolve or reassign all active tickets before deleting this hospital.';
        case 'HOSPITAL_NOT_FOUND':
          return 'Hospital not found. It may have already been deleted.';
        case 'INVALID_HOSPITAL_ID':
          return 'Invalid hospital ID. Please try again.';
        case 'DELETION_FAILED':
          return 'Failed to delete hospital. Please try again.';
        default:
          return message;
      }
    }

    if (error is String) {
      return error;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  HospitalModel? getHospitalById(String id) {
    try {
      return _hospitals.firstWhere((hospital) => hospital.id == id);
    } catch (e) {
      return null;
    }
  }

  bool canDeleteHospital(String id) {
    return true;
  }
}
