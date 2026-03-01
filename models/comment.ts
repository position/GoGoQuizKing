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
        avatar_url: string | null;
    };
    replies?: QuizComment[];
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
}

// 퀴즈 댓글 수정 요청
export interface QuizCommentUpdateRequest {
    content: string;
}

// 퀴즈 좋아요 상태
export interface QuizLikeStatus {
    isLiked: boolean;
    likeCount: number;
}
