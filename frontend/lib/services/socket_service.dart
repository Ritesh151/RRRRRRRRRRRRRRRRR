import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../core/constants/app_constants.dart';
import 'preference_service.dart';

class SocketService {
  static SocketService? _instance;
  io.Socket? _socket;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  final List<Function(Map<String, dynamic>)> _dashboardListeners = [];
  final List<Function(Map<String, dynamic>)> _ticketCreatedListeners = [];
  final List<Function(Map<String, dynamic>)> _ticketAssignedListeners = [];
  String? _currentToken;

  SocketService._();

  static SocketService get instance {
    _instance ??= SocketService._();
    return _instance!;
  }

  Future<void> connect({bool forceReconnect = false}) async {
    if (!forceReconnect && _socket != null && _socket!.connected) return;

    final baseUrl = AppConstants.baseUrl;
    final token = await _getToken();

    if (token == null) {
      debugPrint('Socket: No auth token, skipping connection');
      return;
    }

    _currentToken = token;

    if (_socket != null) {
      _socket!.disconnect();
      _socket!.dispose();
    }

    debugPrint("Socket: Connecting to $baseUrl with token present");

    final Map<String, dynamic> extraHeaders = {'Origin': baseUrl};
    extraHeaders['Authorization'] = 'Bearer $token';

    _socket = io.io(
      baseUrl,
      io.OptionBuilder()
          .setTransports(['polling', 'websocket'])
          .disableAutoConnect()
          .enableReconnection()
          .setReconnectionAttempts(5)
          .setReconnectionDelay(2000)
          .setExtraHeaders(extraHeaders)
          .build(),
    );

    _socket!.onConnect((_) {
      debugPrint('Socket: Connected ${_socket!.id}');
      _socket!.emit('authenticate', {'token': token});
      _socket!.emit('join_dashboard');
    });

    _socket!.onDisconnect((_) {
      debugPrint('Socket: Disconnected');
    });

    _socket!.onError((error) {
      debugPrint('Socket: Error $error');
    });

    _socket!.on('dashboard_update', (data) {
      debugPrint('Socket: Dashboard update received');
      if (data is Map<String, dynamic>) {
        for (final listener in _dashboardListeners.toList()) {
          listener(data);
        }
      }
    });

    _socket!.on('ticket_created', (data) {
      debugPrint('Socket: Ticket created event received');
      if (data is Map<String, dynamic>) {
        for (final listener in _ticketCreatedListeners.toList()) {
          listener(data);
        }
      }
    });

    _socket!.on('ticket_assigned', (data) {
      debugPrint('Socket: Ticket assigned event received');
      if (data is Map<String, dynamic>) {
        for (final listener in _ticketAssignedListeners.toList()) {
          listener(data);
        }
      }
    });

    _socket!.connect();
  }

  Future<String?> _getToken() async {
    if (kIsWeb) return PreferenceService.getAuthToken();
    return _storage.read(key: 'token');
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.disconnect();
    _socket = null;
    _currentToken = null;
  }

  void reconnectIfNeeded() {
    if (_currentToken != null) {
      connect(forceReconnect: true);
    }
  }

  void addDashboardListener(Function(Map<String, dynamic>) callback) {
    _dashboardListeners.add(callback);
  }

  void removeDashboardListener(Function(Map<String, dynamic>) callback) {
    _dashboardListeners.remove(callback);
  }

  void addTicketCreatedListener(Function(Map<String, dynamic>) callback) {
    _ticketCreatedListeners.add(callback);
  }

  void removeTicketCreatedListener(Function(Map<String, dynamic>) callback) {
    _ticketCreatedListeners.remove(callback);
  }

  void addTicketAssignedListener(Function(Map<String, dynamic>) callback) {
    _ticketAssignedListeners.add(callback);
  }

  void removeTicketAssignedListener(Function(Map<String, dynamic>) callback) {
    _ticketAssignedListeners.remove(callback);
  }

  bool get isConnected => _socket?.connected ?? false;
}
