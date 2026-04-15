import 'package:flutter/material.dart';
import '../data/models/ticket_model.dart';
import '../data/repositories/ticket_repository.dart';
import '../services/socket_service.dart';

class TicketProvider extends ChangeNotifier {
  final TicketRepository _repository = TicketRepository();

  List<TicketModel> _tickets = [];
  List<TicketModel> _pendingTickets = [];
  Map<String, dynamic> _stats = {};
  String _searchQuery = "";
  bool _isLoading = false;
  bool _isAdmin = false;
  bool _isDisposed = false;
  String? _error;

  List<TicketModel> get tickets {
    if (_searchQuery.isEmpty) return _tickets;
    return _tickets
        .where(
          (t) =>
              t.issueTitle.toLowerCase().contains(_searchQuery.toLowerCase()) ||
              t.caseNumber.toLowerCase().contains(_searchQuery.toLowerCase()),
        )
        .toList();
  }

  List<TicketModel> get pendingTickets => _pendingTickets;
  Map<String, dynamic> get stats => _stats;
  bool get isLoading => _isLoading;
  String? get error => _error;

  TicketProvider() {
    _initSocketListeners();
  }

  void _initSocketListeners() {
    SocketService.instance.addTicketCreatedListener(_onTicketCreated);
    SocketService.instance.addTicketAssignedListener(_onTicketAssigned);
  }

  void _onTicketCreated(Map<String, dynamic> data) {
    debugPrint("TicketProvider: Received ticket_created event");
    if (_isDisposed) return;
    // Reload appropriate ticket list based on admin mode
    if (_isAdmin) {
      loadAdminTickets();
    } else {
      loadTickets();
    }
  }

  void _onTicketAssigned(Map<String, dynamic> data) {
    debugPrint("TicketProvider: Received ticket_assigned event");
    if (_isDisposed) return;
    // Reload appropriate ticket list based on admin mode
    if (_isAdmin) {
      loadAdminTickets();
    } else {
      loadTickets();
    }
    loadPendingTickets();
  }

  void setAdminMode(bool isAdmin) {
    _isAdmin = isAdmin;
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  Future<void> loadTickets() async {
    if (_isDisposed) return;
    _setLoading(true);
    _error = null;
    try {
      _tickets = await _repository.fetchTickets();
      debugPrint("TicketProvider: Loaded ${_tickets.length} tickets");
      if (!_isDisposed) notifyListeners();
    } catch (e) {
      debugPrint("TicketProvider: Error loading tickets: $e");
      _error = e.toString();
      if (!_isDisposed) notifyListeners();
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadAdminTickets() async {
    if (_isDisposed) return;
    _setLoading(true);
    _error = null;
    try {
      _tickets = await _repository.fetchAdminTickets();
      debugPrint("TicketProvider: Loaded ${_tickets.length} admin tickets");
      if (!_isDisposed) notifyListeners();
    } catch (e) {
      debugPrint("TicketProvider: Error loading admin tickets: $e");
      _error = e.toString();
      if (!_isDisposed) notifyListeners();
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadPendingTickets() async {
    if (_isDisposed) return;
    try {
      _pendingTickets = await _repository.fetchPendingTickets();
      if (!_isDisposed) notifyListeners();
    } catch (e) {
      debugPrint("TicketProvider: Error loading pending tickets: $e");
    }
  }

  Future<TicketModel> createTicket(
    String issueTitle,
    String description, {
    String priority = 'medium',
    String category = 'general_inquiry',
    String? hospitalId,
  }) async {
    if (_isDisposed) throw Exception('Provider disposed');
    _setLoading(true);
    _error = null;
    try {
      debugPrint(
        "TicketProvider: Creating ticket with hospitalId: $hospitalId",
      );

      final ticket = await _repository.createTicket(
        issueTitle,
        description,
        priority: priority,
        category: category,
        hospitalId: hospitalId,
      );

      // FIX: Add to local list and reload to ensure consistency
      _tickets.insert(0, ticket);
      if (!_isDisposed) notifyListeners();

      // Full reload to get latest data from server
      if (_isAdmin) {
        await loadAdminTickets();
      } else {
        await loadTickets();
      }

      debugPrint(
        "TicketProvider: Ticket created and list updated successfully",
      );

      return ticket;
    } catch (e) {
      debugPrint("TicketProvider: Error in createTicket: $e");
      _error = _parseTicketError(e);
      if (!_isDisposed) notifyListeners();
      throw _error!;
    } finally {
      _setLoading(false);
    }
  }

  String _parseTicketError(dynamic error) {
    if (error is Map) {
      final message = error['message'] as String?;
      final code = error['code'] as String?;

      switch (code) {
        case 'MISSING_TITLE':
          return 'Please enter an issue title';
        case 'MISSING_DESCRIPTION':
          return 'Please enter a description';
        case 'MISSING_HOSPITAL_ID':
          return 'Please select a hospital before creating a ticket';
        case 'VALIDATION_ERROR':
          if (error['details'] is List && error['details'].isNotEmpty) {
            final details = error['details'] as List;
            return details
                .map((detail) => detail['message'] as String)
                .join(', ');
          }
          return 'Please check all required fields';
        case 'DUPLICATE_CASE_NUMBER':
        case 'CASE_NUMBER_CONFLICT':
          return 'Case number conflict. Please try again.';
        case 'INVALID_DATA':
          return 'Invalid ticket data provided';
        case 'AUTHENTICATION_REQUIRED':
          return 'Please login to create a ticket';
        case 'SERVER_ERROR':
          return 'Server error occurred. Please try again later.';
        case 'NETWORK_ERROR':
          return 'Network connection error. Please check your internet.';
        default:
          return message ?? 'Failed to create ticket';
      }
    }

    // Handle string errors
    if (error is String) {
      if (error.contains('401')) {
        return 'Session expired. Please login again.';
      }
      if (error.contains('404')) {
        return 'Resource not found. Please try again.';
      }
      if (error.contains('SocketException') || error.contains('Connection')) {
        return 'Network error. Please check your connection.';
      }
    }

    return error.toString();
  }

  Future<void> assignTicket(String ticketId, String adminId) async {
    if (_isDisposed) throw Exception('Provider disposed');
    _setLoading(true);
    _error = null;
    try {
      await _repository.assignTicket(ticketId, adminId);
      // Reload to get updated data
      if (_isAdmin) {
        await loadAdminTickets();
      } else {
        await loadTickets();
      }
      await loadPendingTickets();
    } catch (e) {
      debugPrint("TicketProvider: Error assigning ticket: $e");
      _error = e.toString();
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> updateStatus(
    String id,
    String status,
    bool assignCaseNumber,
  ) async {
    if (_isDisposed) throw Exception('Provider disposed');
    _setLoading(true);
    _error = null;
    try {
      await _repository.updateTicket(id, status, assignCaseNumber);

      // Reload to get updated data
      if (_isAdmin) {
        await loadAdminTickets();
      } else {
        await loadTickets();
      }
    } catch (e) {
      debugPrint("TicketProvider: Error updating status: $e");
      _error = e.toString();
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> replyToTicket(
    String ticketId,
    Map<String, dynamic> replyData,
  ) async {
    if (_isDisposed) throw Exception('Provider disposed');
    _setLoading(true);
    _error = null;
    try {
      await _repository.replyToTicket(ticketId, replyData);

      // Reload to get updated data
      if (_isAdmin) {
        await loadAdminTickets();
      } else {
        await loadTickets();
      }
    } catch (e) {
      debugPrint("TicketProvider: Error replying to ticket: $e");
      _error = e.toString();
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> deleteTicket(String id) async {
    if (_isDisposed) throw Exception('Provider disposed');
    _setLoading(true);
    _error = null;
    try {
      await _repository.deleteTicket(id);

      // Remove from local list
      _tickets.removeWhere((t) => t.id == id);
      if (!_isDisposed) notifyListeners();
    } catch (e) {
      debugPrint("TicketProvider: Error deleting ticket: $e");
      _error = e.toString();
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadStats() async {
    if (_isDisposed) return;
    _setLoading(true);
    try {
      _stats = await _repository.fetchStats();
      if (!_isDisposed) notifyListeners();
    } catch (e) {
      debugPrint("TicketProvider: Error loading stats: $e");
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<TicketModel> getTicketDetails(String ticketId) async {
    _setLoading(true);
    _error = null;
    try {
      final ticket = await _repository.fetchTicketDetails(ticketId);
      return ticket;
    } catch (e) {
      debugPrint("TicketProvider: Error getting ticket details: $e");
      _error = e.toString();
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
  }

  @override
  void dispose() {
    _isDisposed = true;
    SocketService.instance.removeTicketCreatedListener(_onTicketCreated);
    SocketService.instance.removeTicketAssignedListener(_onTicketAssigned);
    super.dispose();
  }
}
