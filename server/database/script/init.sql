/*
 Navicat Premium Data Transfer

 Target Server Type    : PostgreSQL
 Target Server Version : 100019
 File Encoding         : 65001

 Date: 12/12/2021 21:12:07
*/


-- ----------------------------
-- Sequence structure for comment_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."comment_id_seq";
CREATE SEQUENCE "public"."comment_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for content_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."content_id_seq";
CREATE SEQUENCE "public"."content_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Table structure for comment
-- ----------------------------
DROP TABLE IF EXISTS "public"."comment";
CREATE TABLE "public"."comment" (
  "id" int4 NOT NULL DEFAULT nextval('comment_id_seq'::regclass),
  "content" text COLLATE "pg_catalog"."default" NOT NULL,
  "publish_time" timestamptz(6) NOT NULL DEFAULT now(),
  "ip" varchar(64) COLLATE "pg_catalog"."default",
  "content_id" int4,
  "comment_id" int4
)
;
COMMENT ON COLUMN "public"."comment"."content_id" IS '所属内容、帖子的id';
COMMENT ON COLUMN "public"."comment"."comment_id" IS '所属评论的id，评论可以回复';
COMMENT ON TABLE "public"."comment" IS '评论';

-- ----------------------------
-- Table structure for content
-- ----------------------------
DROP TABLE IF EXISTS "public"."content";
CREATE TABLE "public"."content" (
  "id" int4 NOT NULL DEFAULT nextval('content_id_seq'::regclass),
  "title" varchar(32) COLLATE "pg_catalog"."default",
  "content" text COLLATE "pg_catalog"."default",
  "publish_time" timestamptz(6) NOT NULL,
  "ip" varchar(32) COLLATE "pg_catalog"."default",
  "like" int4 NOT NULL DEFAULT 0,
  "disgust" int4 NOT NULL DEFAULT 0,
  "over" bool NOT NULL DEFAULT false,
  "update_time" timestamptz(6)
)
;

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."comment_id_seq"
OWNED BY "public"."comment"."id";
SELECT setval('"public"."comment_id_seq"', 3, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."content_id_seq"
OWNED BY "public"."content"."id";
SELECT setval('"public"."content_id_seq"', 3, true);

-- ----------------------------
-- Indexes structure for table comment
-- ----------------------------
CREATE UNIQUE INDEX "comment_id_uindex" ON "public"."comment" USING btree (
  "id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table comment
-- ----------------------------
ALTER TABLE "public"."comment" ADD CONSTRAINT "comment_pk" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table content
-- ----------------------------
CREATE UNIQUE INDEX "content_id_uindex" ON "public"."content" USING btree (
  "id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table content
-- ----------------------------
ALTER TABLE "public"."content" ADD CONSTRAINT "content_pk" PRIMARY KEY ("id");
