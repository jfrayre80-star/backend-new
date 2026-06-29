# Diagramas Mermaid por Módulo

## 1. Módulo Users

```mermaid
erDiagram
    users {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar first_name
        varchar last_name
        varchar phone
        user_role role
        boolean is_active
        varchar device_id
        boolean must_change_password
        timestamptz last_login
    }

    teachers {
        uuid id PK
        uuid user_id FK
        varchar employee_code UK
        varchar specialization
        date hire_date
    }

    admins {
        uuid id PK
        uuid user_id FK
        varchar employee_code UK
        varchar department
        date hire_date
    }

    parents {
        uuid id PK
        uuid user_id FK
        varchar phone_secondary
        varchar emergency_contact
        varchar occupation
    }

    students {
        uuid id PK
        uuid user_id FK
        uuid parent_id FK
        varchar enrollment_number UK
        date birth_date
        decimal admission_score
        uuid specialty_id FK
        uuid current_semester_id FK
        boolean is_dual
        date enrollment_date
    }

    users ||--o| teachers : ""
    users ||--o| admins : ""
    users ||--o| parents : ""
    users ||--o| students : ""
    parents ||--o{ students : ""
```

## 2. Módulo Classrooms

```mermaid
erDiagram
    classroom_types {
        uuid id PK
        varchar code UK
        varchar name
        text description
        boolean is_active
    }

    classrooms {
        uuid id PK
        varchar name
        varchar code UK
        uuid classroom_type_id FK
        int capacity
        varchar building
        int floor
        boolean has_equipment
        boolean is_active
    }

    classroom_types ||--o{ classrooms : ""
```

## 3. Módulo Academic

```mermaid
erDiagram
    specialties {
        uuid id PK
        varchar name
        varchar code UK
        text description
        boolean is_active
    }

    semesters {
        uuid id PK
        varchar name
        int level
        varchar academic_period
        semester_type type
        boolean is_active
    }

    subjects {
        uuid id PK
        varchar code UK
        varchar name
        text description
        text image_url
        int credits
        uuid specialty_id FK
        boolean is_active
    }

    groups {
        uuid id PK
        varchar name
        varchar code UK
        varchar academic_period
        varchar grade_level
        uuid specialty_id FK
        uuid base_classroom_id FK
        uuid semester_id FK
        boolean is_dual
        boolean is_active
    }

    group_enrollments {
        uuid id PK
        uuid student_id FK
        uuid group_id FK
    }

    schedules {
        uuid id PK
        uuid subject_id FK
        uuid teacher_id FK
        uuid group_id FK
        uuid classroom_id FK
        varchar classroom_override
        smallint day_of_week
        time start_time
        time end_time
        varchar semester
        boolean is_active
    }

    extraordinary_enrollments {
        uuid id PK
        uuid student_id FK
        uuid subject_id FK
        uuid group_id FK
        uuid semester_id FK
        semester_type type
        decimal final_grade
        boolean is_approved
    }

    specialties ||--o{ subjects : ""
    specialties ||--o{ groups : ""
    classrooms ||--o{ groups : ""
    semesters ||--o{ groups : ""
    semesters ||--o{ extraordinary_enrollments : ""
    students ||--o{ group_enrollments : ""
    groups ||--o{ group_enrollments : ""
    groups ||--o{ schedules : ""
    subjects ||--o{ schedules : ""
    teachers ||--o{ schedules : ""
    classrooms ||--o{ schedules : ""
    students ||--o{ extraordinary_enrollments : ""
    subjects ||--o{ extraordinary_enrollments : ""
    groups ||--o{ extraordinary_enrollments : ""
    specialties ||--o{ students : ""
    semesters ||--o{ students : ""
```

## 4. Módulo Attendance

```mermaid
erDiagram
    qr_codes {
        uuid id PK
        uuid schedule_id FK
        uuid teacher_id FK
        varchar hash_value
        text encrypted_metadata
        timestamptz expires_at
        boolean is_used
    }

    attendance_records {
        uuid id PK
        uuid local_id
        uuid student_id FK
        uuid schedule_id FK
        attendance_status status
        uuid recorded_by FK
        varchar qr_hash
        timestamptz scan_timestamp
        timestamptz local_timestamp
        boolean is_offline
        boolean is_auto_closed
        date recorded_date
        jsonb audit_trail
    }

    access_logs {
        uuid id PK
        uuid student_id FK
        event_type event_type
        timestamptz scanned_at
        varchar device_terminal_id
        boolean is_synced
        boolean is_exit_return
        boolean requires_return
        timestamptz synced_at
    }

    justifications {
        uuid id PK
        uuid student_id FK
        uuid registered_by FK
        text reason
        date justification_date
        int module_number
        boolean is_active
    }

    sync_queue {
        uuid id PK
        varchar entity_type
        jsonb payload
        notification_status status
        int retry_count
        int max_retries
        text error_message
        varchar device_terminal_id
        timestamptz processed_at
    }

    offline_operations {
        uuid id PK
        uuid local_id
        varchar entity_type
        varchar operation_type
        jsonb payload
        timestamptz local_timestamp
        timestamptz synced_at
        notification_status status
        int retry_count
        uuid user_id FK
        varchar device_id
    }

    schedules ||--o{ qr_codes : ""
    teachers ||--o{ qr_codes : ""
    students ||--o{ attendance_records : ""
    schedules ||--o{ attendance_records : ""
    users ||--o{ attendance_records : ""
    students ||--o{ access_logs : ""
    students ||--o{ justifications : ""
    users ||--o{ justifications : ""
    users ||--o{ offline_operations : ""
```

## 5. Módulo Evaluation

```mermaid
erDiagram
    evaluation_schemes {
        uuid id PK
        uuid subject_id FK
        uuid teacher_id FK
        uuid group_id FK
        decimal partials_weight
        decimal semester_weight
        decimal attendance_minimum_percent
    }

    partial_configs {
        uuid id PK
        uuid evaluation_scheme_id FK
        int partial_number
    }

    partial_components {
        uuid id PK
        uuid partial_config_id FK
        varchar name
        decimal weight
        int sort_order
    }

    component_criteria {
        uuid id PK
        uuid partial_component_id FK
        varchar name
        decimal weight
        int sort_order
    }

    activities {
        uuid id PK
        uuid partial_component_id FK
        uuid subject_id FK
        uuid teacher_id FK
        uuid group_id FK
        varchar title
        text description
        text rubric_description
        varchar activity_type
        decimal weight
        boolean requires_file
        varchar file_types_allowed
        int max_file_size_mb
        timestamptz due_date
        decimal min_grade
        boolean is_reopened
        timestamptz reopened_until
        boolean reopened_for_all
        activity_status status
        boolean allows_team_submissions
        int max_team_size
    }

    activity_deliveries {
        uuid id PK
        uuid activity_id FK
        varchar title
        text description
        decimal weight
        timestamptz due_date
        boolean requires_file
        varchar file_types_allowed
        int max_file_size_mb
        int sort_order
    }

    activity_exceptions {
        uuid id PK
        uuid activity_id FK
        uuid student_id FK
        timestamptz reopened_until
        uuid created_by FK
    }

    activity_teams {
        uuid id PK
        uuid activity_id FK
        varchar name
    }

    activity_team_members {
        uuid id PK
        uuid team_id FK
        uuid student_id FK
    }

    submissions {
        uuid id PK
        uuid local_id
        uuid activity_delivery_id FK
        uuid student_id FK
        uuid team_id FK
        jsonb files
        timestamptz submitted_at
        timestamptz local_timestamp
        boolean is_offline
        int clock_drift_seconds
        boolean is_late
        decimal grade
        text feedback
        uuid graded_by FK
        timestamptz graded_at
        boolean is_auto_graded
    }

    partial_grades {
        uuid id PK
        uuid student_id FK
        uuid subject_id FK
        uuid partial_config_id FK
        decimal extra_points
        decimal total
        boolean is_blocked
        text blocked_reason
        boolean is_study_circle
    }

    component_scores {
        uuid id PK
        uuid partial_grade_id FK
        uuid partial_component_id FK
        decimal score
    }

    criterion_scores {
        uuid id PK
        uuid component_score_id FK
        uuid component_criterion_id FK
        decimal score
    }

    disciplinary_reports {
        uuid id PK
        uuid student_id FK
        uuid reported_by FK
        incident_severity severity
        text description
        text action_taken
        boolean is_notified_parent
    }

    subjects ||--o{ evaluation_schemes : ""
    teachers ||--o{ evaluation_schemes : ""
    groups ||--o{ evaluation_schemes : ""
    evaluation_schemes ||--o{ partial_configs : ""
    partial_configs ||--o{ partial_components : ""
    partial_components ||--o{ component_criteria : ""
    partial_components ||--o{ activities : ""
    activities ||--o{ activity_deliveries : ""
    activities ||--o{ activity_exceptions : ""
    activities ||--o{ activity_teams : ""
    activity_teams ||--o{ activity_team_members : ""
    activity_deliveries ||--o{ submissions : ""
    students ||--o{ submissions : ""
    partial_configs ||--o{ partial_grades : ""
    students ||--o{ partial_grades : ""
    subjects ||--o{ partial_grades : ""
    partial_grades ||--o{ component_scores : ""
    partial_components ||--o{ component_scores : ""
    component_scores ||--o{ criterion_scores : ""
    component_criteria ||--o{ criterion_scores : ""
    students ||--o{ disciplinary_reports : ""
    users ||--o{ disciplinary_reports : ""
```

## 6. Módulo Exams

```mermaid
erDiagram
    exams {
        uuid id PK
        uuid evaluation_scheme_id FK
        uuid activity_id FK
        uuid subject_id FK
        uuid teacher_id FK
        uuid group_id FK
        varchar title
        text description
        text instructions
        decimal weight
        int time_limit_minutes
        exam_type exam_type
        exam_category exam_category
        int max_attempts
        boolean requires_full_screen
        int max_focus_losses
        decimal passing_grade
        boolean is_active
        timestamptz published_at
    }

    question_contexts {
        uuid id PK
        uuid exam_id FK
        varchar title
        text content
        text image_url
        int sort_order
    }

    exam_questions {
        uuid id PK
        uuid exam_id FK
        question_type question_type
        text question_text
        decimal points
        int sort_order
        jsonb options
        jsonb correct_options
        varchar selection_type
        uuid question_context_id FK
        int max_characters
        text image_url
    }

    exam_attempts {
        uuid id PK
        uuid exam_id FK
        uuid student_id FK
        int attempt_number
        exam_attempt_status status
        decimal total_score
        decimal auto_score
        decimal manual_score
        int focus_loss_count
        timestamptz started_at
        timestamptz completed_at
        boolean is_auto_graded
    }

    exam_answers {
        uuid id PK
        uuid attempt_id FK
        uuid question_id FK
        varchar selected_option_label
        text answer_text
        boolean is_correct
        decimal score
    }

    focus_loss_logs {
        uuid id PK
        uuid attempt_id FK
        varchar event_type
        timestamptz occurred_at
        jsonb browser_info
    }

    evaluation_schemes ||--o{ exams : ""
    activities ||--o{ exams : ""
    subjects ||--o{ exams : ""
    teachers ||--o{ exams : ""
    groups ||--o{ exams : ""
    exams ||--o{ question_contexts : ""
    exams ||--o{ exam_questions : ""
    question_contexts ||--o{ exam_questions : ""
    exams ||--o{ exam_attempts : ""
    students ||--o{ exam_attempts : ""
    exam_attempts ||--o{ exam_answers : ""
    exam_questions ||--o{ exam_answers : ""
    exam_attempts ||--o{ focus_loss_logs : ""
```

## 7. Módulo Semester

```mermaid
erDiagram
    semester_configs {
        uuid id PK
        uuid evaluation_scheme_id FK
        varchar evaluation_type
        decimal exam_weight
        decimal project_weight
    }

    semester_grades {
        uuid id PK
        uuid student_id FK
        uuid subject_id FK
        uuid semester_config_id FK
        decimal exam_score
        decimal project_score
        decimal total
    }

    academic_history {
        uuid id PK
        uuid student_id FK
        uuid subject_id FK
        uuid semester_id FK
        uuid evaluation_scheme_id FK
        decimal partials_average
        decimal semester_exam_score
        decimal final_grade
        decimal extraordinary_grade
        boolean is_approved
    }

    evaluation_schemes ||--|| semester_configs : ""
    semester_configs ||--o{ semester_grades : ""
    students ||--o{ semester_grades : ""
    subjects ||--o{ semester_grades : ""
    students ||--o{ academic_history : ""
    subjects ||--o{ academic_history : ""
    semesters ||--o{ academic_history : ""
    evaluation_schemes ||--o{ academic_history : ""
```

## 8. Módulo Dual

```mermaid
erDiagram
    company_tutors {
        uuid id PK
        varchar full_name
        varchar position
        varchar phone
        varchar email
        varchar company_name
        boolean is_active
    }

    dual_enrollments {
        uuid id PK
        uuid student_id FK
        uuid company_tutor_id FK
        uuid academic_tutor_id FK
        date start_date
        date end_date
        boolean is_active
    }

    dual_monthly_subjects {
        uuid id PK
        uuid dual_enrollment_id FK
        uuid subject_id FK
        int month
        int year
        boolean is_tronco_comun
    }

    weekly_logs {
        uuid id PK
        uuid student_id FK
        uuid subject_id FK
        int week_number
        int year
        varchar title
        text description
        text file_url
        text company_feedback
        text academic_feedback
        decimal company_grade
        decimal academic_grade
        jsonb metadata
    }

    students ||--|| dual_enrollments : ""
    company_tutors ||--o{ dual_enrollments : ""
    teachers ||--o{ dual_enrollments : ""
    dual_enrollments ||--o{ dual_monthly_subjects : ""
    subjects ||--o{ dual_monthly_subjects : ""
    students ||--o{ weekly_logs : ""
    subjects ||--o{ weekly_logs : ""
```

## 9. Módulo Notifications

```mermaid
erDiagram
    notices {
        uuid id PK
        varchar title
        text content
        uuid created_by FK
        user_role target_role
        uuid target_group_id FK
        boolean is_global
        varchar priority
        timestamptz published_at
    }

    alerts {
        uuid id PK
        uuid student_id FK
        uuid parent_id FK
        varchar alert_type
        varchar title
        text message
        boolean is_read
        timestamptz read_at
        jsonb metadata
    }

    users ||--o{ notices : ""
    groups ||--o{ notices : ""
    students ||--o{ alerts : ""
    parents ||--o{ alerts : ""
```

## 10. Módulo Infrastructure

```mermaid
erDiagram
    system_config {
        uuid id PK
        varchar key UK
        text value
        text description
    }

    notification_queue {
        uuid id PK
        varchar type
        jsonb payload
        notification_status status
        int retry_count
        int max_retries
        text error_message
        timestamptz processed_at
        timestamptz scheduled_at
    }

    active_sessions {
        uuid id PK
        uuid user_id FK
        varchar device_id
        varchar token_hash
        inet ip_address
        text user_agent
        boolean is_active
        timestamptz expires_at
    }

    users ||--o{ active_sessions : ""
```
