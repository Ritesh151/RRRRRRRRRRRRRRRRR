import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../data/models/ticket_model.dart';
import '../../../providers/chat_provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/ticket_provider.dart';
import '../../../routes/app_router.dart';
import '../../widgets/ticket_timeline.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_colors.dart';

class TicketDetailsScreen extends StatefulWidget {
  final TicketModel ticket;

  const TicketDetailsScreen({super.key, required this.ticket});

  @override
  State<TicketDetailsScreen> createState() => _TicketDetailsScreenState();
}

class _TicketDetailsScreenState extends State<TicketDetailsScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late TicketModel _ticket;
  bool _isLoadingTicket = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _ticket = widget.ticket;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadTicketData();
      _loadChatMessages();
      Provider.of<ChatProvider>(
        context,
        listen: false,
      ).startPolling(_ticket.id);
    });
  }

  @override
  void dispose() {
    Provider.of<ChatProvider>(context, listen: false).stopPolling();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadTicketData() async {
    if (!mounted) return;
    setState(() {
      _isLoadingTicket = true;
      _error = null;
    });

    try {
      final ticketProvider = Provider.of<TicketProvider>(
        context,
        listen: false,
      );
      final freshTicket = await ticketProvider.getTicketDetails(_ticket.id);
      if (mounted) {
        setState(() {
          _ticket = freshTicket;
        });
      }
    } catch (e) {
      debugPrint('Error loading ticket details: $e');
      if (mounted) {
        setState(() {
          _error = 'Failed to load ticket details';
        });
      }
    } finally {
      if (mounted) {
        setState(() => _isLoadingTicket = false);
      }
    }
  }

  Future<void> _loadChatMessages() async {
    final chatProvider = Provider.of<ChatProvider>(context, listen: false);
    await chatProvider.loadMessages(_ticket.id);
  }

  Future<void> _refreshTicket() async {
    await _loadTicketData();
    await _loadChatMessages();
  }

  void _sendMessage() async {
    if (_messageController.text.trim().isEmpty) return;

    final text = _messageController.text.trim();
    _messageController.clear();

    final chatProvider = Provider.of<ChatProvider>(context, listen: false);
    final success = await chatProvider.sendMessage(_ticket.id, text);

    if (success) {
      _scrollToBottom();
    } else if (mounted && chatProvider.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(chatProvider.error!),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent + 100,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        title: Text(
          'Ticket: ${_ticket.caseNumber}',
          style: AppTheme.headline3.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: AppColors.surface,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
        actions: [
          IconButton(
            onPressed: _refreshTicket,
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
          ),
          IconButton(
            onPressed: () async {
              await Navigator.pushNamed(
                context,
                AppRouter.ticketReply,
                arguments: _ticket,
              );
              _refreshTicket();
            },
            icon: const Icon(Icons.chat_outlined, color: AppColors.primary),
            tooltip: 'Open Chat',
          ),
        ],
      ),
      body: Column(
        children: [
          if (_isLoadingTicket) const LinearProgressIndicator(),
          if (_error != null)
            Container(
              padding: const EdgeInsets.all(AppTheme.md),
              color: AppColors.errorLight,
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: AppColors.error),
                  const SizedBox(width: AppTheme.sm),
                  Expanded(
                    child: Text(
                      _error!,
                      style: const TextStyle(color: AppColors.error),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh, color: AppColors.error),
                    onPressed: _loadTicketData,
                  ),
                ],
              ),
            ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _refreshTicket,
              child: CustomScrollView(
                controller: _scrollController,
                slivers: [
                  SliverToBoxAdapter(child: _buildTicketInfo()),
                  if (_ticket.reply != null)
                    SliverToBoxAdapter(child: _buildReplySection()),
                  if (_ticket.history != null && _ticket.history!.isNotEmpty)
                    SliverToBoxAdapter(
                      child: Container(
                        margin: const EdgeInsets.all(AppTheme.md),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'History',
                              style: AppTheme.bodyLarge.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: AppTheme.sm),
                            TicketTimeline(history: _ticket.history!),
                          ],
                        ),
                      ),
                    ),
                  SliverToBoxAdapter(child: _buildChatList(user?.id)),
                ],
              ),
            ),
          ),
          _buildMessageInput(),
        ],
      ),
    );
  }

  Widget _buildTicketInfo() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppTheme.lg),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Case: ${_ticket.caseNumber}',
                style: AppTheme.bodyMedium.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Row(
                children: [
                  _buildChip(
                    _ticket.priority.toUpperCase(),
                    _getPriorityColor(_ticket.priority),
                  ),
                  const SizedBox(width: AppTheme.sm),
                  _buildChip(
                    _ticket.displayStatus.toUpperCase(),
                    _getStatusColor(_ticket.status),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: AppTheme.md),
          Text(
            _ticket.issueTitle,
            style: AppTheme.headline3.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppTheme.sm),
          Text(
            _ticket.description,
            style: AppTheme.bodyMedium.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppTheme.md),
          Wrap(
            spacing: AppTheme.md,
            runSpacing: AppTheme.sm,
            children: [
              _buildInfoItem(
                'Category',
                _ticket.category.replaceAll('_', ' ').toUpperCase(),
              ),
              if (_ticket.hospital != null)
                _buildInfoItem(
                  'Hospital',
                  _ticket.hospital!['name'] ?? 'Unknown',
                ),
              if (_ticket.assignedAdmin != null)
                _buildInfoItem(
                  'Assigned To',
                  _ticket.assignedAdmin!['name'] ?? 'Unknown',
                ),
              _buildInfoItem(
                'Created',
                DateFormat('MMM dd, yyyy').format(_ticket.createdAt),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChip(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppTheme.sm,
        vertical: AppTheme.xs,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
      ),
      child: Text(
        label,
        style: AppTheme.bodySmall.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildInfoItem(String label, String value) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          '$label: ',
          style: AppTheme.bodySmall.copyWith(
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
        Text(
          value,
          style: AppTheme.bodySmall.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildReplySection() {
    final reply = _ticket.reply!;
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.all(AppTheme.md),
      padding: const EdgeInsets.all(AppTheme.lg),
      decoration: BoxDecoration(
        color: AppColors.successLight,
        borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
        border: Border.all(color: AppColors.success.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppTheme.xs),
                decoration: BoxDecoration(
                  color: AppColors.success,
                  borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                ),
                child: const Icon(
                  Icons.verified,
                  color: AppColors.textOnPrimary,
                  size: 20,
                ),
              ),
              const SizedBox(width: AppTheme.sm),
              Text(
                'Doctor Recommendation',
                style: AppTheme.headline3.copyWith(
                  color: AppColors.success,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppTheme.md),
          _buildReplyDetail('Doctor', reply.doctorName),
          _buildReplyDetail('Specialization', reply.specialization),
          _buildReplyDetail('Phone', reply.doctorPhone),
          Container(
            height: 1,
            color: AppColors.success.withOpacity(0.3),
            margin: const EdgeInsets.symmetric(vertical: AppTheme.sm),
          ),
          Text(
            'Message:',
            style: AppTheme.bodySmall.copyWith(
              color: AppColors.success,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppTheme.xs),
          Text(
            reply.replyMessage,
            style: AppTheme.bodyMedium.copyWith(color: AppColors.textPrimary),
          ),
          const SizedBox(height: AppTheme.sm),
          Align(
            alignment: Alignment.bottomRight,
            child: Text(
              'Replied at: ${DateFormat('MMM dd, yyyy').format(reply.repliedAt)}',
              style: AppTheme.caption.copyWith(color: AppColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReplyDetail(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppTheme.xs),
      child: Row(
        children: [
          Text(
            '$label: ',
            style: AppTheme.bodySmall.copyWith(
              color: AppColors.success,
              fontWeight: FontWeight.w600,
            ),
          ),
          Text(
            value,
            style: AppTheme.bodySmall.copyWith(color: AppColors.textPrimary),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    final normalized = status.replaceAll('-', '_');
    switch (normalized) {
      case 'pending':
        return AppColors.warning;
      case 'assigned':
        return AppColors.primary;
      case 'in_progress':
        return AppColors.info;
      case 'resolved':
        return AppColors.success;
      case 'closed':
        return AppColors.gray500;
      default:
        return AppColors.gray500;
    }
  }

  Color _getPriorityColor(String priority) {
    switch (priority.toLowerCase()) {
      case 'low':
        return AppColors.success;
      case 'medium':
        return AppColors.info;
      case 'high':
        return AppColors.warning;
      case 'emergency':
        return AppColors.error;
      default:
        return AppColors.gray500;
    }
  }

  Widget _buildChatList(String? currentUserId) {
    return Consumer<ChatProvider>(
      builder: (context, chatProvider, _) {
        if (chatProvider.isLoading && chatProvider.messages.isEmpty) {
          return const SizedBox(
            height: 200,
            child: Center(child: CircularProgressIndicator()),
          );
        }

        if (chatProvider.error != null && chatProvider.messages.isEmpty) {
          return Container(
            height: 200,
            padding: const EdgeInsets.all(AppTheme.md),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.error_outline,
                  color: AppColors.error,
                  size: 48,
                ),
                const SizedBox(height: AppTheme.md),
                Text(
                  chatProvider.error!,
                  style: const TextStyle(color: AppColors.error),
                ),
                const SizedBox(height: AppTheme.sm),
                ElevatedButton(
                  onPressed: () => chatProvider.loadMessages(_ticket.id),
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        }

        if (chatProvider.messages.isEmpty) {
          return Container(
            height: 150,
            padding: const EdgeInsets.all(AppTheme.md),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.chat_bubble_outline,
                  size: 48,
                  color: AppColors.textTertiary,
                ),
                const SizedBox(height: AppTheme.md),
                Text(
                  'No messages yet',
                  style: AppTheme.bodyLarge.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          );
        }

        return Container(
          height: 300,
          padding: const EdgeInsets.all(AppTheme.md),
          child: ListView.builder(
            itemCount: chatProvider.messages.length,
            itemBuilder: (context, index) {
              final msg = chatProvider.messages[index];
              final isMe = chatProvider.isMessageFromCurrentUser(
                msg,
                currentUserId,
              );
              return _buildMessageBubble(msg, isMe);
            },
          ),
        );
      },
    );
  }

  Widget _buildMessageBubble(dynamic msg, bool isMe) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: AppTheme.md),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        padding: const EdgeInsets.all(AppTheme.md),
        decoration: BoxDecoration(
          color: isMe ? AppColors.chatBubbleMe : AppColors.chatBubbleAdmin,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(AppTheme.radiusLarge),
            topRight: const Radius.circular(AppTheme.radiusLarge),
            bottomLeft: Radius.circular(isMe ? AppTheme.radiusLarge : 0),
            bottomRight: Radius.circular(isMe ? 0 : AppTheme.radiusLarge),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!isMe)
              Padding(
                padding: const EdgeInsets.only(bottom: AppTheme.xs),
                child: Text(
                  msg.senderName,
                  style: AppTheme.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            Text(
              msg.text,
              style: AppTheme.bodyMedium.copyWith(
                color: isMe ? AppColors.textOnPrimary : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: AppTheme.xs),
            Text(
              DateFormat('hh:mm a').format(msg.createdAt),
              style: AppTheme.caption.copyWith(
                color: isMe
                    ? AppColors.textOnPrimary.withOpacity(0.7)
                    : AppColors.chatTimestamp,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: const EdgeInsets.all(AppTheme.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: AppTheme.cardShadow,
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _messageController,
              decoration: InputDecoration(
                hintText: 'Type a message...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                ),
              ),
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          const SizedBox(width: AppTheme.sm),
          Consumer<ChatProvider>(
            builder: (context, chatProvider, _) {
              return IconButton(
                onPressed: chatProvider.isLoading ? null : _sendMessage,
                icon: const Icon(Icons.send),
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.textOnPrimary,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
