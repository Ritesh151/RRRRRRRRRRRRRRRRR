class MessageModel {
  final String id;
  final String ticketId;
  final String senderId;
  final String senderRole;
  final String senderName;
  final String text;
  final DateTime createdAt;

  MessageModel({
    required this.id,
    required this.ticketId,
    required this.senderId,
    required this.senderRole,
    required this.senderName,
    required this.text,
    required this.createdAt,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    String senderId = '';
    if (json['senderId'] is Map) {
      senderId =
          json['senderId']['_id']?.toString() ??
          json['senderId']['id']?.toString() ??
          '';
    } else if (json['senderId'] is String) {
      senderId = json['senderId'];
    } else if (json['sender'] is Map) {
      senderId =
          json['sender']['_id']?.toString() ??
          json['sender']['id']?.toString() ??
          '';
    } else if (json['sender'] is String) {
      senderId = json['sender'];
    }

    String ticketId = '';
    if (json['ticketId'] is Map) {
      ticketId =
          json['ticketId']['_id']?.toString() ??
          json['ticketId']['id']?.toString() ??
          '';
    } else if (json['ticketId'] is String) {
      ticketId = json['ticketId'];
    } else if (json['ticket'] is Map) {
      ticketId =
          json['ticket']['_id']?.toString() ??
          json['ticket']['id']?.toString() ??
          '';
    } else if (json['ticket'] is String) {
      ticketId = json['ticket'];
    }

    String senderName = '';
    if (json['senderName'] != null) {
      senderName = json['senderName'].toString();
    } else if (json['sender'] is Map && json['sender']['name'] != null) {
      senderName = json['sender']['name'].toString();
    }

    return MessageModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      ticketId: ticketId,
      senderId: senderId,
      senderRole: json['senderRole']?.toString() ?? '',
      senderName: senderName,
      text: json['text']?.toString() ?? json['content']?.toString() ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'].toString())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'ticketId': ticketId,
      'senderId': senderId,
      'senderRole': senderRole,
      'senderName': senderName,
      'text': text,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
