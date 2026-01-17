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
exports.getMe = getMe;
exports.updateMe = updateMe;
exports.blockUser = blockUser;
exports.unblockUser = unblockUser;
exports.reportUser = reportUser;
exports.getBlockedUsers = getBlockedUsers;
const moderationService = __importStar(require("../services/moderationService"));
const authService = __importStar(require("../services/authService"));
async function getMe(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const user = await authService.getCurrentUser(req.userId);
        res.json(user);
    }
    catch (error) {
        next(error);
    }
}
async function updateMe(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        // Currently, users can't update much - profile is minimal for privacy
        res.json({ message: 'Profile updated' });
    }
    catch (error) {
        next(error);
    }
}
async function blockUser(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const id = req.params.id;
        if (!id) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        await moderationService.blockUser(req.userId, id);
        res.json({ message: 'User blocked successfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            next(error);
        }
    }
}
async function unblockUser(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const id = req.params.id;
        await moderationService.unblockUser(req.userId, id);
        res.json({ message: 'User unblocked successfully' });
    }
    catch (error) {
        next(error);
    }
}
async function reportUser(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const id = req.params.id;
        const body = req.body;
        if (!id) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        if (!body.reason) {
            res.status(400).json({ error: 'Report reason is required' });
            return;
        }
        await moderationService.reportUser(req.userId, id, body);
        res.json({ message: 'Report submitted successfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            next(error);
        }
    }
}
async function getBlockedUsers(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const blocked = await moderationService.getBlockedUsers(req.userId);
        res.json(blocked);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=userController.js.map