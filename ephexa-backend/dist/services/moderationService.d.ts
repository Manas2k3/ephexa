import type { ReportBody } from '../types';
export declare function reportUser(reporterId: string, reportedId: string, data: ReportBody): Promise<void>;
export declare function blockUser(blockerId: string, blockedId: string): Promise<void>;
export declare function unblockUser(blockerId: string, blockedId: string): Promise<void>;
export declare function getBlockedUsers(userId: string): Promise<{
    id: string;
    blockedAt: string;
}[]>;
export declare function isBlocked(blockerId: string, blockedId: string): Promise<boolean>;
//# sourceMappingURL=moderationService.d.ts.map