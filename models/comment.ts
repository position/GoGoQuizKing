// Notice 댓글 (기존)
export interface CommentInfo {
    content: string;
    created_at: string;
    id: string;
    parent_id: number | null;
    post_id: number;
    updated_at: string;
    user_id: string;
    profiles?: {
        full_name: string | null;
        avatar_url: string | null;
    };
}

// 퀴즈 댓글
export interface QuizComment {
    id: string;
    quiz_id: string;
    user_id: string;
    parent_id: string | null;
    content: string;
    created_at: string;
    updated_at: string;
    profiles?: {
        full_name: string | null;
        preferred_username: string | null;
        avatar_url: string | null;
        level?: number;
    };
    mentions?: QuizCommentMention[];
    replies?: QuizComment[];
}

export interface MentionCandidate {
    user_id: string;
    full_name: string | null;
    preferred_username: string | null;
    avatar_url: string | null;
    level?: number;
}

export interface QuizCommentMention {
    id?: string;
    comment_id?: string;
    mentioned_user_id: string;
    mention_text: string;
    start_offset: number;
    length: number;
}

// 퀴즈 좋아요
export interface QuizLike {
    id: string;
    quiz_id: string;
    user_id: string;
    created_at: string;
}

// 퀴즈 댓글 작성 요청
export interface QuizCommentCreateRequest {
    quiz_id: string;
    content: string;
    parent_id?: string;
    mentions?: QuizCommentMention[];
}

// 퀴즈 댓글 수정 요청
export interface QuizCommentUpdateRequest {
    content: string;
    mentions?: QuizCommentMention[];
}

export interface MyQuizComment {
    id: string;
    quiz_id: string;
    user_id: string;
    parent_id: string | null;
    content: string;
    created_at: string;
    updated_at: string;
    quizzes: {
        title: string;
        category: string;
    } | null;
}

export interface CommentMentionNotification {
    id: string;
    recipient_id: string;
    actor_id: string;
    quiz_id: string;
    comment_id: string;
    preview: string;
    is_read: boolean;
    created_at: string;
    actor?: {
        full_name: string | null;
        preferred_username: string | null;
        avatar_url: string | null;
    } | null;
    quiz?: {
        title: string;
    } | null;
}

// 퀴즈 좋아요 상태
export interface QuizLikeStatus {
    isLiked: boolean;
    likeCount: number;
}
