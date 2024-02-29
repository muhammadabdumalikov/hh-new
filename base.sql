create table users(
	id varchar(24) not null primary key,
	linkedin_profile_id varchar(128) unique not null,
  first_name varchar(32),
  last_name varchar(32),
  profile_picture text,
	skills jsonb,
	summary text,
	birth_date varchar(12),
	location jsonb,
	position_groups jsonb,
	education jsonb,
  industry varchar(128),
	is_deleted boolean default false,
	created_at timestamptz default current_timestamp,
	updated_at timestamptz
);

alter table users
add column sub_title varchar(256);
alter table users
add column contact_info jsonb;

create table companies(
	id varchar(24) not null primary key,
	linkedin_profile_id varchar(64) unique not null,
  name varchar(32),
  tagline varchar(256),
	locations jsonb,
	industries jsonb,
	description text,
	followers varchar(12),
	profile_picture text,
	background_image text,
  specialities jsonb,
  urls jsonb,
  staff jsonb,
  founded_year smallint,
  phone varchar(24),
	is_deleted boolean default false,
	created_at timestamptz default current_timestamp,
	updated_at timestamptz
);