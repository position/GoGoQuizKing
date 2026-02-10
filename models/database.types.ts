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
                    full_name: string | null;
                    avatar_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
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
        };
        Functions: {
            increment_quiz_play_count: {
                Args: { quiz_uuid: string };
                Returns: void;
            };
        };
    };
}
