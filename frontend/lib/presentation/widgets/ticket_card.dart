import 'package:flutter/material.dart';
import '../../data/models/ticket_model.dart';

class TicketCard extends StatelessWidget {
  final TicketModel ticket;
  final VoidCallback? onAction;
  final String? actionLabel;

  const TicketCard({
    super.key,
    required this.ticket,
    this.onAction,
    this.actionLabel,
  });

  // FIX: Normalize status to handle both 'in-progress' and 'in_progress'
  Color _statusColor() {
    final normalized = ticket.normalizedStatus;
    switch (normalized) {
      case 'pending':
        return Colors.orange;
      case 'in_progress':
        return Colors.blue;
      case 'assigned':
        return Colors.purple;
      case 'resolved':
        return Colors.green;
      case 'closed':
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(ticket.issueTitle),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(ticket.description),
            const SizedBox(height: 6),
            Text('Patient: ${ticket.patientName}'),
            if (ticket.assignedAdmin?['name'] != null)
              Text('Assigned Admin: ${ticket.assignedAdmin?['name']}'),
            Text(
              "Status: ${ticket.displayStatus}",
              style: TextStyle(color: _statusColor()),
            ),
          ],
        ),
        trailing: onAction != null
            ? ElevatedButton(
                onPressed: onAction,
                child: Text(actionLabel ?? "Action"),
              )
            : null,
      ),
    );
  }
}
