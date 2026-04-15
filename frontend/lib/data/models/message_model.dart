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
    return MessageModel(
      id: json['id'] ?? json['_id'] ?? '',
      ticketId: json['ticketId'] ?? '',
      senderId: json['senderId'] is Map
          ? json['senderId']['_id']
          : (json['senderId'] ?? ''),
      senderRole: json['senderRole'] ?? '',
      senderName: json['senderName'] ?? '',
      text: json['text'] ?? json['content'] ?? '',
      createdAt: DateTime.parse(
        json['createdAt'] ?? DateTime.now().toIso8601String(),
      ),
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
