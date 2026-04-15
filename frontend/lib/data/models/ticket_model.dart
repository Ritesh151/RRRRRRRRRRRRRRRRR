class TicketModel {
  final String id;
  final String caseNumber;
  final String patientId;
  final Map<String, dynamic>? patient;
  final String? assignedAdminId;
  final Map<String, dynamic>? assignedAdmin;
  // FIX: Add hospitalId field
  final String? hospitalId;
  final Map<String, dynamic>? hospital;
  final String issueTitle;
  final String description;
  // FIX: Normalize status getter
  final String status;
  final String priority;
  final String category;
  final DateTime? lastActivityAt;
  final Map<String, dynamic>? lastActivityBy;
  final List<TicketHistory>? history;
  final TicketReply? reply;
  final DateTime createdAt;
  final DateTime updatedAt;

  String get patientName => patient?['name'] ?? patientId;
  String get patientEmail => patient?['email'] ?? '';

  // FIX: Normalize status to handle both 'in-progress' and 'in_progress'
  String get normalizedStatus => status.replaceAll('-', '_');

  // FIX: Helper getter for display
  String get displayStatus {
    switch (normalizedStatus) {
      case 'pending':
        return 'Pending';
      case 'assigned':
        return 'Assigned';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  }

  TicketModel({
    required this.id,
    required this.caseNumber,
    required this.patientId,
    this.patient,
    this.assignedAdminId,
    this.assignedAdmin,
    this.hospitalId,
    this.hospital,
    required this.issueTitle,
    required this.description,
    required this.status,
    this.priority = 'medium',
    this.category = 'general_inquiry',
    this.lastActivityAt,
    this.lastActivityBy,
    this.history,
    this.reply,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TicketModel.fromJson(Map<String, dynamic> json) {
    return TicketModel(
      id: json['_id'] ?? json['id'] ?? '',
      caseNumber: json['caseNumber'] ?? '',
      // FIX: Properly handle patientId as object or string
      patientId: json['patientId'] is Map
          ? json['patientId']['_id']
          : (json['patientId'] ?? ''),
      patient: json['patientId'] is Map ? json['patientId'] : null,
      assignedAdminId: json['assignedAdminId'] is Map
          ? json['assignedAdminId']['_id']
          : json['assignedAdminId'],
      assignedAdmin: json['assignedAdminId'] is Map
          ? json['assignedAdminId']
          : null,
      // FIX: Parse hospitalId properly
      hospitalId: json['hospitalId'] is Map
          ? json['hospitalId']['_id']
          : (json['hospitalId'] ?? ''),
      hospital: json['hospitalId'] is Map ? json['hospitalId'] : null,
      issueTitle: json['issueTitle'] ?? '',
      description: json['description'] ?? '',
      status: json['status'] ?? 'pending',
      priority: json['priority'] ?? 'medium',
      category: json['category'] ?? 'general_inquiry',
      lastActivityAt: json['lastActivityAt'] != null
          ? DateTime.parse(json['lastActivityAt'])
          : null,
      lastActivityBy: json['lastActivityBy'] is Map
          ? json['lastActivityBy']
          : null,
      history: json['history'] != null
          ? (json['history'] as List)
                .map((h) => TicketHistory.fromJson(h))
                .toList()
          : null,
      reply: json['reply'] != null ? TicketReply.fromJson(json['reply']) : null,
      createdAt: DateTime.parse(
        json['createdAt'] ?? DateTime.now().toIso8601String(),
      ),
      updatedAt: DateTime.parse(
        json['updatedAt'] ?? DateTime.now().toIso8601String(),
      ),
    );
  }

  TicketModel copyWith({
    String? id,
    String? caseNumber,
    String? patientId,
    Map<String, dynamic>? patient,
    String? assignedAdminId,
    Map<String, dynamic>? assignedAdmin,
    String? hospitalId,
    Map<String, dynamic>? hospital,
    String? issueTitle,
    String? description,
    String? status,
    String? priority,
    String? category,
    DateTime? lastActivityAt,
    Map<String, dynamic>? lastActivityBy,
    List<TicketHistory>? history,
    TicketReply? reply,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return TicketModel(
      id: id ?? this.id,
      caseNumber: caseNumber ?? this.caseNumber,
      patientId: patientId ?? this.patientId,
      patient: patient ?? this.patient,
      assignedAdminId: assignedAdminId ?? this.assignedAdminId,
      assignedAdmin: assignedAdmin ?? this.assignedAdmin,
      hospitalId: hospitalId ?? this.hospitalId,
      hospital: hospital ?? this.hospital,
      issueTitle: issueTitle ?? this.issueTitle,
      description: description ?? this.description,
      status: status ?? this.status,
      priority: priority ?? this.priority,
      category: category ?? this.category,
      lastActivityAt: lastActivityAt ?? this.lastActivityAt,
      lastActivityBy: lastActivityBy ?? this.lastActivityBy,
      history: history ?? this.history,
      reply: reply ?? this.reply,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'patientId': patientId,
      'assignedAdminId': assignedAdminId,
      'hospitalId': hospitalId,
      'issueTitle': issueTitle,
      'description': description,
      'status': status,
      'priority': priority,
      'category': category,
      'lastActivityAt': lastActivityAt?.toIso8601String(),
      'lastActivityBy': lastActivityBy,
      'history': history?.map((h) => h.toJson()).toList(),
      'reply': reply?.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class TicketHistory {
  final String action;
  final String actorId;
  final String actorRole;
  final String actorName;
  final String description;
  final String? previousStatus;
  final String? newStatus;
  final DateTime timestamp;

  TicketHistory({
    required this.action,
    required this.actorId,
    required this.actorRole,
    required this.actorName,
    required this.description,
    this.previousStatus,
    this.newStatus,
    required this.timestamp,
  });

  factory TicketHistory.fromJson(Map<String, dynamic> json) {
    return TicketHistory(
      action: json['action'] ?? '',
      actorId: json['actorId'] is Map
          ? json['actorId']['_id']
          : (json['actorId'] ?? ''),
      actorRole: json['actorRole'] ?? '',
      actorName: json['actorName'] ?? '',
      description: json['description'] ?? '',
      previousStatus: json['previousStatus'],
      newStatus: json['newStatus'],
      timestamp: DateTime.parse(
        json['timestamp'] ?? DateTime.now().toIso8601String(),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'action': action,
      'actorId': actorId,
      'actorRole': actorRole,
      'actorName': actorName,
      'description': description,
      'previousStatus': previousStatus,
      'newStatus': newStatus,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class TicketReply {
  final String doctorName;
  final String doctorPhone;
  final String specialization;
  final String replyMessage;
  final String repliedBy;
  final DateTime repliedAt;

  TicketReply({
    required this.doctorName,
    required this.doctorPhone,
    required this.specialization,
    required this.replyMessage,
    required this.repliedBy,
    required this.repliedAt,
  });

  factory TicketReply.fromJson(Map<String, dynamic> json) {
    return TicketReply(
      doctorName: json['doctorName'] ?? '',
      doctorPhone: json['doctorPhone'] ?? '',
      specialization: json['specialization'] ?? '',
      replyMessage: json['replyMessage'] ?? '',
      repliedBy: json['repliedBy'] is Map
          ? json['repliedBy']['_id']
          : (json['repliedBy'] ?? ''),
      repliedAt: DateTime.parse(
        json['repliedAt'] ?? DateTime.now().toIso8601String(),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'doctorName': doctorName,
      'doctorPhone': doctorPhone,
      'specialization': specialization,
      'replyMessage': replyMessage,
      'repliedBy': repliedBy,
      'repliedAt': repliedAt.toIso8601String(),
    };
  }
}
