// Supabase Database Types
// 데이터베이스 스키마에 맞는 타입 정의

import type { QuizCategory, DifficultyLevel, QuestionType } from './quiz';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string | null;
                    full_name: string | null;
                    avatar_url: string | null;
                    preferred_username: string | null;
                    provider: string | null;
                    points: number;
                    level: number;
                    streak_days: number;
                    last_active_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    preferred_username?: string | null;
                    provider?: string | null;
                    points?: number;
                    level?: number;
                    streak_days?: number;
                    last_active_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    preferred_username?: string | null;
                    provider?: string | null;
                    points?: number;
                    level?: number;
                    streak_days?: number;
                    last_active_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            quizzes: {
                Row: {
                    id: string;
                    created_by: string;
                    title: string;
                    description: string | null;
                    category: string;
                    grade_level: number;
                    difficulty: string;
                    is_public: boolean;
                    play_count: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    created_by: string;
                    title: string;
                    description?: string | null;
                    category?: string;
                    grade_level?: number;
                    difficulty?: string;
                    is_public?: boolean;
                    play_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    created_by?: string;
                    title?: string;
                    description?: string | null;
                    category?: string;
                    grade_level?: number;
                    difficulty?: string;
                    is_public?: boolean;
                    play_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            quiz_questions: {
                Row: {
                    id: string;
                    quiz_id: string;
                    question_type: string;
                    question_text: string;
                    question_image_url: string | null;
                    correct_answer: string;
                    options: Json | null;
                    hint: string | null;
                    order_index: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    quiz_id: string;
                    question_type?: string;
                    question_text: string;
                    question_image_url?: string | null;
                    correct_answer: string;
                    options?: Json | null;
                    hint?: string | null;
                    order_index?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    quiz_id?: string;
                    question_type?: string;
                    question_text?: string;
                    question_image_url?: string | null;
                    correct_answer?: string;
                    options?: Json | null;
                    hint?: string | null;
                    order_index?: number;
                    created_at?: string;
                };
            };
            quiz_attempts: {
                Row: {
                    id: string;
                    user_id: string;
                    quiz_id: string;
                    score: number;
                    total_questions: number;
                    time_spent: number | null;
                    answers: Json | null;
                    completed_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    quiz_id: string;
                    score: number;
                    total_questions: number;
                    time_spent?: number | null;
                    answers?: Json | null;
                    completed_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    quiz_id?: string;
                    score?: number;
                    total_questions?: number;
                    time_spent?: number | null;
                    answers?: Json | null;
                    completed_at?: string;
                };
            };
            notices: {
                Row: {
                    id: string;
                    created_by: string;
                    title: string;
                    content: string;
                    is_pinned: boolean;
                    view_count: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    created_by: string;
                    title: string;
                    content: string;
                    is_pinned?: boolean;
                    view_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    created_by?: string;
                    title?: string;
                    content?: string;
                    is_pinned?: boolean;
                    view_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            notice_comments: {
                Row: {
                    id: string;
                    notice_id: string;
                    created_by: string;
                    content: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    notice_id: string;
                    created_by: string;
                    content: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    notice_id?: string;
                    created_by?: string;
                    content?: string;
                    created_at?: string;
                };
            };
            point_history: {
                Row: {
                    id: string;
                    user_id: string;
                    points: number;
                    action_type: string;
                    description: string | null;
                    metadata: Json;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    points: number;
                    action_type: string;
                    description?: string | null;
                    metadata?: Json;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    points?: number;
                    action_type?: string;
                    description?: string | null;
                    metadata?: Json;
                    created_at?: string;
                };
            };
        };
        Views: {
            level_info: {
                Row: {
                    level: number;
                    name: string;
                    icon: string;
                    min_points: number;
                    max_points: number;
                };
            };
            user_point_summary: {
                Row: {
                    user_id: string;
                    points: number;
                    level: number;
                    streak_days: number;
                    last_active_at: string | null;
                    level_name: string;
                    level_icon: string;
                    min_points: number;
                    max_points: number;
                    level_progress: number;
                };
            };
        };
        Functions: {
            increment_quiz_play_count: {
                Args: { quiz_uuid: string };
                Returns: void;
            };
            add_points: {
                Args: {
                    p_user_id: string;
                    p_points: number;
                    p_action_type: string;
                    p_description?: string;
                    p_metadata?: Json;
                };
                Returns: { new_points: number; new_level: number; level_up: boolean }[];
            };
            check_daily_attendance: {
                Args: { p_user_id: string };
                Returns: { attendance_points: number; new_streak: number; already_checked: boolean }[];
            };
            award_quiz_points: {
                Args: {
                    p_user_id: string;
                    p_quiz_id: string;
                    p_correct_count: number;
                    p_total_questions: number;
                    p_consecutive_correct?: number;
                };
                Returns: { total_earned: number; base_points: number; bonus_points: number }[];
            };
            award_quiz_create_points: {
                Args: { p_user_id: string; p_quiz_id: string };
                Returns: number;
            };
            calculate_level: {
                Args: { total_points: number };
                Returns: number;
            };
            get_period_rankings: {
                Args: {
                    p_period?: string;
                    p_limit?: number;
                };
                Returns: {
                    user_id: string;
                    full_name: string | null;
                    preferred_username: string | null;
                    avatar_url: string | null;
                    period_points: number;
                    total_points: number;
                    level: number;
                    rank: number;
                }[];
            };
            get_user_ranking: {
                Args: {
                    p_user_id: string;
                    p_period?: string;
                };
                Returns: {
                    user_id: string;
                    full_name: string | null;
                    preferred_username: string | null;
                    avatar_url: string | null;
                    period_points: number;
                    total_points: number;
                    level: number;
                    rank: number;
                    total_users: number;
                }[];
            };
            get_category_rankings: {
                Args: {
                    p_category: string;
                    p_limit?: number;
                };
                Returns: {
                    user_id: string;
                    full_name: string | null;
                    preferred_username: string | null;
                    avatar_url: string | null;
                    category_points: number;
                    total_points: number;
                    level: number;
                    rank: number;
                }[];
            };
            get_quiz_attempt_rankings: {
                Args: {
                    p_limit?: number;
                };
                Returns: {
                    user_id: string;
                    full_name: string | null;
                    preferred_username: string | null;
                    avatar_url: string | null;
                    attempt_count: number;
                    total_points: number;
                    level: number;
                    rank: number;
                }[];
            };
        };
    };
}
