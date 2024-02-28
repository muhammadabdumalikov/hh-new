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