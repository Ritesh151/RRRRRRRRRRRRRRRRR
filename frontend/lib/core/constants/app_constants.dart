import 'package:flutter/foundation.dart';

class AppConstants {
  // Use origin only for baseUrl to avoid double prefixing with relative paths
  // Use 10.0.2.2 for Android Emulator, localhost for others
  // Backend runs on port 5000, not 5001
  static String get baseUrl =>
      kIsWeb ? "http://localhost:5000" : "http://10.0.2.2:5000";

  // All endpoints start with /api to be absolutely safe
  static const String login = "/api/auth/login";
  static const String register = "/api/auth/register";
  static const String me = "/api/auth/me";

  // Hospital Endpoints
  static const String hospitals = "/api/hospitals";

  // Ticket Endpoints
  static const String tickets = "/api/tickets";
  static const String adminTickets = "/api/tickets/admin";
  static const String stats = "/api/tickets/stats";

  // Dashboard Endpoint
  static const String dashboardStats = "/api/dashboard/stats";

  // User Endpoints
  static const String users = "/api/users";
  static const String assignAdmin = "/api/users/assign-admin";
}
