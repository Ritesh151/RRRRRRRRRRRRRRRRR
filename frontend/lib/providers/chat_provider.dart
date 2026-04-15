import 'dart:async';
import 'package:flutter/foundation.dart';
import '../data/models/message_model.dart';
import '../data/repositories/chat_repository.dart';

class ChatProvider extends ChangeNotifier {
  final ChatRepository _repository = ChatRepository();
  List<MessageModel> _messages = [];
  bool _isLoading = false;
  String? _currentTicketId;
  bool _isDisposed = false;
  Timer? _pollingTimer;
  String? _lastError;

  static const Duration _pollInterval = Duration(seconds: 5);

  List<MessageModel> get messages => _messages;
  bool get isLoading => _isLoading;
  String? get error => _lastError;

  Future<void> loadMessages(String ticketId) async {
    if (_isLoading || _isDisposed) return;

    debugPrint("ChatProvider: Loading messages for ticket: $ticketId");

    _isLoading = true;
    _currentTicketId = ticketId;
    _lastError = null;

    try {
      _messages = await _repository.getMessages(ticketId);
      debugPrint("ChatProvider: Loaded ${_messages.length} messages");
    } catch (e) {
      debugPrint("ChatProvider: Error loading messages: $e");
      _lastError = _parseError(e);
      _messages = [];
    } finally {
      _isLoading = false;
      if (!_isDisposed) notifyListeners();
    }
  }

  void startPolling(String ticketId) {
    debugPrint("ChatProvider: Starting polling for ticket: $ticketId");

    // Stop any existing polling
    stopPolling();

    _currentTicketId = ticketId;

    // Load messages immediately
    loadMessages(ticketId);

    // Start periodic polling
    _pollingTimer = Timer.periodic(_pollInterval, (_) {
      if (_currentTicketId != null && !_isDisposed) {
        _pollMessages(_currentTicketId!);
      }
    });
  }

  void stopPolling() {
    debugPrint("ChatProvider: Stopping polling");
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }

  Future<void> _pollMessages(String ticketId) async {
    if (_isLoading || _isDisposed) return;

    try {
      final newMessages = await _repository.getMessages(ticketId);
      if (_isDisposed) return;

      bool hasChanges = false;

      for (final msg in newMessages) {
        if (!_messages.any((m) => m.id == msg.id)) {
          _messages.add(msg);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        // Sort by creation time
        _messages.sort((a, b) => a.createdAt.compareTo(b.createdAt));
        debugPrint(
          "ChatProvider: Polling found new messages, total: ${_messages.length}",
        );
        if (!_isDisposed) notifyListeners();
      }
    } catch (e) {
      // Don't show error for polling failures, just log them
      debugPrint("ChatProvider: Polling error (non-critical): $e");
    }
  }

  Future<bool> sendMessage(String ticketId, String content) async {
    if (_isDisposed) {
      _lastError = 'Provider disposed';
      return false;
    }

    if (content.trim().isEmpty) {
      _lastError = 'Message cannot be empty';
      return false;
    }

    debugPrint("ChatProvider: Sending message to ticket: $ticketId");

    try {
      final newMessage = await _repository.sendMessage(
        ticketId,
        content.trim(),
      );

      // Check if message already exists to prevent duplication
      final exists = _messages.any((m) => m.id == newMessage.id);
      if (!exists) {
        _messages.add(newMessage);
        // Sort by creation time
        _messages.sort((a, b) => a.createdAt.compareTo(b.createdAt));
      }

      _lastError = null;
      if (!_isDisposed) notifyListeners();
      return true;
    } catch (e) {
      debugPrint("ChatProvider: Error sending message: $e");
      _lastError = _parseError(e);
      if (!_isDisposed) notifyListeners();
      return false;
    }
  }

  Future<void> refreshMessages() async {
    if (_currentTicketId != null && !_isDisposed) {
      _lastError = null;
      await loadMessages(_currentTicketId!);
    }
  }

  bool isMessageFromCurrentUser(MessageModel message, String? currentUserId) {
    if (currentUserId == null) return false;
    return message.senderId == currentUserId;
  }

  void clearMessages() {
    _messages = [];
    _currentTicketId = null;
    _lastError = null;
    if (!_isDisposed) notifyListeners();
  }

  void clearError() {
    _lastError = null;
    if (!_isDisposed) notifyListeners();
  }

  String _parseError(dynamic error) {
    final errorStr = error.toString();

    debugPrint("ChatProvider: Parsing error: $errorStr");

    // Handle specific HTTP status codes
    if (errorStr.contains('404')) {
      return 'Ticket not found. It may have been deleted.';
    }
    if (errorStr.contains('403')) {
      return 'You are not authorized to view this chat.';
    }
    if (errorStr.contains('401')) {
      return 'Session expired. Please login again.';
    }
    if (errorStr.contains('SocketException') ||
        errorStr.contains('Connection') ||
        errorStr.contains('network')) {
      return 'Network error. Please check your connection.';
    }

    // Extract message from API error response
    if (errorStr.contains('message:')) {
      final match = RegExp(r'message:\s*([^}]+)').firstMatch(errorStr);
      if (match != null) {
        return match.group(1)!.trim();
      }
    }

    // Clean up the error string for display
    String cleanError = errorStr
        .replaceAll('Exception:', '')
        .replaceAll('DioException', '')
        .trim();

    if (cleanError.isEmpty) {
      return 'Failed to load chat. Please try again.';
    }

    return cleanError;
  }

  @override
  void dispose() {
    _isDisposed = true;
    stopPolling();
    super.dispose();
  }
}
