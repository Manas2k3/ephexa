"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChats = getChats;
exports.createChat = createChat;
exports.leaveChat = leaveChat;
exports.getMessages = getMessages;
const chatService = __importStar(require("../services/chatService"));
async function getChats(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const chats = await chatService.getUserChats(req.userId);
        res.json(chats);
    }
    catch (error) {
        next(error);
    }
}
async function createChat(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const body = req.body;
        if (!body.interest) {
            res.status(400).json({ error: 'Interest is required' });
            return;
        }
        const chat = await chatService.createOrJoinChat(req.userId, body);
        res.status(201).json(chat);
    }
    catch (error) {
        next(error);
    }
}
async function leaveChat(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const id = req.params.id;
        if (!id) {
            res.status(400).json({ error: 'Chat room ID is required' });
            return;
        }
        await chatService.leaveChat(req.userId, id);
        res.json({ message: 'Left chat successfully' });
    }
    catch (error) {
        next(error);
    }
}
async function getMessages(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const id = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const messages = await chatService.getChatMessages(id, page, limit);
        res.json(messages);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=chatController.js.map