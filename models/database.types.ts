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
            badges: {
                Row: {
                    id: string;
                    name: string;
                    description: string;
                    icon: string;
                    category: string;
                    condition_type: string;
                    condition_value: number;
                    is_active: boolean;
                    sort_order: number;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    name: string;
                    description: string;
                    icon: string;
                    category: string;
                    condition_type: string;
                    condition_value?: number;
                    is_active?: boolean;
                    sort_order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string;
                    icon?: string;
                    category?: string;
                    condition_type?: string;
                    condition_value?: number;
                    is_active?: boolean;
                    sort_order?: number;
                    created_at?: string;
                };
            };
            user_badges: {
                Row: {
                    id: string;
                    user_id: string;
                    badge_id: string;
                    earned_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    badge_id: string;
                    earned_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    badge_id?: string;
                    earned_at?: string;
                };
            };
            user_achievements: {
                Row: {
                    id: string;
                    user_id: string;
                    achievement_type: string;
                    current_value: number;
                    last_updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    achievement_type: string;
                    current_value?: number;
                    last_updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    achievement_type?: string;
                    current_value?: number;
                    last_updated_at?: string;
                };
            };
            daily_quizzes: {
                Row: {
                    id: string;
                    quiz_id: string;
                    feature_date: string;
                    bonus_points: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    quiz_id: string;
                    feature_date: string;
                    bonus_points?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    quiz_id?: string;
                    feature_date?: string;
                    bonus_points?: number;
                    created_at?: string;
                };
            };
            daily_missions: {
                Row: {
                    id: string;
                    name: string;
                    description: string;
                    icon: string;
                    mission_type: string;
                    target_value: number;
                    reward_points: number;
                    is_active: boolean;
                    sort_order: number;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    name: string;
                    description: string;
                    icon: string;
                    mission_type: string;
                    target_value?: number;
                    reward_points: number;
                    is_active?: boolean;
                    sort_order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string;
                    icon?: string;
                    mission_type?: string;
                    target_value?: number;
                    reward_points?: number;
                    is_active?: boolean;
                    sort_order?: number;
                    created_at?: string;
                };
            };
            user_daily_missions: {
                Row: {
                    id: string;
                    user_id: string;
                    mission_id: string;
                    mission_date: string;
                    current_value: number;
                    is_completed: boolean;
                    completed_at: string | null;
                    reward_claimed: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    mission_id: string;
                    mission_date?: string;
                    current_value?: number;
                    is_completed?: boolean;
                    completed_at?: string | null;
                    reward_claimed?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    mission_id?: string;
                    mission_date?: string;
                    current_value?: number;
                    is_completed?: boolean;
                    completed_at?: string | null;
                    reward_claimed?: boolean;
                    created_at?: string;
                };
            };
            battle_rooms: {
                Row: {
                    id: string;
                    room_code: string | null;
                    host_id: string;
                    guest_id: string | null;
                    quiz_id: string | null;
                    status: string;
                    battle_type: string;
                    question_count: number;
                    current_question_index: number;
                    host_score: number;
                    guest_score: number;
                    host_answers: Json;
                    guest_answers: Json;
                    host_streak: number;
                    guest_streak: number;
                    winner_id: string | null;
                    question_started_at: string | null;
                    started_at: string | null;
                    finished_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    room_code?: string | null;
                    host_id: string;
                    guest_id?: string | null;
                    quiz_id?: string | null;
                    status?: string;
                    battle_type?: string;
                    question_count?: number;
                    current_question_index?: number;
                    host_score?: number;
                    guest_score?: number;
                    host_answers?: Json;
                    guest_answers?: Json;
                    host_streak?: number;
                    guest_streak?: number;
                    winner_id?: string | null;
                    question_started_at?: string | null;
                    started_at?: string | null;
                    finished_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    room_code?: string | null;
                    host_id?: string;
                    guest_id?: string | null;
                    quiz_id?: string | null;
                    status?: string;
                    battle_type?: string;
                    question_count?: number;
                    current_question_index?: number;
                    host_score?: number;
                    guest_score?: number;
                    host_answers?: Json;
                    guest_answers?: Json;
                    host_streak?: number;
                    guest_streak?: number;
                    winner_id?: string | null;
                    question_started_at?: string | null;
                    started_at?: string | null;
                    finished_at?: string | null;
                    created_at?: string;
                };
            };
            battle_matchmaking: {
                Row: {
                    id: string;
                    user_id: string;
                    user_level: number;
                    grade_level: number | null;
                    battle_type: string;
                    same_grade_only: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    user_level: number;
                    grade_level?: number | null;
                    battle_type?: string;
                    same_grade_only?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    user_level?: number;
                    grade_level?: number | null;
                    battle_type?: string;
                    same_grade_only?: boolean;
                    created_at?: string;
                };
            };
            battle_history: {
                Row: {
                    id: string;
                    room_id: string;
                    user_id: string;
                    opponent_id: string | null;
                    result: string;
                    my_score: number;
                    opponent_score: number;
                    correct_count: number;
                    total_questions: number;
                    avg_response_time: number | null;
                    points_earned: number;
                    ranking_points_earned: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    room_id: string;
                    user_id: string;
                    opponent_id?: string | null;
                    result: string;
                    my_score: number;
                    opponent_score: number;
                    correct_count?: number;
                    total_questions?: number;
                    avg_response_time?: number | null;
                    points_earned?: number;
                    ranking_points_earned?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    room_id?: string;
                    user_id?: string;
                    opponent_id?: string | null;
                    result?: string;
                    my_score?: number;
                    opponent_score?: number;
                    correct_count?: number;
                    total_questions?: number;
                    avg_response_time?: number | null;
                    points_earned?: number;
                    ranking_points_earned?: number;
                    created_at?: string;
                };
            };
            user_ranking_stats: {
                Row: {
                    id: string;
                    ranking_points: number;
                    season_wins: number;
                    season_losses: number;
                    season_draws: number;
                    total_wins: number;
                    total_losses: number;
                    total_draws: number;
                    win_streak: number;
                    best_win_streak: number;
                    total_battles: number;
                    perfect_wins: number;
                    season_id: number;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    ranking_points?: number;
                    season_wins?: number;
                    season_losses?: number;
                    season_draws?: number;
                    total_wins?: number;
                    total_losses?: number;
                    total_draws?: number;
                    win_streak?: number;
                    best_win_streak?: number;
                    total_battles?: number;
                    perfect_wins?: number;
                    season_id?: number;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    ranking_points?: number;
                    season_wins?: number;
                    season_losses?: number;
                    season_draws?: number;
                    total_wins?: number;
                    total_losses?: number;
                    total_draws?: number;
                    win_streak?: number;
                    best_win_streak?: number;
                    total_battles?: number;
                    perfect_wins?: number;
                    season_id?: number;
                    updated_at?: string;
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
            award_share_points: {
                Args: { p_user_id: string; p_quiz_id?: string };
                Returns: { success: boolean; points_earned: number; message: string }[];
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
            // Badge System Functions
            award_badge: {
                Args: {
                    p_user_id: string;
                    p_badge_id: string;
                };
                Returns: boolean;
            };
            update_achievement_progress: {
                Args: {
                    p_user_id: string;
                    p_achievement_type: string;
                    p_increment?: number;
                };
                Returns: number;
            };
            check_and_award_badges: {
                Args: {
                    p_user_id: string;
                };
                Returns: {
                    badge_id: string;
                    badge_name: string;
                    badge_icon: string;
                    newly_awarded: boolean;
                }[];
            };
            on_quiz_completed: {
                Args: {
                    p_user_id: string;
                    p_quiz_id: string;
                    p_correct_count: number;
                    p_total_questions: number;
                    p_category?: string;
                };
                Returns: {
                    badge_id: string;
                    badge_name: string;
                    badge_icon: string;
                }[];
            };
            on_quiz_created: {
                Args: {
                    p_user_id: string;
                    p_quiz_id: string;
                };
                Returns: {
                    badge_id: string;
                    badge_name: string;
                    badge_icon: string;
                }[];
            };
            check_streak_badges: {
                Args: {
                    p_user_id: string;
                };
                Returns: {
                    badge_id: string;
                    badge_name: string;
                    badge_icon: string;
                }[];
            };
            get_user_badges_with_status: {
                Args: {
                    p_user_id: string;
                };
                Returns: {
                    badge_id: string;
                    badge_name: string;
                    badge_description: string;
                    badge_icon: string;
                    category: string;
                    condition_type: string;
                    condition_value: number;
                    current_progress: number;
                    is_earned: boolean;
                    earned_at: string | null;
                    sort_order: number;
                }[];
            };
            // Daily Mission System Functions
            get_today_quiz: {
                Args: Record<string, never>;
                Returns: {
                    quiz_id: string;
                    title: string;
                    description: string | null;
                    category: string;
                    difficulty: string;
                    play_count: number;
                    bonus_points: number;
                    author_name: string;
                    author_avatar: string | null;
                }[];
            };
            get_user_daily_missions: {
                Args: {
                    p_user_id: string;
                };
                Returns: {
                    mission_id: string;
                    name: string;
                    description: string;
                    icon: string;
                    mission_type: string;
                    target_value: number;
                    current_value: number;
                    reward_points: number;
                    is_completed: boolean;
                    reward_claimed: boolean;
                    sort_order: number;
                }[];
            };
            update_mission_progress: {
                Args: {
                    p_user_id: string;
                    p_mission_type: string;
                    p_increment?: number;
                };
                Returns: {
                    mission_id: string;
                    mission_name: string;
                    is_newly_completed: boolean;
                    reward_points: number;
                }[];
            };
            claim_mission_reward: {
                Args: {
                    p_user_id: string;
                    p_mission_id: string;
                };
                Returns: {
                    success: boolean;
                    points_earned: number;
                    message: string;
                }[];
            };
            complete_today_quiz: {
                Args: {
                    p_user_id: string;
                    p_quiz_id: string;
                };
                Returns: {
                    is_today_quiz: boolean;
                    bonus_awarded: boolean;
                    bonus_points: number;
                }[];
            };
            // Battle System Functions
            create_battle_room: {
                Args: {
                    p_host_id: string;
                    p_battle_type?: string;
                    p_quiz_id?: string;
                };
                Returns: {
                    room_id: string;
                    room_code: string;
                }[];
            };
            join_battle_room: {
                Args: {
                    p_room_code: string;
                    p_user_id: string;
                };
                Returns: {
                    success: boolean;
                    room_id: string | null;
                    message: string;
                }[];
            };
            join_matchmaking: {
                Args: {
                    p_user_id: string;
                    p_battle_type?: string;
                    p_same_grade_only?: boolean;
                };
                Returns: {
                    success: boolean;
                    matched_room_id: string | null;
                    message: string;
                }[];
            };
            leave_matchmaking: {
                Args: {
                    p_user_id: string;
                };
                Returns: boolean;
            };
            submit_battle_answer: {
                Args: {
                    p_room_id: string;
                    p_user_id: string;
                    p_question_index: number;
                    p_answer: string;
                    p_response_time: number;
                };
                Returns: {
                    success: boolean;
                    is_correct: boolean;
                    score_earned: number;
                    new_total_score: number;
                    new_streak: number;
                }[];
            };
            finish_battle: {
                Args: {
                    p_room_id: string;
                };
                Returns: {
                    success: boolean;
                    winner_id: string | null;
                    host_final_score: number;
                    guest_final_score: number;
                    host_points_earned: number;
                    guest_points_earned: number;
                    host_rp_earned: number;
                    guest_rp_earned: number;
                }[];
            };
            get_battle_history: {
                Args: {
                    p_user_id: string;
                    p_limit?: number;
                    p_offset?: number;
                };
                Returns: {
                    id: string;
                    room_id: string;
                    result: string;
                    my_score: number;
                    opponent_score: number;
                    correct_count: number;
                    total_questions: number;
                    points_earned: number;
                    ranking_points_earned: number;
                    opponent_id: string;
                    opponent_name: string;
                    opponent_avatar: string | null;
                    created_at: string;
                }[];
            };
            get_battle_rankings: {
                Args: {
                    p_limit?: number;
                };
                Returns: {
                    rank: number;
                    user_id: string;
                    full_name: string | null;
                    preferred_username: string | null;
                    avatar_url: string | null;
                    ranking_points: number;
                    total_wins: number;
                    total_battles: number;
                    win_rate: number;
                }[];
            };
            get_random_quiz_for_battle: {
                Args: {
                    p_question_count?: number;
                };
                Returns: string;
            };
            calculate_battle_score: {
                Args: {
                    p_is_correct: boolean;
                    p_response_time: number;
                    p_streak: number;
                };
                Returns: number;
            };
        };
    };
}
