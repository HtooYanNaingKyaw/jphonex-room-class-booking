-- CreateTable
CREATE TABLE `Role` (
    `id` TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(32) NOT NULL,

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(32) NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(128) NOT NULL,
    `gender` ENUM('male', 'female', 'other') NULL,
    `dob` DATE NULL,
    `status` ENUM('active', 'inactive', 'locked') NOT NULL DEFAULT 'active',
    `points_balance` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,
    `role_id` TINYINT UNSIGNED NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `refresh_token` CHAR(64) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Session_refresh_token_key`(`refresh_token`),
    INDEX `Session_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomType` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) NOT NULL,
    `code` VARCHAR(32) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `RoomType_name_key`(`name`),
    UNIQUE INDEX `RoomType_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) NOT NULL,
    `room_type_id` BIGINT UNSIGNED NOT NULL,
    `capacity` INTEGER NOT NULL,
    `status` ENUM('available', 'maintenance') NOT NULL DEFAULT 'available',
    `floor` INTEGER NULL,
    `price_per_hour` DECIMAL(10, 2) NULL,
    `features` JSON NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `Room_status_idx`(`status`),
    INDEX `Room_room_type_id_idx`(`room_type_id`),
    UNIQUE INDEX `Room_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Class` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` MEDIUMTEXT NULL,
    `instructor_id` BIGINT UNSIGNED NOT NULL,
    `max_seats` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `Class_instructor_id_idx`(`instructor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassSchedule` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `class_id` BIGINT UNSIGNED NOT NULL,
    `room_id` BIGINT UNSIGNED NULL,
    `starts_at` DATETIME(3) NOT NULL,
    `ends_at` DATETIME(3) NOT NULL,
    `capacity_override` INTEGER NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `ClassSchedule_class_id_starts_at_ends_at_idx`(`class_id`, `starts_at`, `ends_at`),
    INDEX `ClassSchedule_room_id_starts_at_ends_at_idx`(`room_id`, `starts_at`, `ends_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `kind` ENUM('room', 'class') NOT NULL,
    `room_id` BIGINT UNSIGNED NULL,
    `class_schedule_id` BIGINT UNSIGNED NULL,
    `status` ENUM('pending', 'confirmed', 'completed', 'canceled') NOT NULL DEFAULT 'pending',
    `source` ENUM('web', 'mobile', 'walkin') NOT NULL,
    `starts_at` DATETIME(3) NOT NULL,
    `ends_at` DATETIME(3) NOT NULL,
    `holds_expires_at` DATETIME(3) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `Booking_room_id_starts_at_ends_at_status_idx`(`room_id`, `starts_at`, `ends_at`, `status`),
    INDEX `Booking_class_schedule_id_status_idx`(`class_schedule_id`, `status`),
    INDEX `Booking_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `Booking_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `booking_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'MMK',
    `type` ENUM('deposit', 'balance', 'refund') NOT NULL,
    `provider` VARCHAR(32) NOT NULL,
    `provider_ref` VARCHAR(128) NULL,
    `status` ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
    `paid_at` DATETIME(3) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `Payment_booking_id_status_idx`(`booking_id`, `status`),
    INDEX `Payment_paid_at_idx`(`paid_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PointsLedger` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `booking_id` BIGINT UNSIGNED NULL,
    `delta` INTEGER NOT NULL,
    `reason` VARCHAR(64) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `PointsLedger_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attendance` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `class_schedule_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `status` ENUM('present', 'absent') NOT NULL,
    `checked_at` DATETIME(3) NOT NULL,

    INDEX `Attendance_checked_at_idx`(`checked_at`),
    UNIQUE INDEX `Attendance_class_schedule_id_user_id_key`(`class_schedule_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Policy` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `body` MEDIUMTEXT NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    INDEX `Policy_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `actor_user_id` BIGINT UNSIGNED NOT NULL,
    `action` VARCHAR(64) NOT NULL,
    `entity_type` VARCHAR(48) NOT NULL,
    `entity_id` BIGINT UNSIGNED NOT NULL,
    `meta` JSON NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `ActivityLog_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `ActivityLog_actor_user_id_created_at_idx`(`actor_user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `body` MEDIUMTEXT NOT NULL,
    `type` VARCHAR(32) NOT NULL,
    `priority` VARCHAR(16) NOT NULL,
    `image_url` VARCHAR(512) NULL,
    `deep_link` VARCHAR(512) NULL,
    `cta_label` VARCHAR(64) NULL,
    `cta_link` VARCHAR(512) NULL,
    `is_sticky` BOOLEAN NOT NULL DEFAULT false,
    `publish_at` DATETIME(3) NOT NULL,
    `expire_at` DATETIME(3) NULL,
    `status` VARCHAR(16) NOT NULL,
    `author_user_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventAudience` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `event_id` BIGINT UNSIGNED NOT NULL,
    `role_id` TINYINT UNSIGNED NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `tag` VARCHAR(64) NULL,

    INDEX `EventAudience_event_id_idx`(`event_id`),
    INDEX `EventAudience_role_id_idx`(`role_id`),
    INDEX `EventAudience_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventTag` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `event_id` BIGINT UNSIGNED NOT NULL,
    `tag` VARCHAR(64) NOT NULL,

    INDEX `EventTag_tag_idx`(`tag`),
    UNIQUE INDEX `EventTag_event_id_tag_key`(`event_id`, `tag`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventRead` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `event_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `read_at` DATETIME(3) NOT NULL,
    `dismissed` BOOLEAN NOT NULL DEFAULT false,

    INDEX `EventRead_user_id_read_at_idx`(`user_id`, `read_at`),
    UNIQUE INDEX `EventRead_event_id_user_id_key`(`event_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventMedia` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `event_id` BIGINT UNSIGNED NOT NULL,
    `url` VARCHAR(512) NOT NULL,
    `kind` VARCHAR(16) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `EventMedia_event_id_sort_order_idx`(`event_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_room_type_id_fkey` FOREIGN KEY (`room_type_id`) REFERENCES `RoomType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Class` ADD CONSTRAINT `Class_instructor_id_fkey` FOREIGN KEY (`instructor_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassSchedule` ADD CONSTRAINT `ClassSchedule_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `Class`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassSchedule` ADD CONSTRAINT `ClassSchedule_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Room`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Room`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_class_schedule_id_fkey` FOREIGN KEY (`class_schedule_id`) REFERENCES `ClassSchedule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PointsLedger` ADD CONSTRAINT `PointsLedger_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PointsLedger` ADD CONSTRAINT `PointsLedger_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_class_schedule_id_fkey` FOREIGN KEY (`class_schedule_id`) REFERENCES `ClassSchedule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_actor_user_id_fkey` FOREIGN KEY (`actor_user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_author_user_id_fkey` FOREIGN KEY (`author_user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventAudience` ADD CONSTRAINT `EventAudience_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `Event`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventAudience` ADD CONSTRAINT `EventAudience_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventAudience` ADD CONSTRAINT `EventAudience_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventTag` ADD CONSTRAINT `EventTag_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `Event`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventRead` ADD CONSTRAINT `EventRead_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `Event`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventRead` ADD CONSTRAINT `EventRead_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventMedia` ADD CONSTRAINT `EventMedia_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `Event`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
