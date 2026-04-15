import 'package:flutter/foundation.dart';
import '../../services/api_service.dart';
import '../models/ticket_model.dart';
import '../../core/constants/app_constants.dart';

class TicketRepository {
  final ApiService _apiService = ApiService.instance;

  Future<List<TicketModel>> fetchTickets() async {
    try {
      final response = await _apiService.get(AppConstants.tickets);

      // Handle both direct array and wrapped response
      List<dynamic> data;
      if (response.data is List) {
        data = response.data;
      } else if (response.data is Map) {
        if (response.data['data'] is List) {
          data = response.data['data'];
        } else if (response.data['tickets'] is List) {
          data = response.data['tickets'];
        } else {
          throw Exception('Invalid response format: expected list');
        }
      } else {
        throw Exception('Invalid response format');
      }

      return data.map((json) => TicketModel.fromJson(json)).toList();
    } catch (e) {
      debugPrint("TicketRepository: Error fetching tickets: $e");
      rethrow;
    }
  }

  Future<List<TicketModel>> fetchAdminTickets() async {
    try {
      debugPrint("Fetching admin tickets from: ${AppConstants.adminTickets}");
      final response = await _apiService.get(AppConstants.adminTickets);
      debugPrint("Admin tickets response: ${response.data}");

      // Handle both direct array and wrapped response
      List<dynamic> data;
      if (response.data is List) {
        data = response.data;
      } else if (response.data is Map) {
        if (response.data['data'] is List) {
          data = response.data['data'];
        } else if (response.data['tickets'] is List) {
          data = response.data['tickets'];
        } else {
          throw Exception('Invalid response format: expected list');
        }
      } else {
        throw Exception('Invalid response format');
      }

      final tickets = data.map((json) => TicketModel.fromJson(json)).toList();
      debugPrint("TicketRepository: Received ${tickets.length} admin tickets");
      return tickets;
    } catch (e) {
      debugPrint("Error fetching admin tickets: $e");
      rethrow;
    }
  }

  Future<List<TicketModel>> fetchPendingTickets() async {
    try {
      final response = await _apiService.get("${AppConstants.tickets}/pending");

      // Handle both direct array and wrapped response
      List<dynamic> data;
      if (response.data is List) {
        data = response.data;
      } else if (response.data is Map) {
        if (response.data['data'] is List) {
          data = response.data['data'];
        } else if (response.data['tickets'] is List) {
          data = response.data['tickets'];
        } else {
          throw Exception('Invalid response format');
        }
      } else {
        throw Exception('Invalid response format');
      }

      return data.map((json) => TicketModel.fromJson(json)).toList();
    } catch (e) {
      debugPrint("Error fetching pending tickets: $e");
      rethrow;
    }
  }

  Future<TicketModel> createTicket(
    String issueTitle,
    String description, {
    String priority = 'medium',
    String category = 'general_inquiry',
    String? hospitalId,
  }) async {
    debugPrint(
      "TicketRepository: Creating ticket - Title: $issueTitle, Desc: $description, Priority: $priority, Category: $category, HospitalId: $hospitalId",
    );
    try {
      final requestData = {
        'issueTitle': issueTitle,
        'description': description,
        'priority': priority,
        'category': category,
      };

      if (hospitalId != null && hospitalId.isNotEmpty) {
        requestData['hospitalId'] = hospitalId;
      }

      final response = await _apiService.post(
        AppConstants.tickets,
        data: requestData,
      );

      debugPrint(
        "TicketRepository: Ticket created successfully. Status: ${response.statusCode}",
      );
      debugPrint("TicketRepository: Response data: ${response.data}");

      // FIX: Handle wrapped response format {success, data} or direct ticket object
      Map<String, dynamic>? ticketData;
      if (response.data is Map) {
        if (response.data['data'] != null && response.data['data'] is Map) {
          ticketData = response.data['data'];
        } else if (response.data['ticket'] != null &&
            response.data['ticket'] is Map) {
          ticketData = response.data['ticket'];
        } else if (response.data['id'] != null ||
            response.data['_id'] != null) {
          ticketData = response.data;
        }
      }

      if (ticketData == null) {
        throw Exception('Invalid response format - no ticket data found');
      }

      return TicketModel.fromJson(ticketData);
    } catch (e) {
      debugPrint("TicketRepository: Error creating ticket: $e");
      throw _parseTicketCreationError(e);
    }
  }

  dynamic _parseTicketCreationError(dynamic error) {
    debugPrint("TicketRepository: Parsing error: $error");

    if (error is Map && error['success'] == false) {
      debugPrint("TicketRepository: Structured API error detected");
      return error;
    }

    final errorStr = error.toString();
    if (errorStr.contains('DioException') || errorStr.contains('Exception')) {
      debugPrint("TicketRepository: DioException detected: $errorStr");

      if (errorStr.contains('400')) {
        return {
          'success': false,
          'message': 'Invalid ticket data. Please check all required fields.',
          'code': 'INVALID_DATA',
        };
      }

      if (errorStr.contains('401')) {
        return {
          'success': false,
          'message': 'Authentication required. Please login again.',
          'code': 'AUTHENTICATION_REQUIRED',
        };
      }

      if (errorStr.contains('409')) {
        return {
          'success': false,
          'message': 'Case number conflict. Please try again.',
          'code': 'CASE_NUMBER_CONFLICT',
        };
      }

      if (errorStr.contains('500')) {
        return {
          'success': false,
          'message': 'Server error occurred. Please try again later.',
          'code': 'SERVER_ERROR',
        };
      }

      if (errorStr.contains('network') || errorStr.contains('connection')) {
        return {
          'success': false,
          'message': 'Network connection error. Please check your internet.',
          'code': 'NETWORK_ERROR',
        };
      }
    }

    debugPrint("TicketRepository: Using fallback error handling");
    return {
      'success': false,
      'message': 'Failed to create ticket. Please try again.',
      'code': 'UNKNOWN_ERROR',
      'details': error.toString(),
    };
  }

  Future<void> assignTicket(String id, String adminId) async {
    try {
      await _apiService.patch(
        "${AppConstants.tickets}/$id/assign",
        data: {'adminId': adminId},
      );
    } catch (e) {
      debugPrint("TicketRepository: Error assigning ticket: $e");
      rethrow;
    }
  }

  Future<void> updateTicket(
    String id,
    String status,
    bool assignCaseNumber,
  ) async {
    try {
      // FIX: Normalize status - backend expects 'in_progress' not 'in-progress'
      final normalizedStatus = status.replaceAll('-', '_');
      await _apiService.patch(
        "${AppConstants.tickets}/$id/status",
        data: {'status': normalizedStatus},
      );
    } catch (e) {
      debugPrint("TicketRepository: Error updating ticket: $e");
      rethrow;
    }
  }

  Future<void> replyToTicket(String id, Map<String, dynamic> replyData) async {
    try {
      await _apiService.patch(
        "${AppConstants.tickets}/$id/reply",
        data: replyData,
      );
    } catch (e) {
      debugPrint("TicketRepository: Error replying to ticket: $e");
      rethrow;
    }
  }

  Future<TicketModel> fetchTicketDetails(String id) async {
    try {
      debugPrint("TicketRepository: Fetching ticket details for: $id");
      final response = await _apiService.get("${AppConstants.tickets}/$id");

      // FIX: Handle wrapped response format
      Map<String, dynamic> ticketData;
      if (response.data is Map) {
        if (response.data['data'] != null && response.data['data'] is Map) {
          ticketData = response.data['data'];
        } else if (response.data['id'] != null ||
            response.data['_id'] != null) {
          ticketData = response.data;
        } else {
          throw Exception('Invalid response format');
        }
      } else {
        throw Exception('Invalid response format');
      }

      return TicketModel.fromJson(ticketData);
    } catch (e) {
      debugPrint("TicketRepository: Error fetching ticket details: $e");
      rethrow;
    }
  }

  Future<void> deleteTicket(String id) async {
    try {
      await _apiService.delete("${AppConstants.tickets}/$id");
    } catch (e) {
      debugPrint("TicketRepository: Error deleting ticket: $e");
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchStats() async {
    try {
      final response = await _apiService.get(AppConstants.stats);
      return response.data is Map ? response.data : {};
    } catch (e) {
      return {
        'totalTickets': 0,
        'totalHospitals': 0,
        'statsByType': {'gov': 0, 'private': 0, 'semi': 0},
      };
    }
  }
}
