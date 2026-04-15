import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../core/constants/app_constants.dart';

class SocketService {
  static SocketService? _instance;
  io.Socket? _socket;

  final List<Function(Map<String, dynamic>)> _dashboardListeners = [];
  final List<Function(Map<String, dynamic>)> _ticketCreatedListeners = [];
  final List<Function(Map<String, dynamic>)> _ticketAssignedListeners = [];

  SocketService._();

  static SocketService get instance {
    _instance ??= SocketService._();
    return _instance!;
  }

  void connect() {
    if (_socket != null && _socket!.connected) return;

    final baseUrl = AppConstants.baseUrl;

    debugPrint("Connecting to socket: $baseUrl");

    _socket = io.io(
      baseUrl,
      io.OptionBuilder()
          .setTransports(['polling', 'websocket'])
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionAttempts(5)
          .setReconnectionDelay(2000)
          .setExtraHeaders({'Origin': baseUrl})
          .build(),
    );

    _socket!.onConnect((_) {
      debugPrint('Socket connected: ${_socket!.id}');
      _socket!.emit('join_dashboard');
    });

    _socket!.onDisconnect((_) {
      debugPrint('Socket disconnected');
    });

    _socket!.onError((error) {
      debugPrint('Socket error: $error');
    });

    _socket!.on('dashboard_update', (data) {
      debugPrint('Dashboard update received');
      if (data is Map<String, dynamic>) {
        for (final listener in _dashboardListeners) {
          listener(data);
        }
      }
    });

    _socket!.on('ticket_created', (data) {
      debugPrint('Ticket created event received: $data');
      if (data is Map<String, dynamic>) {
        for (final listener in _ticketCreatedListeners) {
          listener(data);
        }
      }
    });

    _socket!.on('ticket_assigned', (data) {
      debugPrint('Ticket assigned event received: $data');
      if (data is Map<String, dynamic>) {
        for (final listener in _ticketAssignedListeners) {
          listener(data);
        }
      }
    });

    _socket!.connect();
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
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
