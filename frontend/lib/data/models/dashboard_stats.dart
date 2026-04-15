class DashboardStats {
  final int totalUsers;
  final int activeAdmins;
  final int totalTickets;
  final int totalHospitals;
  final Map<String, int> statsByType;

  DashboardStats({
    required this.totalUsers,
    required this.activeAdmins,
    required this.totalTickets,
    required this.totalHospitals,
    required this.statsByType,
  });

  factory DashboardStats.empty() {
    return DashboardStats(
      totalUsers: 0,
      activeAdmins: 0,
      totalTickets: 0,
      totalHospitals: 0,
      statsByType: {'gov': 0, 'private': 0, 'semi': 0},
    );
  }

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalUsers: _parseInt(json['totalUsers']),
      activeAdmins: _parseInt(json['activeAdmins']),
      totalTickets: _parseInt(json['totalTickets']),
      totalHospitals: _parseInt(json['totalHospitals']),
      statsByType: _parseStatsByType(json['statsByType']),
    );
  }

  static int _parseInt(dynamic value) {
    if (value == null) return 0;
    if (value is int) return value;
    if (value is double) return value.toInt();
    if (value is String) return int.tryParse(value) ?? 0;
    return 0;
  }

  static Map<String, int> _parseStatsByType(dynamic value) {
    if (value == null) return {'gov': 0, 'private': 0, 'semi': 0};
    if (value is! Map) return {'gov': 0, 'private': 0, 'semi': 0};
    final map = value as Map<String, dynamic>;
    return {
      'gov': _parseInt(map['gov']),
      'private': _parseInt(map['private']),
      'semi': _parseInt(map['semi']),
    };
  }

  Map<String, dynamic> toJson() {
    return {
      'totalUsers': totalUsers,
      'activeAdmins': activeAdmins,
      'totalTickets': totalTickets,
      'totalHospitals': totalHospitals,
      'statsByType': statsByType,
    };
  }
}
