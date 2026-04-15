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

  List<TicketModel> get tickets {
    if (_searchQuery.isEmpty) return _tickets;
    return _tickets
        .where(
          (t) =>
              t.issueTitle.toLowerCase().contains(_searchQuery.toLowerCase()) ||
              t.patientId.toLowerCase().contains(_searchQuery.toLowerCase()),
        )
        .toList();
  }

  List<TicketModel> get pendingTickets => _pendingTickets;
  Map<String, dynamic> get stats => _stats;
  bool get isLoading => _isLoading;

  TicketProvider() {
    _initSocketListeners();
  }

  void _initSocketListeners() {
    SocketService.instance.addTicketCreatedListener(_onTicketCreated);
    SocketService.instance.addTicketAssignedListener(_onTicketAssigned);
  }

  void _onTicketCreated(Map<String, dynamic> data) {
    debugPrint("TicketProvider: Received ticket_created event");
    loadTickets();
    if (_isAdmin) {
      loadAdminTickets();
    }
  }

  void _onTicketAssigned(Map<String, dynamic> data) {
    debugPrint("TicketProvider: Received ticket_assigned event");
    loadTickets();
    if (_isAdmin) {
      loadAdminTickets();
    }
    loadPendingTickets();
  }

  void setAdminMode(bool isAdmin) {
    _isAdmin = isAdmin;
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  Future<void> loadTickets() async {
    _setLoading(true);
    try {
      _tickets = await _repository.fetchTickets();
      notifyListeners();
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadAdminTickets() async {
    _setLoading(true);
    try {
      _tickets = await _repository.fetchAdminTickets();
      debugPrint("TicketProvider: Loaded ${_tickets.length} admin tickets");
      notifyListeners();
    } catch (e) {
      debugPrint("TicketProvider: Error loading admin tickets: $e");
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadPendingTickets() async {
    _setLoading(true);
    try {
      _pendingTickets = await _repository.fetchPendingTickets();
      notifyListeners();
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> createTicket(
    String issueTitle,
    String description, {
    String priority = 'medium',
    String category = 'general_inquiry',
    String? hospitalId,
  }) async {
    _setLoading(true);
    try {
      debugPrint(
        "TicketProvider: Creating ticket with hospitalId: $hospitalId",
      );

      await _repository.createTicket(
        issueTitle,
        description,
        priority: priority,
        category: category,
        hospitalId: hospitalId,
      );

      await loadTickets();

      debugPrint(
        "TicketProvider: Ticket created and list refreshed successfully",
      );
    } catch (e) {
      debugPrint("TicketProvider: Error in createTicket: $e");

      final errorMessage = _parseTicketError(e);
      throw errorMessage;
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

    return error.toString();
  }

  Future<void> assignTicket(String ticketId, String adminId) async {
    _setLoading(true);
    try {
      await _repository.assignTicket(ticketId, adminId);
      await Future.wait([loadPendingTickets(), loadTickets()]);
    } catch (e) {
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
    _setLoading(true);
    try {
      await _repository.updateTicket(id, status, assignCaseNumber);
      // FIX: Reload appropriate ticket list based on admin mode
      if (_isAdmin) {
        await loadAdminTickets();
      } else {
        await loadTickets();
      }
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> replyToTicket(
    String ticketId,
    Map<String, dynamic> replyData,
  ) async {
    _setLoading(true);
    try {
      await _repository.replyToTicket(ticketId, replyData);
      // FIX: Reload appropriate ticket list based on admin mode
      if (_isAdmin) {
        await loadAdminTickets();
      } else {
        await loadTickets();
      }
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> deleteTicket(String id) async {
    _setLoading(true);
    try {
      await _repository.deleteTicket(id);
      await loadTickets();
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadStats() async {
    _setLoading(true);
    try {
      _stats = await _repository.fetchStats();
      notifyListeners