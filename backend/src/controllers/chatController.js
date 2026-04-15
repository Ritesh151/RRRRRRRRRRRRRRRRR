import Message from "../models/Message.js";
import Ticket from "../models/Ticket.js";
import TicketService from "../services/ticketService.js";

export const sendMessage = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { content } = req.body;
        
        console.log("=== SEND MESSAGE DEBUG ===");
        console.log("Ticket ID:", ticketId);
        console.log("User:", req.user.id, req.user.role);
        
        if (!ticketId) {
            return res.status(400).json({ message: "Ticket ID is required" });
        }
        
        if (!content || content.trim() === '') {
            return res.status(400).json({ message: "Message content is required" });
        }

        // Check if ticket exists and user has access
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            console.log("Ticket not found:", ticketId);
            return res.status(404).json({ message: "Ticket not found" });
        }

        console.log("Ticket found:", ticket.caseNumber);

        // FIX: Use user.id instead of user._id since that's what auth middleware provides
        const senderId = req.user.id;
        
        // Check if user is authorized to access this ticket
        const isPatient = ticket.patientId.toString() === senderId.toString();
        const isAdmin = req.user.role === 'admin' || req.user.role === 'super';
        const isAssignedAdmin = ticket.assignedAdminId && ticket.assignedAdminId.toString() === senderId.toString();

        console.log("Is patient:", isPatient);
        console.log("Is admin:", isAdmin);
        console.log("Is assigned admin:", isAssignedAdmin);

        // Allow: patient who created the ticket, assigned admin, or super user
        if (!isPatient && !isAssignedAdmin && !isAdmin) {
            console.log("Not authorized to access this ticket");
            return res.status(403).json({ message: "Not authorized to access this ticket" });
        }

        // Create message
        const message = await Message.create({
            ticketId,
            senderId,
            content: content.trim()
        });

        // Populate sender details
        await message.populate('senderId', 'name role email');

        // Add history entry for message
        await TicketService.addMessageToHistory(
            ticketId,
            senderId,
            req.user.role,
            req.user.name,
            content.trim()
        );

        // FIX: Update ticket status if it's pending and an admin is replying
        if (ticket.status === 'pending' && (isAdmin || isAssignedAdmin)) {
            await TicketService.updateTicketStatus(
                ticketId,
                'assigned',
                senderId,
                req.user.role,
                req.user.name,
                ticket.status
            );
            
            // FIX: Assign admin if not already assigned
            if (!ticket.assignedAdminId && (isAdmin || isAssignedAdmin)) {
                await TicketService.assignTicket(
                    ticketId,
                    senderId,
                    req.user.name,
                    senderId,
                    req.user.role,
                    req.user.name
                );
            }
        }

        const responseMessage = {
            id: message._id,
            _id: message._id,
            ticketId: message.ticketId,
            senderId: message.senderId._id,
            senderRole: message.senderId.role,
            senderName: message.senderId.name,
            text: message.content,
            content: message.content,
            createdAt: message.createdAt
        };

        console.log("Message sent successfully:", responseMessage.id);
        console.log("================================");

        res.status(201).json(responseMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { ticketId } = req.params;
        
        console.log("=== GET MESSAGES DEBUG ===");
        console.log("Ticket ID:", ticketId);
        console.log("User:", req.user.id, req.user.role);
        
        if (!ticketId) {
            return res.status(400).json({ message: "Ticket ID is required" });
        }

        // Check if ticket exists and user has access
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            console.log("Ticket not found:", ticketId);
            return res.status(404).json({ message: "Ticket not found" });
        }

        console.log("Ticket found:", ticket.caseNumber);

        const senderId = req.user.id;
        
        // Check if user is authorized to access this ticket
        const isPatient = ticket.patientId.toString() === senderId.toString();
        const isAdmin = req.user.role === 'admin' || req.user.role === 'super';
        const isAssignedAdmin = ticket.assignedAdminId && ticket.assignedAdminId.toString() === senderId.toString();

        console.log("Is patient:", isPatient);
        console.log("Is admin:", isAdmin);
        console.log("Is assigned admin:", isAssignedAdmin);

        // Allow: patient who created the ticket, assigned admin, or super user
        if (!isPatient && !isAssignedAdmin && !isAdmin) {
            console.log("Not authorized to access this ticket");
            return res.status(403).json({ message: "Not authorized to access this ticket" });
        }

        // Get messages for this ticket, sorted by creation date
        const messages = await Message.find({ ticketId })
            .populate('senderId', 'name role email')
            .sort({ createdAt: 1 });

        const responseMessages = messages.map(message => ({
            id: message._id,
            _id: message._id,
            ticketId: message.ticketId,
            senderId: message.senderId._id,
            senderRole: message.senderId.role,
            senderName: message.senderId.name,
            text: message.content,
            content: message.content,
            createdAt: message.createdAt
        }));

        console.log("Messages found:", responseMessages.length);
        console.log("================================");

        res.json(responseMessages);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ message: "Server error" });
    }
};
