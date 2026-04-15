import 'package:flutter/foundation.dart';
import '../../services/api_service.dart';
import '../models/message_model.dart';

class ChatRepository {
  final ApiService _apiService = ApiService.instance;

  // FIX: Corrected API endpoint from /chat to /api/chat
  // Backend mounts chatRoutes at /api/chat
  Future<List<MessageModel>> getMessages(String ticketId) async {
    try {
      debugPrint("ChatRepository: Fetching messages for ticket: $ticketId");

      if (ticketId.isEmpty) {
        throw Exception('Ticket ID is required');
      }

      // FIX: Use /api/chat/:ticketId (backend mounts chatRoutes at /api/chat)
      final response = await _apiService.get('/api/chat/$ticketId');

      debugPrint("ChatRepository: Response received, processing...");

      // Handle the response - could be direct array or wrapped format
      List<dynamic> data;
      if (response.data is List) {
        data = response.data;
      } else if (response.data is Map) {
        if (response.data['data'] is List) {
          data = response.data['data'];
        } else if (response.data['messages'] is List) {
          data = response.data['messages'];
        } else {
          debugPrint(
            "ChatRepository: Unexpected response format: ${response.data}",
          );
          throw Exception('Invalid response format: expected list');
        }
      } else {
        throw Exception('Invalid response format');
      }

      final messages = data
          .map((json) => MessageModel.fromJson(json as Map<String, dynamic>))
          .toList();
      debugPrint("ChatRepository: Received ${messages.length} messages");
      return messages;
    } catch (e) {
      debugPrint("ChatRepository: Error fetching messages: $e");
      rethrow;
    }
  }

  // FIX: Use /api/chat/:ticketId for POST
  Future<MessageModel> sendMessage(String ticketId, String content) async {
    try {
      debugPrint("ChatRepository: Sending message to ticket: $ticketId");

      if (ticketId.isEmpty) {
        throw Exception('Ticket ID is required');
      }

      if (content.trim().isEmpty) {
        throw Exception('Message content is required');
      }

      // FIX: Use /api/chat/:ticketId (backend mounts chatRoutes at /api/chat)
      final response = await _apiService.post(
        '/api/chat/$ticketId',
        data: {'content': content.trim()},
      );

      debugPrint("ChatRepository: Response received, processing...");

      // Handle the response - could be direct object or wrapped format
      Map<String, dynamic> messageData;
      if (response.data is Map) {
        // Check if response has a data wrapper
        if (response.data['data'] != null && response.data['data'] is Map) {
          messageData = response.data['data'];
        } else if (response.data['data'] != null) {
          // data might be a primitive, create object from top-level fields
          messageData = {
            'id': response.data['id'] ?? response.data['_id'],
            'content': response.data['content'] ?? response.data['text'],
            'ticketId': response.data['ticketId'],
            'senderId': response.data['senderId'],
            'senderRole': response.data['senderRole'],
            'senderName': response.data['senderName'],
            'createdAt': response.data['createdAt'],
          };
        } else {
          // Direct response without wrapper
          messageData = {
            'id': response.data['id'] ?? response.data['_id'],
            'content': response.data['content'] ?? response.data['text'],
            'ticketId': response.data['ticketId'],
            'senderId': response.data['senderId'],
            'senderRole': response.data['senderRole'],
            'senderName': response.data['senderName'],
            'createdAt': response.data['createdAt'],
          };
        }
      } else {
        throw Exception('Invalid response format');
      }

      final message = MessageModel.fromJson(messageData);
      debugPrint("ChatRepository: Message sent successfully: ${message.id}");
      return message;
    } catch (e) {
      debugPrint("ChatRepository: Error sending message: $e");
      rethrow;
    }
  }
}
