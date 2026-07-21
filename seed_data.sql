-- SRM Easwari & IIT Delhi & Google India Seed Script
-- 1. EXTENSIVE CLEANUP FOR PREVIOUS RUNS
-- Delete from auth.users (cascades to profiles connected to them)
DELETE FROM auth.users WHERE email LIKE '%@srmeaswari.edu.in' OR email LIKE '%@iitd.ac.in' OR email LIKE '%@google.com';

-- Delete any orphaned profiles by matching college keys or company keys
DELETE FROM public.profiles WHERE college_key IN ('COLLEGE_SRM', 'COLLEGE_SRM_FACULTY', 'COLLEGE_IITD', 'COLLEGE_IITD_FACULTY') OR company_key IN ('COMPANY_GOOGLE', 'COMPANY_GOOGLE_ADMIN');

-- Delete any other orphaned profiles that are no longer linked to an auth user
DELETE FROM public.profiles WHERE id NOT IN (SELECT id FROM auth.users);

-- 2. SAFE INSERTS FOR INSTITUTES
INSERT INTO public.institutes (id, name, email_domain) VALUES
    ('e1b8b8f1-e123-4567-89ab-cdef01234567', 'SRM Easwari Engineering College', 'srmeaswari.edu.in'),
    ('e2b8b8f2-e123-4567-89ab-cdef01234568', 'Indian Institute of Technology Delhi', 'iitd.ac.in')
ON CONFLICT (email_domain) DO NOTHING;



-- 3. INSERTS FOR auth.users

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'de203ca4-b433-4597-849e-12a764616397',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ananya_banerjee_976@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'de203ca4-b433-4597-849e-12a764616397',
    'email', 'ananya_banerjee_976@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Ananya Banerjee',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '057017fd-99e7-451c-b16b-8df254aeca2e',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'jackson_bose_802@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '057017fd-99e7-451c-b16b-8df254aeca2e',
    'email', 'jackson_bose_802@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Jackson Bose',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '6d6a6c33-299c-4f5e-9ef9-a0b7a925c776',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'anjali_singh_354@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '6d6a6c33-299c-4f5e-9ef9-a0b7a925c776',
    'email', 'anjali_singh_354@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Anjali Singh',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '301c7b99-3e14-46a2-9cf4-ff4209a59f31',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'siddharth_johnson_274@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '301c7b99-3e14-46a2-9cf4-ff4209a59f31',
    'email', 'siddharth_johnson_274@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Siddharth Johnson',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'b93d52ac-a6bb-4fc5-ad7a-0207b35543a3',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rohan_thomas_806@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'b93d52ac-a6bb-4fc5-ad7a-0207b35543a3',
    'email', 'rohan_thomas_806@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Rohan Thomas',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '1423b79b-9a21-4ca4-804f-d127b179d51d',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rahul_patel_873@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '1423b79b-9a21-4ca4-804f-d127b179d51d',
    'email', 'rahul_patel_873@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Rahul Patel',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '0284bfc1-a659-4dc0-aba4-526e355f9621',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'shruti_kumar_426@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '0284bfc1-a659-4dc0-aba4-526e355f9621',
    'email', 'shruti_kumar_426@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Shruti Kumar',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'a6411e62-5197-4c59-8c0e-e26e594da741',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ananya_miller_977@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'a6411e62-5197-4c59-8c0e-e26e594da741',
    'email', 'ananya_miller_977@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Ananya Miller',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '0e58f79f-3ec7-4439-938a-51898cf1893d',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'meera_adhikari_638@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '0e58f79f-3ec7-4439-938a-51898cf1893d',
    'email', 'meera_adhikari_638@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Meera Adhikari',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '4c6d7311-1284-4938-8408-0f499a059ed7',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sid_joshi_919@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '4c6d7311-1284-4938-8408-0f499a059ed7',
    'email', 'sid_joshi_919@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sid Joshi',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '95e19cc5-42d9-4221-afa1-f610595887ae',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'anjali_brown_168@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '95e19cc5-42d9-4221-afa1-f610595887ae',
    'email', 'anjali_brown_168@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Anjali Brown',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '267a55d6-1591-428c-a57f-7e2aa7c4fca7',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'olivia_verma_515@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '267a55d6-1591-428c-a57f-7e2aa7c4fca7',
    'email', 'olivia_verma_515@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Olivia Verma',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '607325d1-5524-4b08-aab8-48d213e99226',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'anjali_adhikari_320@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '607325d1-5524-4b08-aab8-48d213e99226',
    'email', 'anjali_adhikari_320@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Anjali Adhikari',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'b132ad17-791a-4ffb-99c3-41dd1ccbc012',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ananya_kar_781@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'b132ad17-791a-4ffb-99c3-41dd1ccbc012',
    'email', 'ananya_kar_781@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Ananya Kar',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '25221ec5-1204-4cc9-9a35-c733588504dd',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'priya_davis_616@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '25221ec5-1204-4cc9-9a35-c733588504dd',
    'email', 'priya_davis_616@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Priya Davis',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'cff96260-921e-44da-b61e-6d1532051767',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'swati_hernandez_814@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'cff96260-921e-44da-b61e-6d1532051767',
    'email', 'swati_hernandez_814@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Swati Hernandez',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '3920a136-84ce-4882-b959-3f4e1364138f',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rohan_sen_247@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '3920a136-84ce-4882-b959-3f4e1364138f',
    'email', 'rohan_sen_247@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Rohan Sen',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '3bbb2cf7-1ff8-4476-bc40-438341f3dc18',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'kabir_adhikari_975@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '3bbb2cf7-1ff8-4476-bc40-438341f3dc18',
    'email', 'kabir_adhikari_975@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Kabir Adhikari',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'b7fded5b-75ec-49bd-94f9-4f746e7597e6',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'amit_wilson_375@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'b7fded5b-75ec-49bd-94f9-4f746e7597e6',
    'email', 'amit_wilson_375@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Amit Wilson',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'b314a286-5058-4adc-bc38-5f643bc264fb',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'swati_banerjee_106@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'b314a286-5058-4adc-bc38-5f643bc264fb',
    'email', 'swati_banerjee_106@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Swati Banerjee',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '9de3e07a-915d-455d-aa04-b660bf332ceb',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'manish_wilson_893@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '9de3e07a-915d-455d-aa04-b660bf332ceb',
    'email', 'manish_wilson_893@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Manish Wilson',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '75f38357-afee-43c7-9655-2ac4e87dfe28',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'lucas_singh_344@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '75f38357-afee-43c7-9655-2ac4e87dfe28',
    'email', 'lucas_singh_344@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Lucas Singh',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '67d439b3-b238-4ab0-a0a8-f3d06d143ebe',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'karan_hernandez_630@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '67d439b3-b238-4ab0-a0a8-f3d06d143ebe',
    'email', 'karan_hernandez_630@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Karan Hernandez',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '1eee22f4-4309-459a-92e6-857ed9e2ea3c',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ethan_johnson_680@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '1eee22f4-4309-459a-92e6-857ed9e2ea3c',
    'email', 'ethan_johnson_680@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Ethan Johnson',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'a5fa3c63-40c3-4a76-a217-13966be758ef',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'dev_rao_311@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'a5fa3c63-40c3-4a76-a217-13966be758ef',
    'email', 'dev_rao_311@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Dev Rao',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '559932ca-430f-4671-b42d-2e076cb68f84',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sophia_roy_174@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '559932ca-430f-4671-b42d-2e076cb68f84',
    'email', 'sophia_roy_174@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sophia Roy',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '59db6c4b-edb7-44c6-ae1e-9dcd9dbcf1b9',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'swati_iyer_895@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '59db6c4b-edb7-44c6-ae1e-9dcd9dbcf1b9',
    'email', 'swati_iyer_895@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Swati Iyer',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '95085393-246a-47b8-9b3b-0794a471b1e1',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'olivia_taylor_626@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '95085393-246a-47b8-9b3b-0794a471b1e1',
    'email', 'olivia_taylor_626@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Olivia Taylor',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '69eadeaa-44cc-407b-8dbd-aba56a37f377',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'karan_martinez_442@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '69eadeaa-44cc-407b-8dbd-aba56a37f377',
    'email', 'karan_martinez_442@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Karan Martinez',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'bd4398ff-6965-4f78-82e0-3a8e5bff6c2b',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'shruti_martinez_380@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'bd4398ff-6965-4f78-82e0-3a8e5bff6c2b',
    'email', 'shruti_martinez_380@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Shruti Martinez',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'efa23374-8ee8-4683-85ef-012287bd5001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'arjun_sarkar_707@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'efa23374-8ee8-4683-85ef-012287bd5001',
    'email', 'arjun_sarkar_707@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Arjun Sarkar',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '0e94f1c3-d016-4eab-aeae-3231ef9d1c81',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ethan_garcia_263@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '0e94f1c3-d016-4eab-aeae-3231ef9d1c81',
    'email', 'ethan_garcia_263@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Ethan Garcia',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'ea7ecb5d-7578-44d2-a160-64829262b745',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ananya_mishra_406@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'ea7ecb5d-7578-44d2-a160-64829262b745',
    'email', 'ananya_mishra_406@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Ananya Mishra',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '0c1b1494-2389-4c6f-aa6b-0bcdd0589e2a',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'pranav_roy_143@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '0c1b1494-2389-4c6f-aa6b-0bcdd0589e2a',
    'email', 'pranav_roy_143@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Pranav Roy',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '2b52fd88-c7e9-4d2c-8c64-a47fa3148c39',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'tanvi_dutta_576@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '2b52fd88-c7e9-4d2c-8c64-a47fa3148c39',
    'email', 'tanvi_dutta_576@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Tanvi Dutta',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'b3e3c802-1e80-4a79-8e54-9336b9c1be2a',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'divya_tiwari_491@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'b3e3c802-1e80-4a79-8e54-9336b9c1be2a',
    'email', 'divya_tiwari_491@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Divya Tiwari',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '2deac984-5394-4152-9ca0-ce739e6bc91d',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sid_singh_814@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '2deac984-5394-4152-9ca0-ce739e6bc91d',
    'email', 'sid_singh_814@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sid Singh',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '980a178b-6adf-4e67-b8a4-e60819ba18be',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'noah_johnson_457@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '980a178b-6adf-4e67-b8a4-e60819ba18be',
    'email', 'noah_johnson_457@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Noah Johnson',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '86de7fed-2a87-4389-aa55-5130a17f6652',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'karan_taylor_980@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '86de7fed-2a87-4389-aa55-5130a17f6652',
    'email', 'karan_taylor_980@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Karan Taylor',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '29cce4ac-5fdf-4136-b754-7db5fad6ad8f',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'isabella_dutta_940@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '29cce4ac-5fdf-4136-b754-7db5fad6ad8f',
    'email', 'isabella_dutta_940@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Isabella Dutta',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '8bcaf745-3384-4c8d-a199-b78bb661b9a8',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rohan_pandey_112@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '8bcaf745-3384-4c8d-a199-b78bb661b9a8',
    'email', 'rohan_pandey_112@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Rohan Pandey',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '37e1dfc7-927f-43f6-9cf6-af9c7d37eb5c',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'swati_garcia_619@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '37e1dfc7-927f-43f6-9cf6-af9c7d37eb5c',
    'email', 'swati_garcia_619@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Swati Garcia',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'fe273d9a-3f0b-4cc6-affc-b9373e025dd5',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'noah_iyer_406@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'fe273d9a-3f0b-4cc6-affc-b9373e025dd5',
    'email', 'noah_iyer_406@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Noah Iyer',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '919ce9e5-f66b-4c18-a592-7733f4a99b40',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sanjay_roy_322@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '919ce9e5-f66b-4c18-a592-7733f4a99b40',
    'email', 'sanjay_roy_322@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sanjay Roy',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '045b5126-682e-4daf-b26c-46fd29a505d5',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sid_sarkar_518@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '045b5126-682e-4daf-b26c-46fd29a505d5',
    'email', 'sid_sarkar_518@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sid Sarkar',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'f42860a5-ba9d-40b2-97db-223eb6a826dc',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'siddharth_sen_171@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'f42860a5-ba9d-40b2-97db-223eb6a826dc',
    'email', 'siddharth_sen_171@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Siddharth Sen',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '081d7987-d305-44f7-91ed-bb9f71701fcf',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'lucas_mukherjee_798@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '081d7987-d305-44f7-91ed-bb9f71701fcf',
    'email', 'lucas_mukherjee_798@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Lucas Mukherjee',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'e7ede99d-6d21-44ea-a787-d95f0decbb02',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'karan_bose_608@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'e7ede99d-6d21-44ea-a787-d95f0decbb02',
    'email', 'karan_bose_608@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Karan Bose',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '5d63dcbc-86dd-4751-a9c3-3dd3cf4d310a',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'vihaan_garcia_971@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '5d63dcbc-86dd-4751-a9c3-3dd3cf4d310a',
    'email', 'vihaan_garcia_971@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Vihaan Garcia',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'b756ab2f-e8f0-415e-9f6a-3d4ef282e084',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'meera_tripathi_455@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'b756ab2f-e8f0-415e-9f6a-3d4ef282e084',
    'email', 'meera_tripathi_455@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Meera Tripathi',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '9dd545fc-f588-4246-9f79-5d8573eb46c7',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ethan_martinez_363@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '9dd545fc-f588-4246-9f79-5d8573eb46c7',
    'email', 'ethan_martinez_363@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Ethan Martinez',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '6fd92abd-1a8f-49a4-8099-24f3f1ae4eb1',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'akash_singh_726@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '6fd92abd-1a8f-49a4-8099-24f3f1ae4eb1',
    'email', 'akash_singh_726@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Akash Singh',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'ee05c733-2217-4f49-8949-3aff36b19d0a',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'pranav_gupta_477@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'ee05c733-2217-4f49-8949-3aff36b19d0a',
    'email', 'pranav_gupta_477@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Pranav Gupta',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '8ac8badf-66de-4b85-9c31-fed1b0f68b9f',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'pooja_ghosh_425@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '8ac8badf-66de-4b85-9c31-fed1b0f68b9f',
    'email', 'pooja_ghosh_425@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Pooja Ghosh',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'a58d7ab6-056e-4093-a229-3a4fd8d253fc',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'shruti_tiwari_119@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'a58d7ab6-056e-4093-a229-3a4fd8d253fc',
    'email', 'shruti_tiwari_119@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Shruti Tiwari',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '65f6b48c-f01f-4d88-997c-0d0044a3342c',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'lucas_garcia_723@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '65f6b48c-f01f-4d88-997c-0d0044a3342c',
    'email', 'lucas_garcia_723@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Lucas Garcia',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'd3ea2221-cc76-4556-b5fe-b966c89b9946',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'dev_anderson_888@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'd3ea2221-cc76-4556-b5fe-b966c89b9946',
    'email', 'dev_anderson_888@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Dev Anderson',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '73a48b37-e39d-429a-940f-458f3f8b3a9c',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'kabir_mehta_239@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '73a48b37-e39d-429a-940f-458f3f8b3a9c',
    'email', 'kabir_mehta_239@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Kabir Mehta',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '1200fcf8-0034-4a17-a537-f4ddc214af40',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'arjun_taylor_285@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '1200fcf8-0034-4a17-a537-f4ddc214af40',
    'email', 'arjun_taylor_285@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Arjun Taylor',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'cd3c6db0-85fe-41ea-a56a-124f87006c42',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rahul_wilson_455@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'cd3c6db0-85fe-41ea-a56a-124f87006c42',
    'email', 'rahul_wilson_455@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Rahul Wilson',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'f01eba52-e33c-4e69-aab9-1464380f76aa',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ananya_banerjee_829@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'f01eba52-e33c-4e69-aab9-1464380f76aa',
    'email', 'ananya_banerjee_829@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Ananya Banerjee',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '44650983-6d09-440e-9dfd-5132fb87f689',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'aishwarya_ray_895@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '44650983-6d09-440e-9dfd-5132fb87f689',
    'email', 'aishwarya_ray_895@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Aishwarya Ray',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '6096b819-0e38-44f1-b872-76defe3903e8',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sanjay_reddy_453@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '6096b819-0e38-44f1-b872-76defe3903e8',
    'email', 'sanjay_reddy_453@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sanjay Reddy',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'd63410e9-35b5-4885-a3da-8562c9377d29',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'pooja_rao_616@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'd63410e9-35b5-4885-a3da-8562c9377d29',
    'email', 'pooja_rao_616@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Pooja Rao',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '5146b688-a6d1-4432-954f-507756babf22',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'shruti_sen_451@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '5146b688-a6d1-4432-954f-507756babf22',
    'email', 'shruti_sen_451@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Shruti Sen',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '9d6d989a-ef0a-43a0-8ada-eb804c205ee6',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'anjali_nair_583@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '9d6d989a-ef0a-43a0-8ada-eb804c205ee6',
    'email', 'anjali_nair_583@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Anjali Nair',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'dd36e51a-942b-4c8f-9309-355fa17d2310',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'liam_mukherjee_548@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'dd36e51a-942b-4c8f-9309-355fa17d2310',
    'email', 'liam_mukherjee_548@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Liam Mukherjee',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '3833faf8-063f-414f-87f9-7942fb11c672',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'lucas_miller_359@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '3833faf8-063f-414f-87f9-7942fb11c672',
    'email', 'lucas_miller_359@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Lucas Miller',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'e437ee61-f2f9-49f7-ad7d-a887695907a3',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sophia_shukla_782@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'e437ee61-f2f9-49f7-ad7d-a887695907a3',
    'email', 'sophia_shukla_782@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sophia Shukla',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '16a115a0-07df-46b4-ad52-ef24d63252be',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'riya_patel_609@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '16a115a0-07df-46b4-ad52-ef24d63252be',
    'email', 'riya_patel_609@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Riya Patel',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'c9b9f5b9-84b2-4a4b-ad0d-b20def9c57b6',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'neha_ray_370@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'c9b9f5b9-84b2-4a4b-ad0d-b20def9c57b6',
    'email', 'neha_ray_370@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Neha Ray',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '0b64a469-0c8d-473a-b8cc-751db613e8ad',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'noah_das_363@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '0b64a469-0c8d-473a-b8cc-751db613e8ad',
    'email', 'noah_das_363@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Noah Das',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'f67db27d-4b42-4b6c-b2d4-1c0e515b796b',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sanjana_dwivedi_771@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'f67db27d-4b42-4b6c-b2d4-1c0e515b796b',
    'email', 'sanjana_dwivedi_771@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sanjana Dwivedi',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '0e8d7c15-18bf-401d-8307-6390c36338e0',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'riya_mehta_566@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '0e8d7c15-18bf-401d-8307-6390c36338e0',
    'email', 'riya_mehta_566@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Riya Mehta',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '2fc7fd0e-8866-4002-bae2-3d7cbedcfc60',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'aishwarya_brown_716@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '2fc7fd0e-8866-4002-bae2-3d7cbedcfc60',
    'email', 'aishwarya_brown_716@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Aishwarya Brown',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '2f20b565-ad60-4e1c-bb1c-4a3d162a214c',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'aarav_mehta_449@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '2f20b565-ad60-4e1c-bb1c-4a3d162a214c',
    'email', 'aarav_mehta_449@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Aarav Mehta',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '6951a168-02cf-4f7b-8267-3ad8a9ffb85f',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'siddharth_kumar_922@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '6951a168-02cf-4f7b-8267-3ad8a9ffb85f',
    'email', 'siddharth_kumar_922@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Siddharth Kumar',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'bc9d88f8-7a89-4981-9106-798e997cccf1',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sanjana_shukla_650@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'bc9d88f8-7a89-4981-9106-798e997cccf1',
    'email', 'sanjana_shukla_650@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sanjana Shukla',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'aabb975e-909a-4fcb-a36c-a9e17a31a7a8',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'aria_johnson_309@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'aabb975e-909a-4fcb-a36c-a9e17a31a7a8',
    'email', 'aria_johnson_309@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Aria Johnson',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'ef1f401a-ad98-4034-858f-e50428bb2b9a',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rohan_rodriguez_326@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'ef1f401a-ad98-4034-858f-e50428bb2b9a',
    'email', 'rohan_rodriguez_326@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Rohan Rodriguez',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '839be94c-b954-4e02-9b31-c23d51a6aa88',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'anjali_martinez_188@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '839be94c-b954-4e02-9b31-c23d51a6aa88',
    'email', 'anjali_martinez_188@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Anjali Martinez',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'becb90ae-28c3-43e3-9ec6-0248f6ae46e7',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'aarav_dutta_719@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'becb90ae-28c3-43e3-9ec6-0248f6ae46e7',
    'email', 'aarav_dutta_719@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Aarav Dutta',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '6df8d004-da23-4845-87cb-7739ac64e78f',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'aria_ray_996@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '6df8d004-da23-4845-87cb-7739ac64e78f',
    'email', 'aria_ray_996@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Aria Ray',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '59e358f6-0830-42e6-82ed-642ea463308c',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'mason_sen_846@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '59e358f6-0830-42e6-82ed-642ea463308c',
    'email', 'mason_sen_846@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Mason Sen',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'bcdf7c6f-3c76-47b9-b77b-2fa74ab686fd',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'akash_thomas_294@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'bcdf7c6f-3c76-47b9-b77b-2fa74ab686fd',
    'email', 'akash_thomas_294@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Akash Thomas',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '6b062513-8be6-4122-a33a-0a203fc0ad8d',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sanjana_rodriguez_621@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '6b062513-8be6-4122-a33a-0a203fc0ad8d',
    'email', 'sanjana_rodriguez_621@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sanjana Rodriguez',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'f63afe9b-16b6-484a-9cd7-458a7b3ecc99',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'pooja_roy_360@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'f63afe9b-16b6-484a-9cd7-458a7b3ecc99',
    'email', 'pooja_roy_360@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Pooja Roy',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '1c79d5f0-4d12-4b21-ae80-cfef10a42938',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sanjay_banerjee_373@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '1c79d5f0-4d12-4b21-ae80-cfef10a42938',
    'email', 'sanjay_banerjee_373@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sanjay Banerjee',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'd9f60f3f-4e97-4f52-bbba-3f9445c2778a',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'kabir_ghosh_523@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'd9f60f3f-4e97-4f52-bbba-3f9445c2778a',
    'email', 'kabir_ghosh_523@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Kabir Ghosh',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '1e34604b-7948-46d4-b430-d95b1d5864f2',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'alex_anderson_172@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '1e34604b-7948-46d4-b430-d95b1d5864f2',
    'email', 'alex_anderson_172@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Alex Anderson',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '523d3dc9-14e2-4c51-92f6-58085dc2ccc0',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'kabir_jones_598@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '523d3dc9-14e2-4c51-92f6-58085dc2ccc0',
    'email', 'kabir_jones_598@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Kabir Jones',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '8242d1fd-e2a7-4f74-9659-c025d48a77f8',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'meera_jones_548@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '8242d1fd-e2a7-4f74-9659-c025d48a77f8',
    'email', 'meera_jones_548@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Meera Jones',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '90d56139-eefa-4596-a095-d328ccbc7c96',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'priya_patel_327@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '90d56139-eefa-4596-a095-d328ccbc7c96',
    'email', 'priya_patel_327@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Priya Patel',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'a561c14d-ce6d-4739-a4e6-aaf99b9d3b49',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'akash_jones_988@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'a561c14d-ce6d-4739-a4e6-aaf99b9d3b49',
    'email', 'akash_jones_988@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Akash Jones',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'eac37ad1-ea13-4622-9e9b-b63c72aaefcf',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'mason_mitra_956@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'eac37ad1-ea13-4622-9e9b-b63c72aaefcf',
    'email', 'mason_mitra_956@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Mason Mitra',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '3f65a569-2094-4786-b2f2-268bb6697839',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sanjana_roy_345@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '3f65a569-2094-4786-b2f2-268bb6697839',
    'email', 'sanjana_roy_345@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sanjana Roy',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'ca50075a-9b25-4e44-8c50-683c009f2118',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sanjay_pal_322@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'ca50075a-9b25-4e44-8c50-683c009f2118',
    'email', 'sanjay_pal_322@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sanjay Pal',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'eeee7f1d-c207-42a2-b4bc-0f549c07795b',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'dev_hernandez_730@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'eeee7f1d-c207-42a2-b4bc-0f549c07795b',
    'email', 'dev_hernandez_730@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Dev Hernandez',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'c7010de5-3997-41fd-b411-460b0f04fe26',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'mason_taylor_890@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'c7010de5-3997-41fd-b411-460b0f04fe26',
    'email', 'mason_taylor_890@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Mason Taylor',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '08d480c6-be62-44ca-9a47-b8493a116495',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ananya_dutta_360@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '08d480c6-be62-44ca-9a47-b8493a116495',
    'email', 'ananya_dutta_360@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Ananya Dutta',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'bb62f128-074b-4513-93ac-f23d3ef6f87e',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ava_iyer_166@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'bb62f128-074b-4513-93ac-f23d3ef6f87e',
    'email', 'ava_iyer_166@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Ava Iyer',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'ec39b5d9-32ae-4a25-8b3e-960c0b4e00aa',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'neha_sarkar_692@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'ec39b5d9-32ae-4a25-8b3e-960c0b4e00aa',
    'email', 'neha_sarkar_692@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Neha Sarkar',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '6357186f-0d1f-478a-a673-d952be58cbb9',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rahul_pal_231@srmeaswari.edu.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '6357186f-0d1f-478a-a673-d952be58cbb9',
    'email', 'rahul_pal_231@srmeaswari.edu.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Rahul Pal',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '90ba2aee-0530-4015-a95f-5e4064c1ed26',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'pranav_shukla_734@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '90ba2aee-0530-4015-a95f-5e4064c1ed26',
    'email', 'pranav_shukla_734@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Pranav Shukla',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'b1685ff5-4d76-4605-bceb-3c5e30808acf',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'mia_banerjee_137@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'b1685ff5-4d76-4605-bceb-3c5e30808acf',
    'email', 'mia_banerjee_137@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Mia Banerjee',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'edf37ca9-63ff-435f-a668-28a01d249408',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'tanvi_brown_297@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'edf37ca9-63ff-435f-a668-28a01d249408',
    'email', 'tanvi_brown_297@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Tanvi Brown',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '230a48ef-b259-4710-9cc7-67f031f494ed',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'aarav_rao_541@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '230a48ef-b259-4710-9cc7-67f031f494ed',
    'email', 'aarav_rao_541@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Aarav Rao',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '3d08b628-f90a-48cd-b7a7-ee8d8c94245c',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sophia_johnson_452@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '3d08b628-f90a-48cd-b7a7-ee8d8c94245c',
    'email', 'sophia_johnson_452@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sophia Johnson',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '94c790da-6922-4892-a827-46db5fd34b07',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rahul_adhikari_951@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '94c790da-6922-4892-a827-46db5fd34b07',
    'email', 'rahul_adhikari_951@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Rahul Adhikari',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '3c1554eb-ae3d-456d-94a9-036d9cc134a2',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sanjay_tiwari_756@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '3c1554eb-ae3d-456d-94a9-036d9cc134a2',
    'email', 'sanjay_tiwari_756@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sanjay Tiwari',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '36acbc42-aa58-4b42-9fb3-2d4cfebfdf8c',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'dev_roy_963@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '36acbc42-aa58-4b42-9fb3-2d4cfebfdf8c',
    'email', 'dev_roy_963@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Dev Roy',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'e52e5717-6920-4008-87b9-30df639dee22',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'priya_taylor_694@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'e52e5717-6920-4008-87b9-30df639dee22',
    'email', 'priya_taylor_694@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Priya Taylor',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'e8cf5c3e-2648-4b7a-a3ee-243d5c609a2b',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'aria_pal_962@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'e8cf5c3e-2648-4b7a-a3ee-243d5c609a2b',
    'email', 'aria_pal_962@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Aria Pal',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '4fd7de47-dc26-40b3-9f71-ea9bb0166376',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'diya_anderson_810@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '4fd7de47-dc26-40b3-9f71-ea9bb0166376',
    'email', 'diya_anderson_810@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Diya Anderson',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'cc656283-a152-4cea-97e7-543d7b6ef605',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'karan_dutta_531@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'cc656283-a152-4cea-97e7-543d7b6ef605',
    'email', 'karan_dutta_531@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Karan Dutta',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '847ea109-f13d-498a-9ffb-90da77cf4355',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'swati_mukherjee_533@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '847ea109-f13d-498a-9ffb-90da77cf4355',
    'email', 'swati_mukherjee_533@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Swati Mukherjee',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'd8b82df6-6297-4df8-8489-92f1a710c829',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ava_verma_460@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'd8b82df6-6297-4df8-8489-92f1a710c829',
    'email', 'ava_verma_460@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Ava Verma',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'd133c9e6-0372-4e65-8a99-7f24fa5dac57',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'raj_mitra_322@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'd133c9e6-0372-4e65-8a99-7f24fa5dac57',
    'email', 'raj_mitra_322@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Raj Mitra',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '76bc3ce3-a143-462b-a045-bb065f3b1bd6',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'pooja_pal_527@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '76bc3ce3-a143-462b-a045-bb065f3b1bd6',
    'email', 'pooja_pal_527@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Pooja Pal',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '77ad442e-4109-4023-8471-0899ba4b7ccf',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'amit_williams_801@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '77ad442e-4109-4023-8471-0899ba4b7ccf',
    'email', 'amit_williams_801@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Amit Williams',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'a07a787f-0337-45ca-9ad5-2bcbd31a61fc',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'aarav_nair_581@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'a07a787f-0337-45ca-9ad5-2bcbd31a61fc',
    'email', 'aarav_nair_581@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Aarav Nair',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '59e40063-0efa-4007-a962-dffcf4d0b125',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sophia_dutta_475@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '59e40063-0efa-4007-a962-dffcf4d0b125',
    'email', 'sophia_dutta_475@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sophia Dutta',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '5fc516b0-5e1a-4f38-9390-20c5aed49bde',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'anjali_thomas_470@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '5fc516b0-5e1a-4f38-9390-20c5aed49bde',
    'email', 'anjali_thomas_470@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Anjali Thomas',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '439bb5c3-ec9e-4b0e-9d7c-68db8c1f667b',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'isabella_reddy_390@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '439bb5c3-ec9e-4b0e-9d7c-68db8c1f667b',
    'email', 'isabella_reddy_390@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Isabella Reddy',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'aeb956f4-c040-4b95-9002-75a9348003bb',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'pooja_hernandez_616@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'aeb956f4-c040-4b95-9002-75a9348003bb',
    'email', 'pooja_hernandez_616@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Pooja Hernandez',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '84cea089-b149-4d45-95a1-655302a00713',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'noah_reddy_401@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '84cea089-b149-4d45-95a1-655302a00713',
    'email', 'noah_reddy_401@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Noah Reddy',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'c89b378a-0515-41f4-bb79-1eeb7f5ffb01',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'vijay_gupta_540@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'c89b378a-0515-41f4-bb79-1eeb7f5ffb01',
    'email', 'vijay_gupta_540@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Vijay Gupta',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '2eb33d5c-e05b-4c2d-ac0e-415449f5bc0b',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rohan_reddy_524@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '2eb33d5c-e05b-4c2d-ac0e-415449f5bc0b',
    'email', 'rohan_reddy_524@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Rohan Reddy',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '0dea342a-f9df-44bf-a1cd-f9be169561e4',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'kavya_bose_750@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '0dea342a-f9df-44bf-a1cd-f9be169561e4',
    'email', 'kavya_bose_750@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Kavya Bose',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'f9d59114-543a-41c6-b915-e532e216dbfe',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sophia_pandey_906@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'f9d59114-543a-41c6-b915-e532e216dbfe',
    'email', 'sophia_pandey_906@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sophia Pandey',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'b547ac66-cbfe-4f45-ab5e-f3757056c0d3',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rahul_gupta_343@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'b547ac66-cbfe-4f45-ab5e-f3757056c0d3',
    'email', 'rahul_gupta_343@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Rahul Gupta',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '7bcd19a5-4c10-4692-b0d9-62b2709ac8d0',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'lucas_nair_190@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '7bcd19a5-4c10-4692-b0d9-62b2709ac8d0',
    'email', 'lucas_nair_190@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Lucas Nair',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '87bb46b4-c2a7-46c2-a602-d03630ace053',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'shruti_hernandez_934@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '87bb46b4-c2a7-46c2-a602-d03630ace053',
    'email', 'shruti_hernandez_934@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Shruti Hernandez',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '5b28f8b9-1129-4804-ae02-27efa236abff',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'neha_joshi_990@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '5b28f8b9-1129-4804-ae02-27efa236abff',
    'email', 'neha_joshi_990@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Neha Joshi',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '1cf48f00-0159-43be-8494-317e93a1664d',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rohan_sharma_320@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '1cf48f00-0159-43be-8494-317e93a1664d',
    'email', 'rohan_sharma_320@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Rohan Sharma',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '50588c59-f86c-45cc-bd3b-ced426264e00',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'akash_mitra_498@iitd.ac.in',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '50588c59-f86c-45cc-bd3b-ced426264e00',
    'email', 'akash_mitra_498@iitd.ac.in',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Akash Mitra',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'b5c78196-7061-4b36-83d5-3adf7f19b73a',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'tanvi_das_118@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'b5c78196-7061-4b36-83d5-3adf7f19b73a',
    'email', 'tanvi_das_118@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Tanvi Das',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '617845f8-43ba-40c3-8cbc-b1d7403e0a94',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'dev_pal_154@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '617845f8-43ba-40c3-8cbc-b1d7403e0a94',
    'email', 'dev_pal_154@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Dev Pal',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '623f34b2-93e9-44a8-8701-1fc01d31c94b',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'alex_roy_270@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '623f34b2-93e9-44a8-8701-1fc01d31c94b',
    'email', 'alex_roy_270@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Alex Roy',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '726ddef2-65a3-4fba-addb-1d0b603a5b0e',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'isha_tiwari_726@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '726ddef2-65a3-4fba-addb-1d0b603a5b0e',
    'email', 'isha_tiwari_726@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Isha Tiwari',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '83a31022-8874-48bc-9ff8-702e5e41dd52',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'vihaan_sharma_789@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '83a31022-8874-48bc-9ff8-702e5e41dd52',
    'email', 'vihaan_sharma_789@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Vihaan Sharma',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '083772b1-04e0-42db-811a-66687c2dfb8e',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'aishwarya_wilson_145@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '083772b1-04e0-42db-811a-66687c2dfb8e',
    'email', 'aishwarya_wilson_145@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Aishwarya Wilson',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '3e292949-1a8d-4c22-8863-36473ee2fd45',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'isha_kumar_789@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '3e292949-1a8d-4c22-8863-36473ee2fd45',
    'email', 'isha_kumar_789@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Isha Kumar',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'fad814ce-fb87-4200-aa73-3220370d507c',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'priya_bose_780@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'fad814ce-fb87-4200-aa73-3220370d507c',
    'email', 'priya_bose_780@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Priya Bose',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'b60b3f90-b1b7-4059-ab33-556ca86e2d10',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'liam_pandey_312@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'b60b3f90-b1b7-4059-ab33-556ca86e2d10',
    'email', 'liam_pandey_312@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Liam Pandey',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '76f00d37-1a05-43b8-be3c-1bbdebaf8fab',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'divya_sharma_931@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '76f00d37-1a05-43b8-be3c-1bbdebaf8fab',
    'email', 'divya_sharma_931@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Divya Sharma',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'dfa29051-3d4e-48f4-b3d6-e494a2d2432d',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sneha_tiwari_242@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'dfa29051-3d4e-48f4-b3d6-e494a2d2432d',
    'email', 'sneha_tiwari_242@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sneha Tiwari',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '19023178-e52d-4545-80a5-e7d66b461e5f',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'liam_nair_387@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '19023178-e52d-4545-80a5-e7d66b461e5f',
    'email', 'liam_nair_387@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Liam Nair',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'ff47290d-71f3-4af9-8949-92142c2b33be',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'lucas_rao_442@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'ff47290d-71f3-4af9-8949-92142c2b33be',
    'email', 'lucas_rao_442@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Lucas Rao',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'a372d3f3-503d-467c-893f-f6ab09278f02',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sid_jones_841@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'a372d3f3-503d-467c-893f-f6ab09278f02',
    'email', 'sid_jones_841@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sid Jones',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'bd8cc4ff-ec46-4e44-995c-c07aeaa2d701',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'alex_sharma_711@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'bd8cc4ff-ec46-4e44-995c-c07aeaa2d701',
    'email', 'alex_sharma_711@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Alex Sharma',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '3e6e668c-2d9a-4870-ad75-865d727452e5',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'raj_martinez_952@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '3e6e668c-2d9a-4870-ad75-865d727452e5',
    'email', 'raj_martinez_952@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Raj Martinez',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'f797847c-a544-4794-b054-362297cf73cf',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'divya_banerjee_114@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'f797847c-a544-4794-b054-362297cf73cf',
    'email', 'divya_banerjee_114@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Divya Banerjee',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'e54ca72d-fa79-4a4b-9437-ab75f2586922',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'liam_tiwari_557@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'e54ca72d-fa79-4a4b-9437-ab75f2586922',
    'email', 'liam_tiwari_557@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Liam Tiwari',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '29bc4e9a-c4d0-4cdb-873e-8ea9242e704c',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'pranav_nair_341@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '29bc4e9a-c4d0-4cdb-873e-8ea9242e704c',
    'email', 'pranav_nair_341@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Pranav Nair',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '8341d7c2-1a29-4864-8cf0-15ac8797bcaa',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'noah_pandey_433@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '8341d7c2-1a29-4864-8cf0-15ac8797bcaa',
    'email', 'noah_pandey_433@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Noah Pandey',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'df9c4d69-5661-4aec-b91c-cbd06469c1af',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'pranav_ghosh_562@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'df9c4d69-5661-4aec-b91c-cbd06469c1af',
    'email', 'pranav_ghosh_562@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Pranav Ghosh',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'f58852ad-8023-4d7c-b33c-9106d770fde9',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'meera_davis_355@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'f58852ad-8023-4d7c-b33c-9106d770fde9',
    'email', 'meera_davis_355@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Meera Davis',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '0184ed0b-c1d8-40f1-ad8a-d42856143c3f',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'riya_singh_398@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '0184ed0b-c1d8-40f1-ad8a-d42856143c3f',
    'email', 'riya_singh_398@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Riya Singh',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'a3c38c25-5fd8-482f-a9e8-a5a64fb6ad03',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'tanvi_rodriguez_667@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'a3c38c25-5fd8-482f-a9e8-a5a64fb6ad03',
    'email', 'tanvi_rodriguez_667@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Tanvi Rodriguez',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '2219c9dc-29f1-4678-925a-80f68dbe7a13',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'riya_choudhury_297@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '2219c9dc-29f1-4678-925a-80f68dbe7a13',
    'email', 'riya_choudhury_297@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Riya Choudhury',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '4eb262ab-2144-4f9e-ab69-37d4db1ef336',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'dev_jones_883@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '4eb262ab-2144-4f9e-ab69-37d4db1ef336',
    'email', 'dev_jones_883@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Dev Jones',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '63faef35-8abc-4c8d-a69b-59369667c38d',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sophia_taylor_483@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '63faef35-8abc-4c8d-a69b-59369667c38d',
    'email', 'sophia_taylor_483@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sophia Taylor',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'dad8346e-cbce-4c2e-bee9-8493e9ba1958',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rahul_miller_408@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'dad8346e-cbce-4c2e-bee9-8493e9ba1958',
    'email', 'rahul_miller_408@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Rahul Miller',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '76879a4d-1258-48c6-87ab-c24352839a64',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'shruti_banerjee_293@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '76879a4d-1258-48c6-87ab-c24352839a64',
    'email', 'shruti_banerjee_293@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Shruti Banerjee',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '24811ec3-7f45-4926-bdff-e5733f11c785',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sanjay_thomas_813@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '24811ec3-7f45-4926-bdff-e5733f11c785',
    'email', 'sanjay_thomas_813@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sanjay Thomas',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '1eaa2260-f8fe-49aa-a7a8-a60b75ad0285',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'shruti_sen_579@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '1eaa2260-f8fe-49aa-a7a8-a60b75ad0285',
    'email', 'shruti_sen_579@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Shruti Sen',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '48b1e79c-37d1-4bbc-9240-50e66f8a63bb',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'akash_brown_338@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '48b1e79c-37d1-4bbc-9240-50e66f8a63bb',
    'email', 'akash_brown_338@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Akash Brown',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '469ca073-3e46-4f35-bffa-dfd1d117164c',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'isha_smith_264@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '469ca073-3e46-4f35-bffa-dfd1d117164c',
    'email', 'isha_smith_264@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Isha Smith',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '5cfca2df-f436-4486-860b-b80e2ccf4e0d',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'lucas_martinez_634@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '5cfca2df-f436-4486-860b-b80e2ccf4e0d',
    'email', 'lucas_martinez_634@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Lucas Martinez',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '8d95ff10-5eb4-4e0e-bfe2-3279593a8463',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'aarav_nair_139@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '8d95ff10-5eb4-4e0e-bfe2-3279593a8463',
    'email', 'aarav_nair_139@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Aarav Nair',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '9b06bea1-885c-415a-a9d9-59ed7b0968ee',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sophia_sarkar_751@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '9b06bea1-885c-415a-a9d9-59ed7b0968ee',
    'email', 'sophia_sarkar_751@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sophia Sarkar',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'b5b78d99-fc9c-47ed-868b-43b53540084d',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'aria_patel_404@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'b5b78d99-fc9c-47ed-868b-43b53540084d',
    'email', 'aria_patel_404@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Aria Patel',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '4f1b122b-80a5-4e2c-bf15-c0eeb3aadefb',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ava_tiwari_560@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '4f1b122b-80a5-4e2c-bf15-c0eeb3aadefb',
    'email', 'ava_tiwari_560@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Ava Tiwari',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'f8485af8-1c51-48de-a54d-0534b0a68590',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'ava_roy_251@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'f8485af8-1c51-48de-a54d-0534b0a68590',
    'email', 'ava_roy_251@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Ava Roy',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'cd0a0ff4-4c4f-4954-b47c-3f5252e028e8',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'vihaan_miller_337@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'cd0a0ff4-4c4f-4954-b47c-3f5252e028e8',
    'email', 'vihaan_miller_337@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Vihaan Miller',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '3b2989ad-e761-413a-a646-a58b2a45c4a2',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'anjali_martinez_942@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '3b2989ad-e761-413a-a646-a58b2a45c4a2',
    'email', 'anjali_martinez_942@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Anjali Martinez',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '3779cf13-913b-486c-81e3-5a2e3f6dc2dc',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'vihaan_taylor_356@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '3779cf13-913b-486c-81e3-5a2e3f6dc2dc',
    'email', 'vihaan_taylor_356@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Vihaan Taylor',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '2634b114-a608-47d2-85e6-b6ef38cb2239',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sanjay_martinez_681@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '2634b114-a608-47d2-85e6-b6ef38cb2239',
    'email', 'sanjay_martinez_681@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sanjay Martinez',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '299e7c9a-3313-4171-95b1-cda414660120',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'riya_martinez_965@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '299e7c9a-3313-4171-95b1-cda414660120',
    'email', 'riya_martinez_965@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Riya Martinez',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '5149d476-5bc5-4a82-952f-89a86908893b',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sophia_nair_967@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '5149d476-5bc5-4a82-952f-89a86908893b',
    'email', 'sophia_nair_967@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sophia Nair',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '91017b7c-8270-49a4-bbbe-9aecaecdddda',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'rohan_williams_430@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '91017b7c-8270-49a4-bbbe-9aecaecdddda',
    'email', 'rohan_williams_430@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Rohan Williams',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '5f2b98bf-e220-4342-909c-4f4f43f85ec9',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'kavya_mehta_966@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '5f2b98bf-e220-4342-909c-4f4f43f85ec9',
    'email', 'kavya_mehta_966@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Kavya Mehta',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'c426afcf-81b5-41a2-ba3c-07c29e0d7312',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sanjay_mehta_818@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'c426afcf-81b5-41a2-ba3c-07c29e0d7312',
    'email', 'sanjay_mehta_818@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Sanjay Mehta',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '43535e33-49b8-4b39-b81a-47c6a9d5623a',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'kabir_shukla_670@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '43535e33-49b8-4b39-b81a-47c6a9d5623a',
    'email', 'kabir_shukla_670@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Kabir Shukla',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '963e77a1-01e6-45ea-ad06-3a37d6bd4818',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'riya_mukherjee_396@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '963e77a1-01e6-45ea-ad06-3a37d6bd4818',
    'email', 'riya_mukherjee_396@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Riya Mukherjee',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'c0fc1b83-013c-4493-8a43-f6f8ffdc69ed',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'lucas_mehta_713@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'c0fc1b83-013c-4493-8a43-f6f8ffdc69ed',
    'email', 'lucas_mehta_713@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Lucas Mehta',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  '3216a0ca-4162-4b05-9d16-04890c77b70d',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'manish_smith_661@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', '3216a0ca-4162-4b05-9d16-04890c77b70d',
    'email', 'manish_smith_661@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Manish Smith',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous)
VALUES (
  'e8019784-d494-460f-a4f0-f859a5542275',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'pooja_garcia_628@google.com',
  '$2a$10$xV2mU99mI/15iWd35V.O5.G51g2r8f81q9d2S6Lz1GvYgSg1y3GeC',
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  json_build_object(
    'sub', 'e8019784-d494-460f-a4f0-f859a5542275',
    'email', 'pooja_garcia_628@google.com',
    'email_verified', true,
    'phone_verified', false,
    'full_name', 'Pooja Garcia',
    'avatar_url', ''
  ),
  now(),
  now(),
  false,
  false
);

-- 4. INSERTS FOR auth.identities

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'a449d899-3327-45d0-bbeb-d2c163047a4e',
  'de203ca4-b433-4597-849e-12a764616397',
  'de203ca4-b433-4597-849e-12a764616397',
  json_build_object('sub', 'de203ca4-b433-4597-849e-12a764616397', 'email', 'ananya_banerjee_976@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '77944676-2f1e-45ef-8051-20e13f5e6459',
  '057017fd-99e7-451c-b16b-8df254aeca2e',
  '057017fd-99e7-451c-b16b-8df254aeca2e',
  json_build_object('sub', '057017fd-99e7-451c-b16b-8df254aeca2e', 'email', 'jackson_bose_802@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'ae8aebd7-ed19-4d23-bf49-2441136a1222',
  '6d6a6c33-299c-4f5e-9ef9-a0b7a925c776',
  '6d6a6c33-299c-4f5e-9ef9-a0b7a925c776',
  json_build_object('sub', '6d6a6c33-299c-4f5e-9ef9-a0b7a925c776', 'email', 'anjali_singh_354@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '1f728970-2de6-475f-91f7-c0c2a83b5284',
  '301c7b99-3e14-46a2-9cf4-ff4209a59f31',
  '301c7b99-3e14-46a2-9cf4-ff4209a59f31',
  json_build_object('sub', '301c7b99-3e14-46a2-9cf4-ff4209a59f31', 'email', 'siddharth_johnson_274@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'd25038e9-1c06-4143-a8b2-69a49fb15dd1',
  'b93d52ac-a6bb-4fc5-ad7a-0207b35543a3',
  'b93d52ac-a6bb-4fc5-ad7a-0207b35543a3',
  json_build_object('sub', 'b93d52ac-a6bb-4fc5-ad7a-0207b35543a3', 'email', 'rohan_thomas_806@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '34f1cb2b-6dea-4c39-a0a1-938c4010b519',
  '1423b79b-9a21-4ca4-804f-d127b179d51d',
  '1423b79b-9a21-4ca4-804f-d127b179d51d',
  json_build_object('sub', '1423b79b-9a21-4ca4-804f-d127b179d51d', 'email', 'rahul_patel_873@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '08727583-b192-4195-9610-b53b5b2e385b',
  '0284bfc1-a659-4dc0-aba4-526e355f9621',
  '0284bfc1-a659-4dc0-aba4-526e355f9621',
  json_build_object('sub', '0284bfc1-a659-4dc0-aba4-526e355f9621', 'email', 'shruti_kumar_426@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'd75ef3a0-9ec1-42bf-ab0c-8a8bf3b94416',
  'a6411e62-5197-4c59-8c0e-e26e594da741',
  'a6411e62-5197-4c59-8c0e-e26e594da741',
  json_build_object('sub', 'a6411e62-5197-4c59-8c0e-e26e594da741', 'email', 'ananya_miller_977@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '72d97070-d3f4-4fde-96c8-0029d8404d65',
  '0e58f79f-3ec7-4439-938a-51898cf1893d',
  '0e58f79f-3ec7-4439-938a-51898cf1893d',
  json_build_object('sub', '0e58f79f-3ec7-4439-938a-51898cf1893d', 'email', 'meera_adhikari_638@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '54744c70-ad71-432f-adec-839975b562e0',
  '4c6d7311-1284-4938-8408-0f499a059ed7',
  '4c6d7311-1284-4938-8408-0f499a059ed7',
  json_build_object('sub', '4c6d7311-1284-4938-8408-0f499a059ed7', 'email', 'sid_joshi_919@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '9781972f-ef8b-4e65-9b57-efc53345e2ef',
  '95e19cc5-42d9-4221-afa1-f610595887ae',
  '95e19cc5-42d9-4221-afa1-f610595887ae',
  json_build_object('sub', '95e19cc5-42d9-4221-afa1-f610595887ae', 'email', 'anjali_brown_168@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '2ad7ab6e-bed7-4ae0-84b3-9a4b2bf7412a',
  '267a55d6-1591-428c-a57f-7e2aa7c4fca7',
  '267a55d6-1591-428c-a57f-7e2aa7c4fca7',
  json_build_object('sub', '267a55d6-1591-428c-a57f-7e2aa7c4fca7', 'email', 'olivia_verma_515@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '227ce10c-9076-4504-a40c-b32bf6201fb2',
  '607325d1-5524-4b08-aab8-48d213e99226',
  '607325d1-5524-4b08-aab8-48d213e99226',
  json_build_object('sub', '607325d1-5524-4b08-aab8-48d213e99226', 'email', 'anjali_adhikari_320@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '41763e13-395e-4807-b2ab-ce5363e339f2',
  'b132ad17-791a-4ffb-99c3-41dd1ccbc012',
  'b132ad17-791a-4ffb-99c3-41dd1ccbc012',
  json_build_object('sub', 'b132ad17-791a-4ffb-99c3-41dd1ccbc012', 'email', 'ananya_kar_781@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '6ab5ff81-6fc2-42d3-823e-ce7e844e9307',
  '25221ec5-1204-4cc9-9a35-c733588504dd',
  '25221ec5-1204-4cc9-9a35-c733588504dd',
  json_build_object('sub', '25221ec5-1204-4cc9-9a35-c733588504dd', 'email', 'priya_davis_616@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '2dec2dc8-d288-4983-9be4-5b7f4dae4a9b',
  'cff96260-921e-44da-b61e-6d1532051767',
  'cff96260-921e-44da-b61e-6d1532051767',
  json_build_object('sub', 'cff96260-921e-44da-b61e-6d1532051767', 'email', 'swati_hernandez_814@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '096455a9-df81-4bb8-bfc3-859a5287a3f2',
  '3920a136-84ce-4882-b959-3f4e1364138f',
  '3920a136-84ce-4882-b959-3f4e1364138f',
  json_build_object('sub', '3920a136-84ce-4882-b959-3f4e1364138f', 'email', 'rohan_sen_247@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '15db89b2-e835-432b-8e66-d508228fb937',
  '3bbb2cf7-1ff8-4476-bc40-438341f3dc18',
  '3bbb2cf7-1ff8-4476-bc40-438341f3dc18',
  json_build_object('sub', '3bbb2cf7-1ff8-4476-bc40-438341f3dc18', 'email', 'kabir_adhikari_975@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'a94de10c-2cc1-46b2-a16a-3153eb111bb1',
  'b7fded5b-75ec-49bd-94f9-4f746e7597e6',
  'b7fded5b-75ec-49bd-94f9-4f746e7597e6',
  json_build_object('sub', 'b7fded5b-75ec-49bd-94f9-4f746e7597e6', 'email', 'amit_wilson_375@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'afe43d45-75df-4d1e-8b08-20ec4ae60790',
  'b314a286-5058-4adc-bc38-5f643bc264fb',
  'b314a286-5058-4adc-bc38-5f643bc264fb',
  json_build_object('sub', 'b314a286-5058-4adc-bc38-5f643bc264fb', 'email', 'swati_banerjee_106@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '4d6c2592-eeb6-470e-953a-b5251a8e5743',
  '9de3e07a-915d-455d-aa04-b660bf332ceb',
  '9de3e07a-915d-455d-aa04-b660bf332ceb',
  json_build_object('sub', '9de3e07a-915d-455d-aa04-b660bf332ceb', 'email', 'manish_wilson_893@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '132c57de-e875-49cc-b813-6c2c7382949c',
  '75f38357-afee-43c7-9655-2ac4e87dfe28',
  '75f38357-afee-43c7-9655-2ac4e87dfe28',
  json_build_object('sub', '75f38357-afee-43c7-9655-2ac4e87dfe28', 'email', 'lucas_singh_344@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'ce0df0f1-9f4e-4aad-a46a-95938e776b17',
  '67d439b3-b238-4ab0-a0a8-f3d06d143ebe',
  '67d439b3-b238-4ab0-a0a8-f3d06d143ebe',
  json_build_object('sub', '67d439b3-b238-4ab0-a0a8-f3d06d143ebe', 'email', 'karan_hernandez_630@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '496f4915-adc0-4f75-b631-e081134684d2',
  '1eee22f4-4309-459a-92e6-857ed9e2ea3c',
  '1eee22f4-4309-459a-92e6-857ed9e2ea3c',
  json_build_object('sub', '1eee22f4-4309-459a-92e6-857ed9e2ea3c', 'email', 'ethan_johnson_680@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'e39824d2-37b7-4b25-9bbd-61acaf118b54',
  'a5fa3c63-40c3-4a76-a217-13966be758ef',
  'a5fa3c63-40c3-4a76-a217-13966be758ef',
  json_build_object('sub', 'a5fa3c63-40c3-4a76-a217-13966be758ef', 'email', 'dev_rao_311@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '86ba7c1a-6af8-442e-8b63-383fd26f6557',
  '559932ca-430f-4671-b42d-2e076cb68f84',
  '559932ca-430f-4671-b42d-2e076cb68f84',
  json_build_object('sub', '559932ca-430f-4671-b42d-2e076cb68f84', 'email', 'sophia_roy_174@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '31d55714-fdfc-494b-aa70-75b203aa2043',
  '59db6c4b-edb7-44c6-ae1e-9dcd9dbcf1b9',
  '59db6c4b-edb7-44c6-ae1e-9dcd9dbcf1b9',
  json_build_object('sub', '59db6c4b-edb7-44c6-ae1e-9dcd9dbcf1b9', 'email', 'swati_iyer_895@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'a765b724-ea8b-43eb-a8e2-52aa2bad180d',
  '95085393-246a-47b8-9b3b-0794a471b1e1',
  '95085393-246a-47b8-9b3b-0794a471b1e1',
  json_build_object('sub', '95085393-246a-47b8-9b3b-0794a471b1e1', 'email', 'olivia_taylor_626@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '5d8943e8-380e-4a70-b4e3-e5a512ddf3e7',
  '69eadeaa-44cc-407b-8dbd-aba56a37f377',
  '69eadeaa-44cc-407b-8dbd-aba56a37f377',
  json_build_object('sub', '69eadeaa-44cc-407b-8dbd-aba56a37f377', 'email', 'karan_martinez_442@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '273abe78-e613-4aba-815e-e5331c73be78',
  'bd4398ff-6965-4f78-82e0-3a8e5bff6c2b',
  'bd4398ff-6965-4f78-82e0-3a8e5bff6c2b',
  json_build_object('sub', 'bd4398ff-6965-4f78-82e0-3a8e5bff6c2b', 'email', 'shruti_martinez_380@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'd10654d2-4d6d-4fbb-9178-216f8a0ed0a4',
  'efa23374-8ee8-4683-85ef-012287bd5001',
  'efa23374-8ee8-4683-85ef-012287bd5001',
  json_build_object('sub', 'efa23374-8ee8-4683-85ef-012287bd5001', 'email', 'arjun_sarkar_707@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'e6828d2b-ead4-409e-a6b8-8f536ad8bfcb',
  '0e94f1c3-d016-4eab-aeae-3231ef9d1c81',
  '0e94f1c3-d016-4eab-aeae-3231ef9d1c81',
  json_build_object('sub', '0e94f1c3-d016-4eab-aeae-3231ef9d1c81', 'email', 'ethan_garcia_263@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '76b3ae9c-a9f8-4fbe-b0b4-4aa28956015a',
  'ea7ecb5d-7578-44d2-a160-64829262b745',
  'ea7ecb5d-7578-44d2-a160-64829262b745',
  json_build_object('sub', 'ea7ecb5d-7578-44d2-a160-64829262b745', 'email', 'ananya_mishra_406@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'f32daf90-54a1-4934-81de-1411ad00268c',
  '0c1b1494-2389-4c6f-aa6b-0bcdd0589e2a',
  '0c1b1494-2389-4c6f-aa6b-0bcdd0589e2a',
  json_build_object('sub', '0c1b1494-2389-4c6f-aa6b-0bcdd0589e2a', 'email', 'pranav_roy_143@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'ad748eee-3267-429a-b68b-e325b2e0faf1',
  '2b52fd88-c7e9-4d2c-8c64-a47fa3148c39',
  '2b52fd88-c7e9-4d2c-8c64-a47fa3148c39',
  json_build_object('sub', '2b52fd88-c7e9-4d2c-8c64-a47fa3148c39', 'email', 'tanvi_dutta_576@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '4155bfd3-aa88-41f5-8e3a-50bfda12763c',
  'b3e3c802-1e80-4a79-8e54-9336b9c1be2a',
  'b3e3c802-1e80-4a79-8e54-9336b9c1be2a',
  json_build_object('sub', 'b3e3c802-1e80-4a79-8e54-9336b9c1be2a', 'email', 'divya_tiwari_491@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'fa2ca471-0f84-46bc-8c34-7d9a8afd0183',
  '2deac984-5394-4152-9ca0-ce739e6bc91d',
  '2deac984-5394-4152-9ca0-ce739e6bc91d',
  json_build_object('sub', '2deac984-5394-4152-9ca0-ce739e6bc91d', 'email', 'sid_singh_814@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'acb79b3b-ec2e-418d-8890-a310b32c36f7',
  '980a178b-6adf-4e67-b8a4-e60819ba18be',
  '980a178b-6adf-4e67-b8a4-e60819ba18be',
  json_build_object('sub', '980a178b-6adf-4e67-b8a4-e60819ba18be', 'email', 'noah_johnson_457@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'fcb53f3e-6966-491d-868a-ad65a734dabf',
  '86de7fed-2a87-4389-aa55-5130a17f6652',
  '86de7fed-2a87-4389-aa55-5130a17f6652',
  json_build_object('sub', '86de7fed-2a87-4389-aa55-5130a17f6652', 'email', 'karan_taylor_980@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '5c61eb09-e196-4e38-aed3-3ec2e685cce4',
  '29cce4ac-5fdf-4136-b754-7db5fad6ad8f',
  '29cce4ac-5fdf-4136-b754-7db5fad6ad8f',
  json_build_object('sub', '29cce4ac-5fdf-4136-b754-7db5fad6ad8f', 'email', 'isabella_dutta_940@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'ecd51a82-8308-4615-9f93-839ddbc692d9',
  '8bcaf745-3384-4c8d-a199-b78bb661b9a8',
  '8bcaf745-3384-4c8d-a199-b78bb661b9a8',
  json_build_object('sub', '8bcaf745-3384-4c8d-a199-b78bb661b9a8', 'email', 'rohan_pandey_112@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'a4f90fe7-7406-47b3-abf9-c2849f5c70b6',
  '37e1dfc7-927f-43f6-9cf6-af9c7d37eb5c',
  '37e1dfc7-927f-43f6-9cf6-af9c7d37eb5c',
  json_build_object('sub', '37e1dfc7-927f-43f6-9cf6-af9c7d37eb5c', 'email', 'swati_garcia_619@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '96b0c103-c81c-45af-b60e-cff03a29d232',
  'fe273d9a-3f0b-4cc6-affc-b9373e025dd5',
  'fe273d9a-3f0b-4cc6-affc-b9373e025dd5',
  json_build_object('sub', 'fe273d9a-3f0b-4cc6-affc-b9373e025dd5', 'email', 'noah_iyer_406@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '75b69eb3-b245-43c5-8492-e43f4bb9b6da',
  '919ce9e5-f66b-4c18-a592-7733f4a99b40',
  '919ce9e5-f66b-4c18-a592-7733f4a99b40',
  json_build_object('sub', '919ce9e5-f66b-4c18-a592-7733f4a99b40', 'email', 'sanjay_roy_322@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '9cfed274-3f9a-4464-86ee-7d65f616c768',
  '045b5126-682e-4daf-b26c-46fd29a505d5',
  '045b5126-682e-4daf-b26c-46fd29a505d5',
  json_build_object('sub', '045b5126-682e-4daf-b26c-46fd29a505d5', 'email', 'sid_sarkar_518@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '95648ce8-f3fe-4ef3-a9f2-3b0a4570fe30',
  'f42860a5-ba9d-40b2-97db-223eb6a826dc',
  'f42860a5-ba9d-40b2-97db-223eb6a826dc',
  json_build_object('sub', 'f42860a5-ba9d-40b2-97db-223eb6a826dc', 'email', 'siddharth_sen_171@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '79cace46-a065-4714-a01f-dbe7ad0afc3e',
  '081d7987-d305-44f7-91ed-bb9f71701fcf',
  '081d7987-d305-44f7-91ed-bb9f71701fcf',
  json_build_object('sub', '081d7987-d305-44f7-91ed-bb9f71701fcf', 'email', 'lucas_mukherjee_798@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'b8a8c77d-f5a8-4304-989e-fb77e1922896',
  'e7ede99d-6d21-44ea-a787-d95f0decbb02',
  'e7ede99d-6d21-44ea-a787-d95f0decbb02',
  json_build_object('sub', 'e7ede99d-6d21-44ea-a787-d95f0decbb02', 'email', 'karan_bose_608@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '911ae74d-190c-47a1-9dd0-9dc95c3a888c',
  '5d63dcbc-86dd-4751-a9c3-3dd3cf4d310a',
  '5d63dcbc-86dd-4751-a9c3-3dd3cf4d310a',
  json_build_object('sub', '5d63dcbc-86dd-4751-a9c3-3dd3cf4d310a', 'email', 'vihaan_garcia_971@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'a8369192-ee0e-4ed9-adcd-7d49eae36b8a',
  'b756ab2f-e8f0-415e-9f6a-3d4ef282e084',
  'b756ab2f-e8f0-415e-9f6a-3d4ef282e084',
  json_build_object('sub', 'b756ab2f-e8f0-415e-9f6a-3d4ef282e084', 'email', 'meera_tripathi_455@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'b7972954-9947-474d-9615-ce99b22e8e4f',
  '9dd545fc-f588-4246-9f79-5d8573eb46c7',
  '9dd545fc-f588-4246-9f79-5d8573eb46c7',
  json_build_object('sub', '9dd545fc-f588-4246-9f79-5d8573eb46c7', 'email', 'ethan_martinez_363@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'a17ec1b8-0c37-4763-9322-3b7054886f7a',
  '6fd92abd-1a8f-49a4-8099-24f3f1ae4eb1',
  '6fd92abd-1a8f-49a4-8099-24f3f1ae4eb1',
  json_build_object('sub', '6fd92abd-1a8f-49a4-8099-24f3f1ae4eb1', 'email', 'akash_singh_726@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'a890c3b5-f604-4a7d-a77f-694867b44d74',
  'ee05c733-2217-4f49-8949-3aff36b19d0a',
  'ee05c733-2217-4f49-8949-3aff36b19d0a',
  json_build_object('sub', 'ee05c733-2217-4f49-8949-3aff36b19d0a', 'email', 'pranav_gupta_477@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '8f6fb42a-07b2-4d88-9f6e-4141f2f8c436',
  '8ac8badf-66de-4b85-9c31-fed1b0f68b9f',
  '8ac8badf-66de-4b85-9c31-fed1b0f68b9f',
  json_build_object('sub', '8ac8badf-66de-4b85-9c31-fed1b0f68b9f', 'email', 'pooja_ghosh_425@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'abd733eb-3e91-44f0-a686-8d8c733c8a0a',
  'a58d7ab6-056e-4093-a229-3a4fd8d253fc',
  'a58d7ab6-056e-4093-a229-3a4fd8d253fc',
  json_build_object('sub', 'a58d7ab6-056e-4093-a229-3a4fd8d253fc', 'email', 'shruti_tiwari_119@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'd8745345-6a61-499e-9891-bf8b3dc22c1e',
  '65f6b48c-f01f-4d88-997c-0d0044a3342c',
  '65f6b48c-f01f-4d88-997c-0d0044a3342c',
  json_build_object('sub', '65f6b48c-f01f-4d88-997c-0d0044a3342c', 'email', 'lucas_garcia_723@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'ffe73ed8-f7ad-4fce-9675-d016a417660f',
  'd3ea2221-cc76-4556-b5fe-b966c89b9946',
  'd3ea2221-cc76-4556-b5fe-b966c89b9946',
  json_build_object('sub', 'd3ea2221-cc76-4556-b5fe-b966c89b9946', 'email', 'dev_anderson_888@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'f18eb489-57e4-496a-bab9-1188ea18020b',
  '73a48b37-e39d-429a-940f-458f3f8b3a9c',
  '73a48b37-e39d-429a-940f-458f3f8b3a9c',
  json_build_object('sub', '73a48b37-e39d-429a-940f-458f3f8b3a9c', 'email', 'kabir_mehta_239@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '956014fe-7ab4-439e-b2f2-ba4daf36825d',
  '1200fcf8-0034-4a17-a537-f4ddc214af40',
  '1200fcf8-0034-4a17-a537-f4ddc214af40',
  json_build_object('sub', '1200fcf8-0034-4a17-a537-f4ddc214af40', 'email', 'arjun_taylor_285@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '12bb5c31-b257-424c-bac3-2d77e7d11853',
  'cd3c6db0-85fe-41ea-a56a-124f87006c42',
  'cd3c6db0-85fe-41ea-a56a-124f87006c42',
  json_build_object('sub', 'cd3c6db0-85fe-41ea-a56a-124f87006c42', 'email', 'rahul_wilson_455@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'db3b2d5f-c146-4183-bc1c-174e0402d61e',
  'f01eba52-e33c-4e69-aab9-1464380f76aa',
  'f01eba52-e33c-4e69-aab9-1464380f76aa',
  json_build_object('sub', 'f01eba52-e33c-4e69-aab9-1464380f76aa', 'email', 'ananya_banerjee_829@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '806ec395-abeb-4fdc-a020-597270a50ed4',
  '44650983-6d09-440e-9dfd-5132fb87f689',
  '44650983-6d09-440e-9dfd-5132fb87f689',
  json_build_object('sub', '44650983-6d09-440e-9dfd-5132fb87f689', 'email', 'aishwarya_ray_895@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '1d4d167e-fcb4-40ec-8063-cefd7a8e6821',
  '6096b819-0e38-44f1-b872-76defe3903e8',
  '6096b819-0e38-44f1-b872-76defe3903e8',
  json_build_object('sub', '6096b819-0e38-44f1-b872-76defe3903e8', 'email', 'sanjay_reddy_453@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'ddc9d768-16bd-497f-bfb0-a20720474dec',
  'd63410e9-35b5-4885-a3da-8562c9377d29',
  'd63410e9-35b5-4885-a3da-8562c9377d29',
  json_build_object('sub', 'd63410e9-35b5-4885-a3da-8562c9377d29', 'email', 'pooja_rao_616@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '20d67f16-b3be-425f-b642-e8c1d1557485',
  '5146b688-a6d1-4432-954f-507756babf22',
  '5146b688-a6d1-4432-954f-507756babf22',
  json_build_object('sub', '5146b688-a6d1-4432-954f-507756babf22', 'email', 'shruti_sen_451@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '5a71c3ae-985a-4e0e-9c37-cdfd51e535f6',
  '9d6d989a-ef0a-43a0-8ada-eb804c205ee6',
  '9d6d989a-ef0a-43a0-8ada-eb804c205ee6',
  json_build_object('sub', '9d6d989a-ef0a-43a0-8ada-eb804c205ee6', 'email', 'anjali_nair_583@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '68b2b1f8-c4d0-4029-b027-8d92606c9494',
  'dd36e51a-942b-4c8f-9309-355fa17d2310',
  'dd36e51a-942b-4c8f-9309-355fa17d2310',
  json_build_object('sub', 'dd36e51a-942b-4c8f-9309-355fa17d2310', 'email', 'liam_mukherjee_548@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '5d12383e-b9fe-42ba-8295-53ef2bd1b9e0',
  '3833faf8-063f-414f-87f9-7942fb11c672',
  '3833faf8-063f-414f-87f9-7942fb11c672',
  json_build_object('sub', '3833faf8-063f-414f-87f9-7942fb11c672', 'email', 'lucas_miller_359@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'e1dd8eba-b343-484e-8583-44f278a26cc1',
  'e437ee61-f2f9-49f7-ad7d-a887695907a3',
  'e437ee61-f2f9-49f7-ad7d-a887695907a3',
  json_build_object('sub', 'e437ee61-f2f9-49f7-ad7d-a887695907a3', 'email', 'sophia_shukla_782@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '90fb9994-50dd-4c2c-9669-d5bb8704d6a0',
  '16a115a0-07df-46b4-ad52-ef24d63252be',
  '16a115a0-07df-46b4-ad52-ef24d63252be',
  json_build_object('sub', '16a115a0-07df-46b4-ad52-ef24d63252be', 'email', 'riya_patel_609@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '5c25aa44-67ff-4a4e-9fc2-66ba90397497',
  'c9b9f5b9-84b2-4a4b-ad0d-b20def9c57b6',
  'c9b9f5b9-84b2-4a4b-ad0d-b20def9c57b6',
  json_build_object('sub', 'c9b9f5b9-84b2-4a4b-ad0d-b20def9c57b6', 'email', 'neha_ray_370@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '0f353039-b745-4ecf-9a6e-37575c3d97ec',
  '0b64a469-0c8d-473a-b8cc-751db613e8ad',
  '0b64a469-0c8d-473a-b8cc-751db613e8ad',
  json_build_object('sub', '0b64a469-0c8d-473a-b8cc-751db613e8ad', 'email', 'noah_das_363@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '4c6be2c5-0bcc-4080-9f38-94ea25264c96',
  'f67db27d-4b42-4b6c-b2d4-1c0e515b796b',
  'f67db27d-4b42-4b6c-b2d4-1c0e515b796b',
  json_build_object('sub', 'f67db27d-4b42-4b6c-b2d4-1c0e515b796b', 'email', 'sanjana_dwivedi_771@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '7a308b24-713c-49d8-b21e-89ce853a74e6',
  '0e8d7c15-18bf-401d-8307-6390c36338e0',
  '0e8d7c15-18bf-401d-8307-6390c36338e0',
  json_build_object('sub', '0e8d7c15-18bf-401d-8307-6390c36338e0', 'email', 'riya_mehta_566@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'beeaddf5-1d7a-4bd9-ab92-3810bcc1be41',
  '2fc7fd0e-8866-4002-bae2-3d7cbedcfc60',
  '2fc7fd0e-8866-4002-bae2-3d7cbedcfc60',
  json_build_object('sub', '2fc7fd0e-8866-4002-bae2-3d7cbedcfc60', 'email', 'aishwarya_brown_716@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '55e02d9d-3a07-4b25-9364-2fd465255bf2',
  '2f20b565-ad60-4e1c-bb1c-4a3d162a214c',
  '2f20b565-ad60-4e1c-bb1c-4a3d162a214c',
  json_build_object('sub', '2f20b565-ad60-4e1c-bb1c-4a3d162a214c', 'email', 'aarav_mehta_449@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'fb7426d7-b70d-4109-a597-96102b68d0b6',
  '6951a168-02cf-4f7b-8267-3ad8a9ffb85f',
  '6951a168-02cf-4f7b-8267-3ad8a9ffb85f',
  json_build_object('sub', '6951a168-02cf-4f7b-8267-3ad8a9ffb85f', 'email', 'siddharth_kumar_922@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '008cc9e5-63d6-4b3f-a0d9-12852b1ff4fe',
  'bc9d88f8-7a89-4981-9106-798e997cccf1',
  'bc9d88f8-7a89-4981-9106-798e997cccf1',
  json_build_object('sub', 'bc9d88f8-7a89-4981-9106-798e997cccf1', 'email', 'sanjana_shukla_650@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'ab6b5ee1-6aac-432f-9d34-72c6f43a64b6',
  'aabb975e-909a-4fcb-a36c-a9e17a31a7a8',
  'aabb975e-909a-4fcb-a36c-a9e17a31a7a8',
  json_build_object('sub', 'aabb975e-909a-4fcb-a36c-a9e17a31a7a8', 'email', 'aria_johnson_309@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'b68b8095-7dae-4416-8adb-e75365508d65',
  'ef1f401a-ad98-4034-858f-e50428bb2b9a',
  'ef1f401a-ad98-4034-858f-e50428bb2b9a',
  json_build_object('sub', 'ef1f401a-ad98-4034-858f-e50428bb2b9a', 'email', 'rohan_rodriguez_326@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '9384550b-f17b-4352-afcc-e242128d9963',
  '839be94c-b954-4e02-9b31-c23d51a6aa88',
  '839be94c-b954-4e02-9b31-c23d51a6aa88',
  json_build_object('sub', '839be94c-b954-4e02-9b31-c23d51a6aa88', 'email', 'anjali_martinez_188@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '111b96ee-1381-4a7b-b57c-bfee3ab9674a',
  'becb90ae-28c3-43e3-9ec6-0248f6ae46e7',
  'becb90ae-28c3-43e3-9ec6-0248f6ae46e7',
  json_build_object('sub', 'becb90ae-28c3-43e3-9ec6-0248f6ae46e7', 'email', 'aarav_dutta_719@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '8905573d-efa5-4fbe-9fa9-1fb79071ec7d',
  '6df8d004-da23-4845-87cb-7739ac64e78f',
  '6df8d004-da23-4845-87cb-7739ac64e78f',
  json_build_object('sub', '6df8d004-da23-4845-87cb-7739ac64e78f', 'email', 'aria_ray_996@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'ba62efd6-d9eb-4c9c-bba5-1bd8a5e2ad79',
  '59e358f6-0830-42e6-82ed-642ea463308c',
  '59e358f6-0830-42e6-82ed-642ea463308c',
  json_build_object('sub', '59e358f6-0830-42e6-82ed-642ea463308c', 'email', 'mason_sen_846@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'fb977e84-eb5e-4806-ad93-78b67095b72b',
  'bcdf7c6f-3c76-47b9-b77b-2fa74ab686fd',
  'bcdf7c6f-3c76-47b9-b77b-2fa74ab686fd',
  json_build_object('sub', 'bcdf7c6f-3c76-47b9-b77b-2fa74ab686fd', 'email', 'akash_thomas_294@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '478fb8e3-14ee-4895-8496-b5bc1e4c2679',
  '6b062513-8be6-4122-a33a-0a203fc0ad8d',
  '6b062513-8be6-4122-a33a-0a203fc0ad8d',
  json_build_object('sub', '6b062513-8be6-4122-a33a-0a203fc0ad8d', 'email', 'sanjana_rodriguez_621@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '23fd6317-643e-4260-a431-e513cb9b20b2',
  'f63afe9b-16b6-484a-9cd7-458a7b3ecc99',
  'f63afe9b-16b6-484a-9cd7-458a7b3ecc99',
  json_build_object('sub', 'f63afe9b-16b6-484a-9cd7-458a7b3ecc99', 'email', 'pooja_roy_360@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '47657e96-9ed2-489f-a5a9-34ebcbeafe60',
  '1c79d5f0-4d12-4b21-ae80-cfef10a42938',
  '1c79d5f0-4d12-4b21-ae80-cfef10a42938',
  json_build_object('sub', '1c79d5f0-4d12-4b21-ae80-cfef10a42938', 'email', 'sanjay_banerjee_373@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '794e0565-ad99-4963-9147-75bd966b8e32',
  'd9f60f3f-4e97-4f52-bbba-3f9445c2778a',
  'd9f60f3f-4e97-4f52-bbba-3f9445c2778a',
  json_build_object('sub', 'd9f60f3f-4e97-4f52-bbba-3f9445c2778a', 'email', 'kabir_ghosh_523@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'a9362a4e-ebed-4e38-bea6-ef3b710130bf',
  '1e34604b-7948-46d4-b430-d95b1d5864f2',
  '1e34604b-7948-46d4-b430-d95b1d5864f2',
  json_build_object('sub', '1e34604b-7948-46d4-b430-d95b1d5864f2', 'email', 'alex_anderson_172@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '94c12fc4-471c-4c64-ac48-44519ff045ad',
  '523d3dc9-14e2-4c51-92f6-58085dc2ccc0',
  '523d3dc9-14e2-4c51-92f6-58085dc2ccc0',
  json_build_object('sub', '523d3dc9-14e2-4c51-92f6-58085dc2ccc0', 'email', 'kabir_jones_598@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '72c9995d-43b7-47b9-b810-e03397250603',
  '8242d1fd-e2a7-4f74-9659-c025d48a77f8',
  '8242d1fd-e2a7-4f74-9659-c025d48a77f8',
  json_build_object('sub', '8242d1fd-e2a7-4f74-9659-c025d48a77f8', 'email', 'meera_jones_548@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '4dfe4630-6b7c-413f-b783-49b4f527fbdc',
  '90d56139-eefa-4596-a095-d328ccbc7c96',
  '90d56139-eefa-4596-a095-d328ccbc7c96',
  json_build_object('sub', '90d56139-eefa-4596-a095-d328ccbc7c96', 'email', 'priya_patel_327@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '4eee412d-fc89-4dc7-a1c5-420eee061654',
  'a561c14d-ce6d-4739-a4e6-aaf99b9d3b49',
  'a561c14d-ce6d-4739-a4e6-aaf99b9d3b49',
  json_build_object('sub', 'a561c14d-ce6d-4739-a4e6-aaf99b9d3b49', 'email', 'akash_jones_988@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'f47b2b9f-20d0-4ba1-9ea0-1f7f3739884c',
  'eac37ad1-ea13-4622-9e9b-b63c72aaefcf',
  'eac37ad1-ea13-4622-9e9b-b63c72aaefcf',
  json_build_object('sub', 'eac37ad1-ea13-4622-9e9b-b63c72aaefcf', 'email', 'mason_mitra_956@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'ff40f8ec-026c-44a0-9c73-0e4cba8f5b83',
  '3f65a569-2094-4786-b2f2-268bb6697839',
  '3f65a569-2094-4786-b2f2-268bb6697839',
  json_build_object('sub', '3f65a569-2094-4786-b2f2-268bb6697839', 'email', 'sanjana_roy_345@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'b02eecfd-8bbc-4042-96e0-c977b89507fd',
  'ca50075a-9b25-4e44-8c50-683c009f2118',
  'ca50075a-9b25-4e44-8c50-683c009f2118',
  json_build_object('sub', 'ca50075a-9b25-4e44-8c50-683c009f2118', 'email', 'sanjay_pal_322@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'd5557210-5113-4bca-ac21-1112f1c3a8de',
  'eeee7f1d-c207-42a2-b4bc-0f549c07795b',
  'eeee7f1d-c207-42a2-b4bc-0f549c07795b',
  json_build_object('sub', 'eeee7f1d-c207-42a2-b4bc-0f549c07795b', 'email', 'dev_hernandez_730@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'bd752f26-4a72-4cb7-b492-0349acc43c82',
  'c7010de5-3997-41fd-b411-460b0f04fe26',
  'c7010de5-3997-41fd-b411-460b0f04fe26',
  json_build_object('sub', 'c7010de5-3997-41fd-b411-460b0f04fe26', 'email', 'mason_taylor_890@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '1151d200-cac8-4220-8a6a-92424ef22f6c',
  '08d480c6-be62-44ca-9a47-b8493a116495',
  '08d480c6-be62-44ca-9a47-b8493a116495',
  json_build_object('sub', '08d480c6-be62-44ca-9a47-b8493a116495', 'email', 'ananya_dutta_360@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '2a423bf5-1055-4d7f-8a22-2c3523d487ad',
  'bb62f128-074b-4513-93ac-f23d3ef6f87e',
  'bb62f128-074b-4513-93ac-f23d3ef6f87e',
  json_build_object('sub', 'bb62f128-074b-4513-93ac-f23d3ef6f87e', 'email', 'ava_iyer_166@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '505116e5-e9ae-4b0d-a760-86c52e273c62',
  'ec39b5d9-32ae-4a25-8b3e-960c0b4e00aa',
  'ec39b5d9-32ae-4a25-8b3e-960c0b4e00aa',
  json_build_object('sub', 'ec39b5d9-32ae-4a25-8b3e-960c0b4e00aa', 'email', 'neha_sarkar_692@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '21e07db9-e0f3-4304-b50d-f491d7d9b0f5',
  '6357186f-0d1f-478a-a673-d952be58cbb9',
  '6357186f-0d1f-478a-a673-d952be58cbb9',
  json_build_object('sub', '6357186f-0d1f-478a-a673-d952be58cbb9', 'email', 'rahul_pal_231@srmeaswari.edu.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '718af555-3d48-439d-b4cf-18c5ef1aea48',
  '90ba2aee-0530-4015-a95f-5e4064c1ed26',
  '90ba2aee-0530-4015-a95f-5e4064c1ed26',
  json_build_object('sub', '90ba2aee-0530-4015-a95f-5e4064c1ed26', 'email', 'pranav_shukla_734@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '2010c07f-2094-4f3b-bd58-395887b0608a',
  'b1685ff5-4d76-4605-bceb-3c5e30808acf',
  'b1685ff5-4d76-4605-bceb-3c5e30808acf',
  json_build_object('sub', 'b1685ff5-4d76-4605-bceb-3c5e30808acf', 'email', 'mia_banerjee_137@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '9c9319bd-ce16-42ba-8741-025fdb04c140',
  'edf37ca9-63ff-435f-a668-28a01d249408',
  'edf37ca9-63ff-435f-a668-28a01d249408',
  json_build_object('sub', 'edf37ca9-63ff-435f-a668-28a01d249408', 'email', 'tanvi_brown_297@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'c127569e-b55d-4d0d-9355-037f04902ec1',
  '230a48ef-b259-4710-9cc7-67f031f494ed',
  '230a48ef-b259-4710-9cc7-67f031f494ed',
  json_build_object('sub', '230a48ef-b259-4710-9cc7-67f031f494ed', 'email', 'aarav_rao_541@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '38a89a55-0247-4ecc-894e-80a8a626dcb4',
  '3d08b628-f90a-48cd-b7a7-ee8d8c94245c',
  '3d08b628-f90a-48cd-b7a7-ee8d8c94245c',
  json_build_object('sub', '3d08b628-f90a-48cd-b7a7-ee8d8c94245c', 'email', 'sophia_johnson_452@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'd64a72fd-b8f0-4b44-82f2-86384bb0a7e5',
  '94c790da-6922-4892-a827-46db5fd34b07',
  '94c790da-6922-4892-a827-46db5fd34b07',
  json_build_object('sub', '94c790da-6922-4892-a827-46db5fd34b07', 'email', 'rahul_adhikari_951@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '4cd4901a-90a2-4f9f-8fda-860fca30d3e0',
  '3c1554eb-ae3d-456d-94a9-036d9cc134a2',
  '3c1554eb-ae3d-456d-94a9-036d9cc134a2',
  json_build_object('sub', '3c1554eb-ae3d-456d-94a9-036d9cc134a2', 'email', 'sanjay_tiwari_756@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '6f7467e4-6c33-4d2e-95a7-a08d7a7788d5',
  '36acbc42-aa58-4b42-9fb3-2d4cfebfdf8c',
  '36acbc42-aa58-4b42-9fb3-2d4cfebfdf8c',
  json_build_object('sub', '36acbc42-aa58-4b42-9fb3-2d4cfebfdf8c', 'email', 'dev_roy_963@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '8d4751f5-e69c-4b6f-b989-b5748bb2aeab',
  'e52e5717-6920-4008-87b9-30df639dee22',
  'e52e5717-6920-4008-87b9-30df639dee22',
  json_build_object('sub', 'e52e5717-6920-4008-87b9-30df639dee22', 'email', 'priya_taylor_694@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'c68c113c-2941-4b85-b33d-661f53f55784',
  'e8cf5c3e-2648-4b7a-a3ee-243d5c609a2b',
  'e8cf5c3e-2648-4b7a-a3ee-243d5c609a2b',
  json_build_object('sub', 'e8cf5c3e-2648-4b7a-a3ee-243d5c609a2b', 'email', 'aria_pal_962@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '27b9b9ba-b025-4163-aec7-95ef97991b95',
  '4fd7de47-dc26-40b3-9f71-ea9bb0166376',
  '4fd7de47-dc26-40b3-9f71-ea9bb0166376',
  json_build_object('sub', '4fd7de47-dc26-40b3-9f71-ea9bb0166376', 'email', 'diya_anderson_810@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '4f69dec4-e34a-4f3f-b44d-ec753e430e92',
  'cc656283-a152-4cea-97e7-543d7b6ef605',
  'cc656283-a152-4cea-97e7-543d7b6ef605',
  json_build_object('sub', 'cc656283-a152-4cea-97e7-543d7b6ef605', 'email', 'karan_dutta_531@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'd01c217c-0bde-4813-9a0d-a36543de974c',
  '847ea109-f13d-498a-9ffb-90da77cf4355',
  '847ea109-f13d-498a-9ffb-90da77cf4355',
  json_build_object('sub', '847ea109-f13d-498a-9ffb-90da77cf4355', 'email', 'swati_mukherjee_533@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '8fe15992-0ede-4062-880a-49c62236d978',
  'd8b82df6-6297-4df8-8489-92f1a710c829',
  'd8b82df6-6297-4df8-8489-92f1a710c829',
  json_build_object('sub', 'd8b82df6-6297-4df8-8489-92f1a710c829', 'email', 'ava_verma_460@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '47aa392a-4101-4e35-961a-41f6eb7233e0',
  'd133c9e6-0372-4e65-8a99-7f24fa5dac57',
  'd133c9e6-0372-4e65-8a99-7f24fa5dac57',
  json_build_object('sub', 'd133c9e6-0372-4e65-8a99-7f24fa5dac57', 'email', 'raj_mitra_322@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '1cfccbaa-6e6f-41d8-9575-b55a949d5729',
  '76bc3ce3-a143-462b-a045-bb065f3b1bd6',
  '76bc3ce3-a143-462b-a045-bb065f3b1bd6',
  json_build_object('sub', '76bc3ce3-a143-462b-a045-bb065f3b1bd6', 'email', 'pooja_pal_527@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '054e357c-7398-4d34-8719-17077aa5a6fd',
  '77ad442e-4109-4023-8471-0899ba4b7ccf',
  '77ad442e-4109-4023-8471-0899ba4b7ccf',
  json_build_object('sub', '77ad442e-4109-4023-8471-0899ba4b7ccf', 'email', 'amit_williams_801@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'be65d0ff-f6ab-4062-933e-c2cfd044a324',
  'a07a787f-0337-45ca-9ad5-2bcbd31a61fc',
  'a07a787f-0337-45ca-9ad5-2bcbd31a61fc',
  json_build_object('sub', 'a07a787f-0337-45ca-9ad5-2bcbd31a61fc', 'email', 'aarav_nair_581@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '61abf643-01b0-480a-8a00-799bf5fd23fa',
  '59e40063-0efa-4007-a962-dffcf4d0b125',
  '59e40063-0efa-4007-a962-dffcf4d0b125',
  json_build_object('sub', '59e40063-0efa-4007-a962-dffcf4d0b125', 'email', 'sophia_dutta_475@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '2ee1de42-0dab-4b6f-a2c3-56698eb2ddd2',
  '5fc516b0-5e1a-4f38-9390-20c5aed49bde',
  '5fc516b0-5e1a-4f38-9390-20c5aed49bde',
  json_build_object('sub', '5fc516b0-5e1a-4f38-9390-20c5aed49bde', 'email', 'anjali_thomas_470@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '5774427d-eac2-4f11-8153-bf2b108f5af4',
  '439bb5c3-ec9e-4b0e-9d7c-68db8c1f667b',
  '439bb5c3-ec9e-4b0e-9d7c-68db8c1f667b',
  json_build_object('sub', '439bb5c3-ec9e-4b0e-9d7c-68db8c1f667b', 'email', 'isabella_reddy_390@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'ca3a27e9-41d7-4e44-a407-c0a246e4a156',
  'aeb956f4-c040-4b95-9002-75a9348003bb',
  'aeb956f4-c040-4b95-9002-75a9348003bb',
  json_build_object('sub', 'aeb956f4-c040-4b95-9002-75a9348003bb', 'email', 'pooja_hernandez_616@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'ef2e1757-80bb-4c9d-a0e9-a323d5a896dd',
  '84cea089-b149-4d45-95a1-655302a00713',
  '84cea089-b149-4d45-95a1-655302a00713',
  json_build_object('sub', '84cea089-b149-4d45-95a1-655302a00713', 'email', 'noah_reddy_401@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '1d347f92-ad04-4510-ab6a-c7862c039c08',
  'c89b378a-0515-41f4-bb79-1eeb7f5ffb01',
  'c89b378a-0515-41f4-bb79-1eeb7f5ffb01',
  json_build_object('sub', 'c89b378a-0515-41f4-bb79-1eeb7f5ffb01', 'email', 'vijay_gupta_540@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '45f7f5d8-22c0-4e02-8dc9-fea7ff47a8a8',
  '2eb33d5c-e05b-4c2d-ac0e-415449f5bc0b',
  '2eb33d5c-e05b-4c2d-ac0e-415449f5bc0b',
  json_build_object('sub', '2eb33d5c-e05b-4c2d-ac0e-415449f5bc0b', 'email', 'rohan_reddy_524@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '2ef73dbb-3ce8-460d-8167-6729affd2c54',
  '0dea342a-f9df-44bf-a1cd-f9be169561e4',
  '0dea342a-f9df-44bf-a1cd-f9be169561e4',
  json_build_object('sub', '0dea342a-f9df-44bf-a1cd-f9be169561e4', 'email', 'kavya_bose_750@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '03b783e1-c144-4682-8968-2d8fc0b7ff8f',
  'f9d59114-543a-41c6-b915-e532e216dbfe',
  'f9d59114-543a-41c6-b915-e532e216dbfe',
  json_build_object('sub', 'f9d59114-543a-41c6-b915-e532e216dbfe', 'email', 'sophia_pandey_906@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '274c352c-2cd7-4471-aea0-3865b818b906',
  'b547ac66-cbfe-4f45-ab5e-f3757056c0d3',
  'b547ac66-cbfe-4f45-ab5e-f3757056c0d3',
  json_build_object('sub', 'b547ac66-cbfe-4f45-ab5e-f3757056c0d3', 'email', 'rahul_gupta_343@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'bd5b1216-6c68-46fc-ad11-cd65e6209ae4',
  '7bcd19a5-4c10-4692-b0d9-62b2709ac8d0',
  '7bcd19a5-4c10-4692-b0d9-62b2709ac8d0',
  json_build_object('sub', '7bcd19a5-4c10-4692-b0d9-62b2709ac8d0', 'email', 'lucas_nair_190@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '878da2a3-c016-4e4a-87c8-7c4bb2b26ec1',
  '87bb46b4-c2a7-46c2-a602-d03630ace053',
  '87bb46b4-c2a7-46c2-a602-d03630ace053',
  json_build_object('sub', '87bb46b4-c2a7-46c2-a602-d03630ace053', 'email', 'shruti_hernandez_934@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'd9771f99-47fe-4b4e-a5e9-39104907cbe0',
  '5b28f8b9-1129-4804-ae02-27efa236abff',
  '5b28f8b9-1129-4804-ae02-27efa236abff',
  json_build_object('sub', '5b28f8b9-1129-4804-ae02-27efa236abff', 'email', 'neha_joshi_990@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '185c1fe8-1527-4b73-8f56-c3bdea2936c2',
  '1cf48f00-0159-43be-8494-317e93a1664d',
  '1cf48f00-0159-43be-8494-317e93a1664d',
  json_build_object('sub', '1cf48f00-0159-43be-8494-317e93a1664d', 'email', 'rohan_sharma_320@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'd175edf5-02ad-4dd2-828a-384c9b2867ea',
  '50588c59-f86c-45cc-bd3b-ced426264e00',
  '50588c59-f86c-45cc-bd3b-ced426264e00',
  json_build_object('sub', '50588c59-f86c-45cc-bd3b-ced426264e00', 'email', 'akash_mitra_498@iitd.ac.in', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '194e48db-227f-471d-b56a-3acf06f4210b',
  'b5c78196-7061-4b36-83d5-3adf7f19b73a',
  'b5c78196-7061-4b36-83d5-3adf7f19b73a',
  json_build_object('sub', 'b5c78196-7061-4b36-83d5-3adf7f19b73a', 'email', 'tanvi_das_118@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '360ff6b9-fb87-46d0-b7b2-df27450c33eb',
  '617845f8-43ba-40c3-8cbc-b1d7403e0a94',
  '617845f8-43ba-40c3-8cbc-b1d7403e0a94',
  json_build_object('sub', '617845f8-43ba-40c3-8cbc-b1d7403e0a94', 'email', 'dev_pal_154@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '126c33eb-2493-451d-95c0-ade35d951c67',
  '623f34b2-93e9-44a8-8701-1fc01d31c94b',
  '623f34b2-93e9-44a8-8701-1fc01d31c94b',
  json_build_object('sub', '623f34b2-93e9-44a8-8701-1fc01d31c94b', 'email', 'alex_roy_270@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'e5d6d02f-9775-4567-bf30-e9179632adc5',
  '726ddef2-65a3-4fba-addb-1d0b603a5b0e',
  '726ddef2-65a3-4fba-addb-1d0b603a5b0e',
  json_build_object('sub', '726ddef2-65a3-4fba-addb-1d0b603a5b0e', 'email', 'isha_tiwari_726@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '11af1b88-9803-4399-930b-e3aa09080978',
  '83a31022-8874-48bc-9ff8-702e5e41dd52',
  '83a31022-8874-48bc-9ff8-702e5e41dd52',
  json_build_object('sub', '83a31022-8874-48bc-9ff8-702e5e41dd52', 'email', 'vihaan_sharma_789@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '07855e86-ecb9-4783-ad4e-7f11bf555c84',
  '083772b1-04e0-42db-811a-66687c2dfb8e',
  '083772b1-04e0-42db-811a-66687c2dfb8e',
  json_build_object('sub', '083772b1-04e0-42db-811a-66687c2dfb8e', 'email', 'aishwarya_wilson_145@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'd5b78934-c8ea-4896-9a4f-201b66093126',
  '3e292949-1a8d-4c22-8863-36473ee2fd45',
  '3e292949-1a8d-4c22-8863-36473ee2fd45',
  json_build_object('sub', '3e292949-1a8d-4c22-8863-36473ee2fd45', 'email', 'isha_kumar_789@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '6a4e200b-50d5-4aaf-b6d6-76c70103f732',
  'fad814ce-fb87-4200-aa73-3220370d507c',
  'fad814ce-fb87-4200-aa73-3220370d507c',
  json_build_object('sub', 'fad814ce-fb87-4200-aa73-3220370d507c', 'email', 'priya_bose_780@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '944f8d9e-3d0e-490e-889b-6009c5379abb',
  'b60b3f90-b1b7-4059-ab33-556ca86e2d10',
  'b60b3f90-b1b7-4059-ab33-556ca86e2d10',
  json_build_object('sub', 'b60b3f90-b1b7-4059-ab33-556ca86e2d10', 'email', 'liam_pandey_312@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'a9d8666b-5371-45f5-95f6-a3619a5d2abb',
  '76f00d37-1a05-43b8-be3c-1bbdebaf8fab',
  '76f00d37-1a05-43b8-be3c-1bbdebaf8fab',
  json_build_object('sub', '76f00d37-1a05-43b8-be3c-1bbdebaf8fab', 'email', 'divya_sharma_931@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'ca36c0de-3597-470e-9afc-3163a0111aa0',
  'dfa29051-3d4e-48f4-b3d6-e494a2d2432d',
  'dfa29051-3d4e-48f4-b3d6-e494a2d2432d',
  json_build_object('sub', 'dfa29051-3d4e-48f4-b3d6-e494a2d2432d', 'email', 'sneha_tiwari_242@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'd9ecf0fc-015a-4f83-8fd8-15d95e57809c',
  '19023178-e52d-4545-80a5-e7d66b461e5f',
  '19023178-e52d-4545-80a5-e7d66b461e5f',
  json_build_object('sub', '19023178-e52d-4545-80a5-e7d66b461e5f', 'email', 'liam_nair_387@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '56cd2c52-bde6-469f-bcf8-fef89e779b6b',
  'ff47290d-71f3-4af9-8949-92142c2b33be',
  'ff47290d-71f3-4af9-8949-92142c2b33be',
  json_build_object('sub', 'ff47290d-71f3-4af9-8949-92142c2b33be', 'email', 'lucas_rao_442@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'f296452e-f1b7-47bd-829b-b1825eafa975',
  'a372d3f3-503d-467c-893f-f6ab09278f02',
  'a372d3f3-503d-467c-893f-f6ab09278f02',
  json_build_object('sub', 'a372d3f3-503d-467c-893f-f6ab09278f02', 'email', 'sid_jones_841@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'fa91b5f3-c279-40fd-a337-59b5038846a0',
  'bd8cc4ff-ec46-4e44-995c-c07aeaa2d701',
  'bd8cc4ff-ec46-4e44-995c-c07aeaa2d701',
  json_build_object('sub', 'bd8cc4ff-ec46-4e44-995c-c07aeaa2d701', 'email', 'alex_sharma_711@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '763736ec-3d89-4d2d-b048-3cdcb0552320',
  '3e6e668c-2d9a-4870-ad75-865d727452e5',
  '3e6e668c-2d9a-4870-ad75-865d727452e5',
  json_build_object('sub', '3e6e668c-2d9a-4870-ad75-865d727452e5', 'email', 'raj_martinez_952@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'b4873f38-584e-472c-a234-c2987db9666d',
  'f797847c-a544-4794-b054-362297cf73cf',
  'f797847c-a544-4794-b054-362297cf73cf',
  json_build_object('sub', 'f797847c-a544-4794-b054-362297cf73cf', 'email', 'divya_banerjee_114@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '9f741cc1-805a-46ab-a083-170ce6817932',
  'e54ca72d-fa79-4a4b-9437-ab75f2586922',
  'e54ca72d-fa79-4a4b-9437-ab75f2586922',
  json_build_object('sub', 'e54ca72d-fa79-4a4b-9437-ab75f2586922', 'email', 'liam_tiwari_557@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '5860d177-ee8f-4157-a50a-53dfddf460bd',
  '29bc4e9a-c4d0-4cdb-873e-8ea9242e704c',
  '29bc4e9a-c4d0-4cdb-873e-8ea9242e704c',
  json_build_object('sub', '29bc4e9a-c4d0-4cdb-873e-8ea9242e704c', 'email', 'pranav_nair_341@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '26f393e0-fb6b-4567-806f-1f4bd7e89dcf',
  '8341d7c2-1a29-4864-8cf0-15ac8797bcaa',
  '8341d7c2-1a29-4864-8cf0-15ac8797bcaa',
  json_build_object('sub', '8341d7c2-1a29-4864-8cf0-15ac8797bcaa', 'email', 'noah_pandey_433@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '58d2d05b-d8a9-465f-ad08-4e2909742778',
  'df9c4d69-5661-4aec-b91c-cbd06469c1af',
  'df9c4d69-5661-4aec-b91c-cbd06469c1af',
  json_build_object('sub', 'df9c4d69-5661-4aec-b91c-cbd06469c1af', 'email', 'pranav_ghosh_562@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'b713a93b-0bd4-4b05-ab38-4d58eef53b35',
  'f58852ad-8023-4d7c-b33c-9106d770fde9',
  'f58852ad-8023-4d7c-b33c-9106d770fde9',
  json_build_object('sub', 'f58852ad-8023-4d7c-b33c-9106d770fde9', 'email', 'meera_davis_355@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'b7bc06c6-261b-447b-879e-3bf59b531e73',
  '0184ed0b-c1d8-40f1-ad8a-d42856143c3f',
  '0184ed0b-c1d8-40f1-ad8a-d42856143c3f',
  json_build_object('sub', '0184ed0b-c1d8-40f1-ad8a-d42856143c3f', 'email', 'riya_singh_398@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '522a5326-4ce8-4a45-b030-5349f2da9dc6',
  'a3c38c25-5fd8-482f-a9e8-a5a64fb6ad03',
  'a3c38c25-5fd8-482f-a9e8-a5a64fb6ad03',
  json_build_object('sub', 'a3c38c25-5fd8-482f-a9e8-a5a64fb6ad03', 'email', 'tanvi_rodriguez_667@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'e1c96a3a-0297-42dc-b628-56e9a681e576',
  '2219c9dc-29f1-4678-925a-80f68dbe7a13',
  '2219c9dc-29f1-4678-925a-80f68dbe7a13',
  json_build_object('sub', '2219c9dc-29f1-4678-925a-80f68dbe7a13', 'email', 'riya_choudhury_297@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '802cde71-a94f-402e-9086-169aff1cd0bd',
  '4eb262ab-2144-4f9e-ab69-37d4db1ef336',
  '4eb262ab-2144-4f9e-ab69-37d4db1ef336',
  json_build_object('sub', '4eb262ab-2144-4f9e-ab69-37d4db1ef336', 'email', 'dev_jones_883@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '79179fff-a630-4120-860d-a1bf12d9341e',
  '63faef35-8abc-4c8d-a69b-59369667c38d',
  '63faef35-8abc-4c8d-a69b-59369667c38d',
  json_build_object('sub', '63faef35-8abc-4c8d-a69b-59369667c38d', 'email', 'sophia_taylor_483@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '9147b8ec-2eb2-4d94-ae57-c027f3b97f34',
  'dad8346e-cbce-4c2e-bee9-8493e9ba1958',
  'dad8346e-cbce-4c2e-bee9-8493e9ba1958',
  json_build_object('sub', 'dad8346e-cbce-4c2e-bee9-8493e9ba1958', 'email', 'rahul_miller_408@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'b445fe36-5d84-486a-b630-de9c19e75ada',
  '76879a4d-1258-48c6-87ab-c24352839a64',
  '76879a4d-1258-48c6-87ab-c24352839a64',
  json_build_object('sub', '76879a4d-1258-48c6-87ab-c24352839a64', 'email', 'shruti_banerjee_293@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'f1ede9e1-6737-4e2c-ae04-aa6717c531f7',
  '24811ec3-7f45-4926-bdff-e5733f11c785',
  '24811ec3-7f45-4926-bdff-e5733f11c785',
  json_build_object('sub', '24811ec3-7f45-4926-bdff-e5733f11c785', 'email', 'sanjay_thomas_813@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'ff111a22-c920-4b12-9eb7-e376d66c0f82',
  '1eaa2260-f8fe-49aa-a7a8-a60b75ad0285',
  '1eaa2260-f8fe-49aa-a7a8-a60b75ad0285',
  json_build_object('sub', '1eaa2260-f8fe-49aa-a7a8-a60b75ad0285', 'email', 'shruti_sen_579@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'a8370b06-63cd-4928-9353-7776726ec99f',
  '48b1e79c-37d1-4bbc-9240-50e66f8a63bb',
  '48b1e79c-37d1-4bbc-9240-50e66f8a63bb',
  json_build_object('sub', '48b1e79c-37d1-4bbc-9240-50e66f8a63bb', 'email', 'akash_brown_338@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'd7f8a73d-8fbc-4f52-9fb7-693f475ef373',
  '469ca073-3e46-4f35-bffa-dfd1d117164c',
  '469ca073-3e46-4f35-bffa-dfd1d117164c',
  json_build_object('sub', '469ca073-3e46-4f35-bffa-dfd1d117164c', 'email', 'isha_smith_264@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '598a6a51-953e-446f-b870-b0c6014ad9f9',
  '5cfca2df-f436-4486-860b-b80e2ccf4e0d',
  '5cfca2df-f436-4486-860b-b80e2ccf4e0d',
  json_build_object('sub', '5cfca2df-f436-4486-860b-b80e2ccf4e0d', 'email', 'lucas_martinez_634@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '3858d189-3676-4dc3-8ea5-d8c8936da685',
  '8d95ff10-5eb4-4e0e-bfe2-3279593a8463',
  '8d95ff10-5eb4-4e0e-bfe2-3279593a8463',
  json_build_object('sub', '8d95ff10-5eb4-4e0e-bfe2-3279593a8463', 'email', 'aarav_nair_139@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '0892b756-952f-4bc8-bfc6-41b36968da2f',
  '9b06bea1-885c-415a-a9d9-59ed7b0968ee',
  '9b06bea1-885c-415a-a9d9-59ed7b0968ee',
  json_build_object('sub', '9b06bea1-885c-415a-a9d9-59ed7b0968ee', 'email', 'sophia_sarkar_751@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '0dc4fd58-946c-403c-aab7-0e6175bb2e7e',
  'b5b78d99-fc9c-47ed-868b-43b53540084d',
  'b5b78d99-fc9c-47ed-868b-43b53540084d',
  json_build_object('sub', 'b5b78d99-fc9c-47ed-868b-43b53540084d', 'email', 'aria_patel_404@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '0c29f400-9c0f-4d6c-aa30-677b7b02b2ba',
  '4f1b122b-80a5-4e2c-bf15-c0eeb3aadefb',
  '4f1b122b-80a5-4e2c-bf15-c0eeb3aadefb',
  json_build_object('sub', '4f1b122b-80a5-4e2c-bf15-c0eeb3aadefb', 'email', 'ava_tiwari_560@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '12446ece-e84b-4439-b557-085da5a5ff76',
  'f8485af8-1c51-48de-a54d-0534b0a68590',
  'f8485af8-1c51-48de-a54d-0534b0a68590',
  json_build_object('sub', 'f8485af8-1c51-48de-a54d-0534b0a68590', 'email', 'ava_roy_251@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '15e8371c-9e0a-4fe4-9fb0-4049266cd061',
  'cd0a0ff4-4c4f-4954-b47c-3f5252e028e8',
  'cd0a0ff4-4c4f-4954-b47c-3f5252e028e8',
  json_build_object('sub', 'cd0a0ff4-4c4f-4954-b47c-3f5252e028e8', 'email', 'vihaan_miller_337@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'a26b1762-c0c4-4057-af35-2eb1cafcb612',
  '3b2989ad-e761-413a-a646-a58b2a45c4a2',
  '3b2989ad-e761-413a-a646-a58b2a45c4a2',
  json_build_object('sub', '3b2989ad-e761-413a-a646-a58b2a45c4a2', 'email', 'anjali_martinez_942@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '6c47254d-dd11-4776-8818-db06c32ba932',
  '3779cf13-913b-486c-81e3-5a2e3f6dc2dc',
  '3779cf13-913b-486c-81e3-5a2e3f6dc2dc',
  json_build_object('sub', '3779cf13-913b-486c-81e3-5a2e3f6dc2dc', 'email', 'vihaan_taylor_356@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'bdea67fb-b120-4fd1-8a6c-e2d4b28cbe56',
  '2634b114-a608-47d2-85e6-b6ef38cb2239',
  '2634b114-a608-47d2-85e6-b6ef38cb2239',
  json_build_object('sub', '2634b114-a608-47d2-85e6-b6ef38cb2239', 'email', 'sanjay_martinez_681@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '76f7cf5f-27ec-40a0-b9a1-b8c543b60690',
  '299e7c9a-3313-4171-95b1-cda414660120',
  '299e7c9a-3313-4171-95b1-cda414660120',
  json_build_object('sub', '299e7c9a-3313-4171-95b1-cda414660120', 'email', 'riya_martinez_965@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '2bc261c5-ab7e-4e86-b7dc-4ec6e4efc553',
  '5149d476-5bc5-4a82-952f-89a86908893b',
  '5149d476-5bc5-4a82-952f-89a86908893b',
  json_build_object('sub', '5149d476-5bc5-4a82-952f-89a86908893b', 'email', 'sophia_nair_967@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'eee11bee-e54c-457b-b512-a72bd132d841',
  '91017b7c-8270-49a4-bbbe-9aecaecdddda',
  '91017b7c-8270-49a4-bbbe-9aecaecdddda',
  json_build_object('sub', '91017b7c-8270-49a4-bbbe-9aecaecdddda', 'email', 'rohan_williams_430@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '8c0837bc-c120-47ca-ab9e-d040a166299b',
  '5f2b98bf-e220-4342-909c-4f4f43f85ec9',
  '5f2b98bf-e220-4342-909c-4f4f43f85ec9',
  json_build_object('sub', '5f2b98bf-e220-4342-909c-4f4f43f85ec9', 'email', 'kavya_mehta_966@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'b06aa864-b4eb-44fb-b8ba-d0cf9d0c77cc',
  'c426afcf-81b5-41a2-ba3c-07c29e0d7312',
  'c426afcf-81b5-41a2-ba3c-07c29e0d7312',
  json_build_object('sub', 'c426afcf-81b5-41a2-ba3c-07c29e0d7312', 'email', 'sanjay_mehta_818@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'f3daa824-b7ec-4a5d-a527-94f1b0f58a84',
  '43535e33-49b8-4b39-b81a-47c6a9d5623a',
  '43535e33-49b8-4b39-b81a-47c6a9d5623a',
  json_build_object('sub', '43535e33-49b8-4b39-b81a-47c6a9d5623a', 'email', 'kabir_shukla_670@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '8e26268b-0b04-4ea6-b7e7-efbbd739152e',
  '963e77a1-01e6-45ea-ad06-3a37d6bd4818',
  '963e77a1-01e6-45ea-ad06-3a37d6bd4818',
  json_build_object('sub', '963e77a1-01e6-45ea-ad06-3a37d6bd4818', 'email', 'riya_mukherjee_396@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '6f06913b-9d04-4a33-b29b-7fcb01740c6d',
  'c0fc1b83-013c-4493-8a43-f6f8ffdc69ed',
  'c0fc1b83-013c-4493-8a43-f6f8ffdc69ed',
  json_build_object('sub', 'c0fc1b83-013c-4493-8a43-f6f8ffdc69ed', 'email', 'lucas_mehta_713@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  '204a0873-2cb8-4501-b013-e7feaa62f66e',
  '3216a0ca-4162-4b05-9d16-04890c77b70d',
  '3216a0ca-4162-4b05-9d16-04890c77b70d',
  json_build_object('sub', '3216a0ca-4162-4b05-9d16-04890c77b70d', 'email', 'manish_smith_661@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'd0219a17-a28d-4db5-a2da-a7a7186daecb',
  'e8019784-d494-460f-a4f0-f859a5542275',
  'e8019784-d494-460f-a4f0-f859a5542275',
  json_build_object('sub', 'e8019784-d494-460f-a4f0-f859a5542275', 'email', 'pooja_garcia_628@google.com', 'email_verified', true, 'phone_verified', false),
  'email',
  now(),
  now(),
  now()
);

-- 5. UPDATES FOR public.profiles

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2028',
  academic_credits = 48,
  leetcode_username = 'ananya_banerjee_976_lc',
  codeforces_username = 'ananya_banerjee_976_cf',
  codechef_username = 'ananya_banerjee_976_cc',
  github_url = 'https://github.com/ananya_banerjee_976',
  linkedin_url = 'https://linkedin.com/in/ananya_banerjee_976',
  portfolio_url = 'https://ananya_banerjee_976.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'de203ca4-b433-4597-849e-12a764616397';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2028',
  academic_credits = 21,
  leetcode_username = 'jackson_bose_802_lc',
  codeforces_username = 'jackson_bose_802_cf',
  codechef_username = 'jackson_bose_802_cc',
  github_url = 'https://github.com/jackson_bose_802',
  linkedin_url = 'https://linkedin.com/in/jackson_bose_802',
  portfolio_url = 'https://jackson_bose_802.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '057017fd-99e7-451c-b16b-8df254aeca2e';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2026',
  academic_credits = 40,
  leetcode_username = 'anjali_singh_354_lc',
  codeforces_username = 'anjali_singh_354_cf',
  codechef_username = 'anjali_singh_354_cc',
  github_url = 'https://github.com/anjali_singh_354',
  linkedin_url = 'https://linkedin.com/in/anjali_singh_354',
  portfolio_url = 'https://anjali_singh_354.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '6d6a6c33-299c-4f5e-9ef9-a0b7a925c776';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2026',
  academic_credits = 37,
  leetcode_username = 'siddharth_johnson_274_lc',
  codeforces_username = 'siddharth_johnson_274_cf',
  codechef_username = 'siddharth_johnson_274_cc',
  github_url = 'https://github.com/siddharth_johnson_274',
  linkedin_url = 'https://linkedin.com/in/siddharth_johnson_274',
  portfolio_url = 'https://siddharth_johnson_274.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '301c7b99-3e14-46a2-9cf4-ff4209a59f31';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2028',
  academic_credits = 17,
  leetcode_username = 'rohan_thomas_806_lc',
  codeforces_username = 'rohan_thomas_806_cf',
  codechef_username = 'rohan_thomas_806_cc',
  github_url = 'https://github.com/rohan_thomas_806',
  linkedin_url = 'https://linkedin.com/in/rohan_thomas_806',
  portfolio_url = 'https://rohan_thomas_806.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'b93d52ac-a6bb-4fc5-ad7a-0207b35543a3';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2027',
  academic_credits = 32,
  leetcode_username = 'rahul_patel_873_lc',
  codeforces_username = 'rahul_patel_873_cf',
  codechef_username = 'rahul_patel_873_cc',
  github_url = 'https://github.com/rahul_patel_873',
  linkedin_url = 'https://linkedin.com/in/rahul_patel_873',
  portfolio_url = 'https://rahul_patel_873.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '1423b79b-9a21-4ca4-804f-d127b179d51d';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2026',
  academic_credits = 55,
  leetcode_username = 'shruti_kumar_426_lc',
  codeforces_username = 'shruti_kumar_426_cf',
  codechef_username = 'shruti_kumar_426_cc',
  github_url = 'https://github.com/shruti_kumar_426',
  linkedin_url = 'https://linkedin.com/in/shruti_kumar_426',
  portfolio_url = 'https://shruti_kumar_426.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '0284bfc1-a659-4dc0-aba4-526e355f9621';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2026',
  academic_credits = 26,
  leetcode_username = 'ananya_miller_977_lc',
  codeforces_username = 'ananya_miller_977_cf',
  codechef_username = 'ananya_miller_977_cc',
  github_url = 'https://github.com/ananya_miller_977',
  linkedin_url = 'https://linkedin.com/in/ananya_miller_977',
  portfolio_url = 'https://ananya_miller_977.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'a6411e62-5197-4c59-8c0e-e26e594da741';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2027',
  academic_credits = 29,
  leetcode_username = 'meera_adhikari_638_lc',
  codeforces_username = 'meera_adhikari_638_cf',
  codechef_username = 'meera_adhikari_638_cc',
  github_url = 'https://github.com/meera_adhikari_638',
  linkedin_url = 'https://linkedin.com/in/meera_adhikari_638',
  portfolio_url = 'https://meera_adhikari_638.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '0e58f79f-3ec7-4439-938a-51898cf1893d';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2029',
  academic_credits = 26,
  leetcode_username = 'sid_joshi_919_lc',
  codeforces_username = 'sid_joshi_919_cf',
  codechef_username = 'sid_joshi_919_cc',
  github_url = 'https://github.com/sid_joshi_919',
  linkedin_url = 'https://linkedin.com/in/sid_joshi_919',
  portfolio_url = 'https://sid_joshi_919.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '4c6d7311-1284-4938-8408-0f499a059ed7';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2026',
  academic_credits = 33,
  leetcode_username = 'anjali_brown_168_lc',
  codeforces_username = 'anjali_brown_168_cf',
  codechef_username = 'anjali_brown_168_cc',
  github_url = 'https://github.com/anjali_brown_168',
  linkedin_url = 'https://linkedin.com/in/anjali_brown_168',
  portfolio_url = 'https://anjali_brown_168.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '95e19cc5-42d9-4221-afa1-f610595887ae';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2026',
  academic_credits = 34,
  leetcode_username = 'olivia_verma_515_lc',
  codeforces_username = 'olivia_verma_515_cf',
  codechef_username = 'olivia_verma_515_cc',
  github_url = 'https://github.com/olivia_verma_515',
  linkedin_url = 'https://linkedin.com/in/olivia_verma_515',
  portfolio_url = 'https://olivia_verma_515.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '267a55d6-1591-428c-a57f-7e2aa7c4fca7';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2026',
  academic_credits = 28,
  leetcode_username = 'anjali_adhikari_320_lc',
  codeforces_username = 'anjali_adhikari_320_cf',
  codechef_username = 'anjali_adhikari_320_cc',
  github_url = 'https://github.com/anjali_adhikari_320',
  linkedin_url = 'https://linkedin.com/in/anjali_adhikari_320',
  portfolio_url = 'https://anjali_adhikari_320.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '607325d1-5524-4b08-aab8-48d213e99226';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2027',
  academic_credits = 43,
  leetcode_username = 'ananya_kar_781_lc',
  codeforces_username = 'ananya_kar_781_cf',
  codechef_username = 'ananya_kar_781_cc',
  github_url = 'https://github.com/ananya_kar_781',
  linkedin_url = 'https://linkedin.com/in/ananya_kar_781',
  portfolio_url = 'https://ananya_kar_781.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'b132ad17-791a-4ffb-99c3-41dd1ccbc012';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2026',
  academic_credits = 41,
  leetcode_username = 'priya_davis_616_lc',
  codeforces_username = 'priya_davis_616_cf',
  codechef_username = 'priya_davis_616_cc',
  github_url = 'https://github.com/priya_davis_616',
  linkedin_url = 'https://linkedin.com/in/priya_davis_616',
  portfolio_url = 'https://priya_davis_616.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '25221ec5-1204-4cc9-9a35-c733588504dd';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2027',
  academic_credits = 41,
  leetcode_username = 'swati_hernandez_814_lc',
  codeforces_username = 'swati_hernandez_814_cf',
  codechef_username = 'swati_hernandez_814_cc',
  github_url = 'https://github.com/swati_hernandez_814',
  linkedin_url = 'https://linkedin.com/in/swati_hernandez_814',
  portfolio_url = 'https://swati_hernandez_814.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'cff96260-921e-44da-b61e-6d1532051767';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2027',
  academic_credits = 46,
  leetcode_username = 'rohan_sen_247_lc',
  codeforces_username = 'rohan_sen_247_cf',
  codechef_username = 'rohan_sen_247_cc',
  github_url = 'https://github.com/rohan_sen_247',
  linkedin_url = 'https://linkedin.com/in/rohan_sen_247',
  portfolio_url = 'https://rohan_sen_247.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '3920a136-84ce-4882-b959-3f4e1364138f';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2029',
  academic_credits = 14,
  leetcode_username = 'kabir_adhikari_975_lc',
  codeforces_username = 'kabir_adhikari_975_cf',
  codechef_username = 'kabir_adhikari_975_cc',
  github_url = 'https://github.com/kabir_adhikari_975',
  linkedin_url = 'https://linkedin.com/in/kabir_adhikari_975',
  portfolio_url = 'https://kabir_adhikari_975.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '3bbb2cf7-1ff8-4476-bc40-438341f3dc18';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2026',
  academic_credits = 31,
  leetcode_username = 'amit_wilson_375_lc',
  codeforces_username = 'amit_wilson_375_cf',
  codechef_username = 'amit_wilson_375_cc',
  github_url = 'https://github.com/amit_wilson_375',
  linkedin_url = 'https://linkedin.com/in/amit_wilson_375',
  portfolio_url = 'https://amit_wilson_375.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'b7fded5b-75ec-49bd-94f9-4f746e7597e6';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2026',
  academic_credits = 44,
  leetcode_username = 'swati_banerjee_106_lc',
  codeforces_username = 'swati_banerjee_106_cf',
  codechef_username = 'swati_banerjee_106_cc',
  github_url = 'https://github.com/swati_banerjee_106',
  linkedin_url = 'https://linkedin.com/in/swati_banerjee_106',
  portfolio_url = 'https://swati_banerjee_106.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'b314a286-5058-4adc-bc38-5f643bc264fb';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2026',
  academic_credits = 39,
  leetcode_username = 'manish_wilson_893_lc',
  codeforces_username = 'manish_wilson_893_cf',
  codechef_username = 'manish_wilson_893_cc',
  github_url = 'https://github.com/manish_wilson_893',
  linkedin_url = 'https://linkedin.com/in/manish_wilson_893',
  portfolio_url = 'https://manish_wilson_893.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '9de3e07a-915d-455d-aa04-b660bf332ceb';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2029',
  academic_credits = 10,
  leetcode_username = 'lucas_singh_344_lc',
  codeforces_username = 'lucas_singh_344_cf',
  codechef_username = 'lucas_singh_344_cc',
  github_url = 'https://github.com/lucas_singh_344',
  linkedin_url = 'https://linkedin.com/in/lucas_singh_344',
  portfolio_url = 'https://lucas_singh_344.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '75f38357-afee-43c7-9655-2ac4e87dfe28';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2027',
  academic_credits = 48,
  leetcode_username = 'karan_hernandez_630_lc',
  codeforces_username = 'karan_hernandez_630_cf',
  codechef_username = 'karan_hernandez_630_cc',
  github_url = 'https://github.com/karan_hernandez_630',
  linkedin_url = 'https://linkedin.com/in/karan_hernandez_630',
  portfolio_url = 'https://karan_hernandez_630.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '67d439b3-b238-4ab0-a0a8-f3d06d143ebe';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2028',
  academic_credits = 20,
  leetcode_username = 'ethan_johnson_680_lc',
  codeforces_username = 'ethan_johnson_680_cf',
  codechef_username = 'ethan_johnson_680_cc',
  github_url = 'https://github.com/ethan_johnson_680',
  linkedin_url = 'https://linkedin.com/in/ethan_johnson_680',
  portfolio_url = 'https://ethan_johnson_680.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '1eee22f4-4309-459a-92e6-857ed9e2ea3c';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2029',
  academic_credits = 58,
  leetcode_username = 'dev_rao_311_lc',
  codeforces_username = 'dev_rao_311_cf',
  codechef_username = 'dev_rao_311_cc',
  github_url = 'https://github.com/dev_rao_311',
  linkedin_url = 'https://linkedin.com/in/dev_rao_311',
  portfolio_url = 'https://dev_rao_311.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'a5fa3c63-40c3-4a76-a217-13966be758ef';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2026',
  academic_credits = 35,
  leetcode_username = 'sophia_roy_174_lc',
  codeforces_username = 'sophia_roy_174_cf',
  codechef_username = 'sophia_roy_174_cc',
  github_url = 'https://github.com/sophia_roy_174',
  linkedin_url = 'https://linkedin.com/in/sophia_roy_174',
  portfolio_url = 'https://sophia_roy_174.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '559932ca-430f-4671-b42d-2e076cb68f84';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2028',
  academic_credits = 19,
  leetcode_username = 'swati_iyer_895_lc',
  codeforces_username = 'swati_iyer_895_cf',
  codechef_username = 'swati_iyer_895_cc',
  github_url = 'https://github.com/swati_iyer_895',
  linkedin_url = 'https://linkedin.com/in/swati_iyer_895',
  portfolio_url = 'https://swati_iyer_895.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '59db6c4b-edb7-44c6-ae1e-9dcd9dbcf1b9';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2027',
  academic_credits = 37,
  leetcode_username = 'olivia_taylor_626_lc',
  codeforces_username = 'olivia_taylor_626_cf',
  codechef_username = 'olivia_taylor_626_cc',
  github_url = 'https://github.com/olivia_taylor_626',
  linkedin_url = 'https://linkedin.com/in/olivia_taylor_626',
  portfolio_url = 'https://olivia_taylor_626.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '95085393-246a-47b8-9b3b-0794a471b1e1';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2026',
  academic_credits = 42,
  leetcode_username = 'karan_martinez_442_lc',
  codeforces_username = 'karan_martinez_442_cf',
  codechef_username = 'karan_martinez_442_cc',
  github_url = 'https://github.com/karan_martinez_442',
  linkedin_url = 'https://linkedin.com/in/karan_martinez_442',
  portfolio_url = 'https://karan_martinez_442.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '69eadeaa-44cc-407b-8dbd-aba56a37f377';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2026',
  academic_credits = 16,
  leetcode_username = 'shruti_martinez_380_lc',
  codeforces_username = 'shruti_martinez_380_cf',
  codechef_username = 'shruti_martinez_380_cc',
  github_url = 'https://github.com/shruti_martinez_380',
  linkedin_url = 'https://linkedin.com/in/shruti_martinez_380',
  portfolio_url = 'https://shruti_martinez_380.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'bd4398ff-6965-4f78-82e0-3a8e5bff6c2b';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2029',
  academic_credits = 15,
  leetcode_username = 'arjun_sarkar_707_lc',
  codeforces_username = 'arjun_sarkar_707_cf',
  codechef_username = 'arjun_sarkar_707_cc',
  github_url = 'https://github.com/arjun_sarkar_707',
  linkedin_url = 'https://linkedin.com/in/arjun_sarkar_707',
  portfolio_url = 'https://arjun_sarkar_707.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'efa23374-8ee8-4683-85ef-012287bd5001';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2029',
  academic_credits = 34,
  leetcode_username = 'ethan_garcia_263_lc',
  codeforces_username = 'ethan_garcia_263_cf',
  codechef_username = 'ethan_garcia_263_cc',
  github_url = 'https://github.com/ethan_garcia_263',
  linkedin_url = 'https://linkedin.com/in/ethan_garcia_263',
  portfolio_url = 'https://ethan_garcia_263.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '0e94f1c3-d016-4eab-aeae-3231ef9d1c81';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2028',
  academic_credits = 18,
  leetcode_username = 'ananya_mishra_406_lc',
  codeforces_username = 'ananya_mishra_406_cf',
  codechef_username = 'ananya_mishra_406_cc',
  github_url = 'https://github.com/ananya_mishra_406',
  linkedin_url = 'https://linkedin.com/in/ananya_mishra_406',
  portfolio_url = 'https://ananya_mishra_406.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'ea7ecb5d-7578-44d2-a160-64829262b745';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2029',
  academic_credits = 24,
  leetcode_username = 'pranav_roy_143_lc',
  codeforces_username = 'pranav_roy_143_cf',
  codechef_username = 'pranav_roy_143_cc',
  github_url = 'https://github.com/pranav_roy_143',
  linkedin_url = 'https://linkedin.com/in/pranav_roy_143',
  portfolio_url = 'https://pranav_roy_143.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '0c1b1494-2389-4c6f-aa6b-0bcdd0589e2a';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2029',
  academic_credits = 40,
  leetcode_username = 'tanvi_dutta_576_lc',
  codeforces_username = 'tanvi_dutta_576_cf',
  codechef_username = 'tanvi_dutta_576_cc',
  github_url = 'https://github.com/tanvi_dutta_576',
  linkedin_url = 'https://linkedin.com/in/tanvi_dutta_576',
  portfolio_url = 'https://tanvi_dutta_576.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '2b52fd88-c7e9-4d2c-8c64-a47fa3148c39';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2029',
  academic_credits = 26,
  leetcode_username = 'divya_tiwari_491_lc',
  codeforces_username = 'divya_tiwari_491_cf',
  codechef_username = 'divya_tiwari_491_cc',
  github_url = 'https://github.com/divya_tiwari_491',
  linkedin_url = 'https://linkedin.com/in/divya_tiwari_491',
  portfolio_url = 'https://divya_tiwari_491.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'b3e3c802-1e80-4a79-8e54-9336b9c1be2a';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2026',
  academic_credits = 50,
  leetcode_username = 'sid_singh_814_lc',
  codeforces_username = 'sid_singh_814_cf',
  codechef_username = 'sid_singh_814_cc',
  github_url = 'https://github.com/sid_singh_814',
  linkedin_url = 'https://linkedin.com/in/sid_singh_814',
  portfolio_url = 'https://sid_singh_814.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '2deac984-5394-4152-9ca0-ce739e6bc91d';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2026',
  academic_credits = 25,
  leetcode_username = 'noah_johnson_457_lc',
  codeforces_username = 'noah_johnson_457_cf',
  codechef_username = 'noah_johnson_457_cc',
  github_url = 'https://github.com/noah_johnson_457',
  linkedin_url = 'https://linkedin.com/in/noah_johnson_457',
  portfolio_url = 'https://noah_johnson_457.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '980a178b-6adf-4e67-b8a4-e60819ba18be';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2026',
  academic_credits = 51,
  leetcode_username = 'karan_taylor_980_lc',
  codeforces_username = 'karan_taylor_980_cf',
  codechef_username = 'karan_taylor_980_cc',
  github_url = 'https://github.com/karan_taylor_980',
  linkedin_url = 'https://linkedin.com/in/karan_taylor_980',
  portfolio_url = 'https://karan_taylor_980.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '86de7fed-2a87-4389-aa55-5130a17f6652';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2029',
  academic_credits = 41,
  leetcode_username = 'isabella_dutta_940_lc',
  codeforces_username = 'isabella_dutta_940_cf',
  codechef_username = 'isabella_dutta_940_cc',
  github_url = 'https://github.com/isabella_dutta_940',
  linkedin_url = 'https://linkedin.com/in/isabella_dutta_940',
  portfolio_url = 'https://isabella_dutta_940.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '29cce4ac-5fdf-4136-b754-7db5fad6ad8f';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2027',
  academic_credits = 16,
  leetcode_username = 'rohan_pandey_112_lc',
  codeforces_username = 'rohan_pandey_112_cf',
  codechef_username = 'rohan_pandey_112_cc',
  github_url = 'https://github.com/rohan_pandey_112',
  linkedin_url = 'https://linkedin.com/in/rohan_pandey_112',
  portfolio_url = 'https://rohan_pandey_112.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '8bcaf745-3384-4c8d-a199-b78bb661b9a8';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2026',
  academic_credits = 16,
  leetcode_username = 'swati_garcia_619_lc',
  codeforces_username = 'swati_garcia_619_cf',
  codechef_username = 'swati_garcia_619_cc',
  github_url = 'https://github.com/swati_garcia_619',
  linkedin_url = 'https://linkedin.com/in/swati_garcia_619',
  portfolio_url = 'https://swati_garcia_619.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '37e1dfc7-927f-43f6-9cf6-af9c7d37eb5c';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2026',
  academic_credits = 41,
  leetcode_username = 'noah_iyer_406_lc',
  codeforces_username = 'noah_iyer_406_cf',
  codechef_username = 'noah_iyer_406_cc',
  github_url = 'https://github.com/noah_iyer_406',
  linkedin_url = 'https://linkedin.com/in/noah_iyer_406',
  portfolio_url = 'https://noah_iyer_406.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'fe273d9a-3f0b-4cc6-affc-b9373e025dd5';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2027',
  academic_credits = 17,
  leetcode_username = 'sanjay_roy_322_lc',
  codeforces_username = 'sanjay_roy_322_cf',
  codechef_username = 'sanjay_roy_322_cc',
  github_url = 'https://github.com/sanjay_roy_322',
  linkedin_url = 'https://linkedin.com/in/sanjay_roy_322',
  portfolio_url = 'https://sanjay_roy_322.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '919ce9e5-f66b-4c18-a592-7733f4a99b40';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2026',
  academic_credits = 14,
  leetcode_username = 'sid_sarkar_518_lc',
  codeforces_username = 'sid_sarkar_518_cf',
  codechef_username = 'sid_sarkar_518_cc',
  github_url = 'https://github.com/sid_sarkar_518',
  linkedin_url = 'https://linkedin.com/in/sid_sarkar_518',
  portfolio_url = 'https://sid_sarkar_518.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '045b5126-682e-4daf-b26c-46fd29a505d5';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2027',
  academic_credits = 54,
  leetcode_username = 'siddharth_sen_171_lc',
  codeforces_username = 'siddharth_sen_171_cf',
  codechef_username = 'siddharth_sen_171_cc',
  github_url = 'https://github.com/siddharth_sen_171',
  linkedin_url = 'https://linkedin.com/in/siddharth_sen_171',
  portfolio_url = 'https://siddharth_sen_171.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'f42860a5-ba9d-40b2-97db-223eb6a826dc';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2027',
  academic_credits = 48,
  leetcode_username = 'lucas_mukherjee_798_lc',
  codeforces_username = 'lucas_mukherjee_798_cf',
  codechef_username = 'lucas_mukherjee_798_cc',
  github_url = 'https://github.com/lucas_mukherjee_798',
  linkedin_url = 'https://linkedin.com/in/lucas_mukherjee_798',
  portfolio_url = 'https://lucas_mukherjee_798.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '081d7987-d305-44f7-91ed-bb9f71701fcf';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2028',
  academic_credits = 42,
  leetcode_username = 'karan_bose_608_lc',
  codeforces_username = 'karan_bose_608_cf',
  codechef_username = 'karan_bose_608_cc',
  github_url = 'https://github.com/karan_bose_608',
  linkedin_url = 'https://linkedin.com/in/karan_bose_608',
  portfolio_url = 'https://karan_bose_608.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'e7ede99d-6d21-44ea-a787-d95f0decbb02';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2029',
  academic_credits = 21,
  leetcode_username = 'vihaan_garcia_971_lc',
  codeforces_username = 'vihaan_garcia_971_cf',
  codechef_username = 'vihaan_garcia_971_cc',
  github_url = 'https://github.com/vihaan_garcia_971',
  linkedin_url = 'https://linkedin.com/in/vihaan_garcia_971',
  portfolio_url = 'https://vihaan_garcia_971.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '5d63dcbc-86dd-4751-a9c3-3dd3cf4d310a';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2029',
  academic_credits = 13,
  leetcode_username = 'meera_tripathi_455_lc',
  codeforces_username = 'meera_tripathi_455_cf',
  codechef_username = 'meera_tripathi_455_cc',
  github_url = 'https://github.com/meera_tripathi_455',
  linkedin_url = 'https://linkedin.com/in/meera_tripathi_455',
  portfolio_url = 'https://meera_tripathi_455.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'b756ab2f-e8f0-415e-9f6a-3d4ef282e084';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2029',
  academic_credits = 29,
  leetcode_username = 'ethan_martinez_363_lc',
  codeforces_username = 'ethan_martinez_363_cf',
  codechef_username = 'ethan_martinez_363_cc',
  github_url = 'https://github.com/ethan_martinez_363',
  linkedin_url = 'https://linkedin.com/in/ethan_martinez_363',
  portfolio_url = 'https://ethan_martinez_363.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '9dd545fc-f588-4246-9f79-5d8573eb46c7';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2029',
  academic_credits = 56,
  leetcode_username = 'akash_singh_726_lc',
  codeforces_username = 'akash_singh_726_cf',
  codechef_username = 'akash_singh_726_cc',
  github_url = 'https://github.com/akash_singh_726',
  linkedin_url = 'https://linkedin.com/in/akash_singh_726',
  portfolio_url = 'https://akash_singh_726.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '6fd92abd-1a8f-49a4-8099-24f3f1ae4eb1';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2028',
  academic_credits = 10,
  leetcode_username = 'pranav_gupta_477_lc',
  codeforces_username = 'pranav_gupta_477_cf',
  codechef_username = 'pranav_gupta_477_cc',
  github_url = 'https://github.com/pranav_gupta_477',
  linkedin_url = 'https://linkedin.com/in/pranav_gupta_477',
  portfolio_url = 'https://pranav_gupta_477.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'ee05c733-2217-4f49-8949-3aff36b19d0a';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2029',
  academic_credits = 52,
  leetcode_username = 'pooja_ghosh_425_lc',
  codeforces_username = 'pooja_ghosh_425_cf',
  codechef_username = 'pooja_ghosh_425_cc',
  github_url = 'https://github.com/pooja_ghosh_425',
  linkedin_url = 'https://linkedin.com/in/pooja_ghosh_425',
  portfolio_url = 'https://pooja_ghosh_425.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '8ac8badf-66de-4b85-9c31-fed1b0f68b9f';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2028',
  academic_credits = 34,
  leetcode_username = 'shruti_tiwari_119_lc',
  codeforces_username = 'shruti_tiwari_119_cf',
  codechef_username = 'shruti_tiwari_119_cc',
  github_url = 'https://github.com/shruti_tiwari_119',
  linkedin_url = 'https://linkedin.com/in/shruti_tiwari_119',
  portfolio_url = 'https://shruti_tiwari_119.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'a58d7ab6-056e-4093-a229-3a4fd8d253fc';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2028',
  academic_credits = 56,
  leetcode_username = 'lucas_garcia_723_lc',
  codeforces_username = 'lucas_garcia_723_cf',
  codechef_username = 'lucas_garcia_723_cc',
  github_url = 'https://github.com/lucas_garcia_723',
  linkedin_url = 'https://linkedin.com/in/lucas_garcia_723',
  portfolio_url = 'https://lucas_garcia_723.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '65f6b48c-f01f-4d88-997c-0d0044a3342c';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2027',
  academic_credits = 48,
  leetcode_username = 'dev_anderson_888_lc',
  codeforces_username = 'dev_anderson_888_cf',
  codechef_username = 'dev_anderson_888_cc',
  github_url = 'https://github.com/dev_anderson_888',
  linkedin_url = 'https://linkedin.com/in/dev_anderson_888',
  portfolio_url = 'https://dev_anderson_888.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'd3ea2221-cc76-4556-b5fe-b966c89b9946';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2028',
  academic_credits = 37,
  leetcode_username = 'kabir_mehta_239_lc',
  codeforces_username = 'kabir_mehta_239_cf',
  codechef_username = 'kabir_mehta_239_cc',
  github_url = 'https://github.com/kabir_mehta_239',
  linkedin_url = 'https://linkedin.com/in/kabir_mehta_239',
  portfolio_url = 'https://kabir_mehta_239.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '73a48b37-e39d-429a-940f-458f3f8b3a9c';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2026',
  academic_credits = 36,
  leetcode_username = 'arjun_taylor_285_lc',
  codeforces_username = 'arjun_taylor_285_cf',
  codechef_username = 'arjun_taylor_285_cc',
  github_url = 'https://github.com/arjun_taylor_285',
  linkedin_url = 'https://linkedin.com/in/arjun_taylor_285',
  portfolio_url = 'https://arjun_taylor_285.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '1200fcf8-0034-4a17-a537-f4ddc214af40';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2029',
  academic_credits = 48,
  leetcode_username = 'rahul_wilson_455_lc',
  codeforces_username = 'rahul_wilson_455_cf',
  codechef_username = 'rahul_wilson_455_cc',
  github_url = 'https://github.com/rahul_wilson_455',
  linkedin_url = 'https://linkedin.com/in/rahul_wilson_455',
  portfolio_url = 'https://rahul_wilson_455.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'cd3c6db0-85fe-41ea-a56a-124f87006c42';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2026',
  academic_credits = 48,
  leetcode_username = 'ananya_banerjee_829_lc',
  codeforces_username = 'ananya_banerjee_829_cf',
  codechef_username = 'ananya_banerjee_829_cc',
  github_url = 'https://github.com/ananya_banerjee_829',
  linkedin_url = 'https://linkedin.com/in/ananya_banerjee_829',
  portfolio_url = 'https://ananya_banerjee_829.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'f01eba52-e33c-4e69-aab9-1464380f76aa';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2026',
  academic_credits = 41,
  leetcode_username = 'aishwarya_ray_895_lc',
  codeforces_username = 'aishwarya_ray_895_cf',
  codechef_username = 'aishwarya_ray_895_cc',
  github_url = 'https://github.com/aishwarya_ray_895',
  linkedin_url = 'https://linkedin.com/in/aishwarya_ray_895',
  portfolio_url = 'https://aishwarya_ray_895.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '44650983-6d09-440e-9dfd-5132fb87f689';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2029',
  academic_credits = 34,
  leetcode_username = 'sanjay_reddy_453_lc',
  codeforces_username = 'sanjay_reddy_453_cf',
  codechef_username = 'sanjay_reddy_453_cc',
  github_url = 'https://github.com/sanjay_reddy_453',
  linkedin_url = 'https://linkedin.com/in/sanjay_reddy_453',
  portfolio_url = 'https://sanjay_reddy_453.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '6096b819-0e38-44f1-b872-76defe3903e8';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2027',
  academic_credits = 16,
  leetcode_username = 'pooja_rao_616_lc',
  codeforces_username = 'pooja_rao_616_cf',
  codechef_username = 'pooja_rao_616_cc',
  github_url = 'https://github.com/pooja_rao_616',
  linkedin_url = 'https://linkedin.com/in/pooja_rao_616',
  portfolio_url = 'https://pooja_rao_616.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'd63410e9-35b5-4885-a3da-8562c9377d29';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2028',
  academic_credits = 28,
  leetcode_username = 'shruti_sen_451_lc',
  codeforces_username = 'shruti_sen_451_cf',
  codechef_username = 'shruti_sen_451_cc',
  github_url = 'https://github.com/shruti_sen_451',
  linkedin_url = 'https://linkedin.com/in/shruti_sen_451',
  portfolio_url = 'https://shruti_sen_451.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '5146b688-a6d1-4432-954f-507756babf22';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2028',
  academic_credits = 48,
  leetcode_username = 'anjali_nair_583_lc',
  codeforces_username = 'anjali_nair_583_cf',
  codechef_username = 'anjali_nair_583_cc',
  github_url = 'https://github.com/anjali_nair_583',
  linkedin_url = 'https://linkedin.com/in/anjali_nair_583',
  portfolio_url = 'https://anjali_nair_583.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '9d6d989a-ef0a-43a0-8ada-eb804c205ee6';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2027',
  academic_credits = 11,
  leetcode_username = 'liam_mukherjee_548_lc',
  codeforces_username = 'liam_mukherjee_548_cf',
  codechef_username = 'liam_mukherjee_548_cc',
  github_url = 'https://github.com/liam_mukherjee_548',
  linkedin_url = 'https://linkedin.com/in/liam_mukherjee_548',
  portfolio_url = 'https://liam_mukherjee_548.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'dd36e51a-942b-4c8f-9309-355fa17d2310';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2027',
  academic_credits = 21,
  leetcode_username = 'lucas_miller_359_lc',
  codeforces_username = 'lucas_miller_359_cf',
  codechef_username = 'lucas_miller_359_cc',
  github_url = 'https://github.com/lucas_miller_359',
  linkedin_url = 'https://linkedin.com/in/lucas_miller_359',
  portfolio_url = 'https://lucas_miller_359.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '3833faf8-063f-414f-87f9-7942fb11c672';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2026',
  academic_credits = 14,
  leetcode_username = 'sophia_shukla_782_lc',
  codeforces_username = 'sophia_shukla_782_cf',
  codechef_username = 'sophia_shukla_782_cc',
  github_url = 'https://github.com/sophia_shukla_782',
  linkedin_url = 'https://linkedin.com/in/sophia_shukla_782',
  portfolio_url = 'https://sophia_shukla_782.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'e437ee61-f2f9-49f7-ad7d-a887695907a3';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2026',
  academic_credits = 36,
  leetcode_username = 'riya_patel_609_lc',
  codeforces_username = 'riya_patel_609_cf',
  codechef_username = 'riya_patel_609_cc',
  github_url = 'https://github.com/riya_patel_609',
  linkedin_url = 'https://linkedin.com/in/riya_patel_609',
  portfolio_url = 'https://riya_patel_609.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '16a115a0-07df-46b4-ad52-ef24d63252be';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2028',
  academic_credits = 36,
  leetcode_username = 'neha_ray_370_lc',
  codeforces_username = 'neha_ray_370_cf',
  codechef_username = 'neha_ray_370_cc',
  github_url = 'https://github.com/neha_ray_370',
  linkedin_url = 'https://linkedin.com/in/neha_ray_370',
  portfolio_url = 'https://neha_ray_370.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'c9b9f5b9-84b2-4a4b-ad0d-b20def9c57b6';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2027',
  academic_credits = 19,
  leetcode_username = 'noah_das_363_lc',
  codeforces_username = 'noah_das_363_cf',
  codechef_username = 'noah_das_363_cc',
  github_url = 'https://github.com/noah_das_363',
  linkedin_url = 'https://linkedin.com/in/noah_das_363',
  portfolio_url = 'https://noah_das_363.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '0b64a469-0c8d-473a-b8cc-751db613e8ad';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2029',
  academic_credits = 39,
  leetcode_username = 'sanjana_dwivedi_771_lc',
  codeforces_username = 'sanjana_dwivedi_771_cf',
  codechef_username = 'sanjana_dwivedi_771_cc',
  github_url = 'https://github.com/sanjana_dwivedi_771',
  linkedin_url = 'https://linkedin.com/in/sanjana_dwivedi_771',
  portfolio_url = 'https://sanjana_dwivedi_771.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'f67db27d-4b42-4b6c-b2d4-1c0e515b796b';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2027',
  academic_credits = 10,
  leetcode_username = 'riya_mehta_566_lc',
  codeforces_username = 'riya_mehta_566_cf',
  codechef_username = 'riya_mehta_566_cc',
  github_url = 'https://github.com/riya_mehta_566',
  linkedin_url = 'https://linkedin.com/in/riya_mehta_566',
  portfolio_url = 'https://riya_mehta_566.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '0e8d7c15-18bf-401d-8307-6390c36338e0';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2028',
  academic_credits = 51,
  leetcode_username = 'aishwarya_brown_716_lc',
  codeforces_username = 'aishwarya_brown_716_cf',
  codechef_username = 'aishwarya_brown_716_cc',
  github_url = 'https://github.com/aishwarya_brown_716',
  linkedin_url = 'https://linkedin.com/in/aishwarya_brown_716',
  portfolio_url = 'https://aishwarya_brown_716.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '2fc7fd0e-8866-4002-bae2-3d7cbedcfc60';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2026',
  academic_credits = 36,
  leetcode_username = 'aarav_mehta_449_lc',
  codeforces_username = 'aarav_mehta_449_cf',
  codechef_username = 'aarav_mehta_449_cc',
  github_url = 'https://github.com/aarav_mehta_449',
  linkedin_url = 'https://linkedin.com/in/aarav_mehta_449',
  portfolio_url = 'https://aarav_mehta_449.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '2f20b565-ad60-4e1c-bb1c-4a3d162a214c';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2026',
  academic_credits = 20,
  leetcode_username = 'siddharth_kumar_922_lc',
  codeforces_username = 'siddharth_kumar_922_cf',
  codechef_username = 'siddharth_kumar_922_cc',
  github_url = 'https://github.com/siddharth_kumar_922',
  linkedin_url = 'https://linkedin.com/in/siddharth_kumar_922',
  portfolio_url = 'https://siddharth_kumar_922.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '6951a168-02cf-4f7b-8267-3ad8a9ffb85f';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2029',
  academic_credits = 15,
  leetcode_username = 'sanjana_shukla_650_lc',
  codeforces_username = 'sanjana_shukla_650_cf',
  codechef_username = 'sanjana_shukla_650_cc',
  github_url = 'https://github.com/sanjana_shukla_650',
  linkedin_url = 'https://linkedin.com/in/sanjana_shukla_650',
  portfolio_url = 'https://sanjana_shukla_650.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'bc9d88f8-7a89-4981-9106-798e997cccf1';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2026',
  academic_credits = 41,
  leetcode_username = 'aria_johnson_309_lc',
  codeforces_username = 'aria_johnson_309_cf',
  codechef_username = 'aria_johnson_309_cc',
  github_url = 'https://github.com/aria_johnson_309',
  linkedin_url = 'https://linkedin.com/in/aria_johnson_309',
  portfolio_url = 'https://aria_johnson_309.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'aabb975e-909a-4fcb-a36c-a9e17a31a7a8';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2028',
  academic_credits = 14,
  leetcode_username = 'rohan_rodriguez_326_lc',
  codeforces_username = 'rohan_rodriguez_326_cf',
  codechef_username = 'rohan_rodriguez_326_cc',
  github_url = 'https://github.com/rohan_rodriguez_326',
  linkedin_url = 'https://linkedin.com/in/rohan_rodriguez_326',
  portfolio_url = 'https://rohan_rodriguez_326.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'ef1f401a-ad98-4034-858f-e50428bb2b9a';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2028',
  academic_credits = 15,
  leetcode_username = 'anjali_martinez_188_lc',
  codeforces_username = 'anjali_martinez_188_cf',
  codechef_username = 'anjali_martinez_188_cc',
  github_url = 'https://github.com/anjali_martinez_188',
  linkedin_url = 'https://linkedin.com/in/anjali_martinez_188',
  portfolio_url = 'https://anjali_martinez_188.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '839be94c-b954-4e02-9b31-c23d51a6aa88';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2028',
  academic_credits = 42,
  leetcode_username = 'aarav_dutta_719_lc',
  codeforces_username = 'aarav_dutta_719_cf',
  codechef_username = 'aarav_dutta_719_cc',
  github_url = 'https://github.com/aarav_dutta_719',
  linkedin_url = 'https://linkedin.com/in/aarav_dutta_719',
  portfolio_url = 'https://aarav_dutta_719.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'becb90ae-28c3-43e3-9ec6-0248f6ae46e7';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2028',
  academic_credits = 23,
  leetcode_username = 'aria_ray_996_lc',
  codeforces_username = 'aria_ray_996_cf',
  codechef_username = 'aria_ray_996_cc',
  github_url = 'https://github.com/aria_ray_996',
  linkedin_url = 'https://linkedin.com/in/aria_ray_996',
  portfolio_url = 'https://aria_ray_996.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '6df8d004-da23-4845-87cb-7739ac64e78f';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2026',
  academic_credits = 11,
  leetcode_username = 'mason_sen_846_lc',
  codeforces_username = 'mason_sen_846_cf',
  codechef_username = 'mason_sen_846_cc',
  github_url = 'https://github.com/mason_sen_846',
  linkedin_url = 'https://linkedin.com/in/mason_sen_846',
  portfolio_url = 'https://mason_sen_846.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '59e358f6-0830-42e6-82ed-642ea463308c';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2029',
  academic_credits = 28,
  leetcode_username = 'akash_thomas_294_lc',
  codeforces_username = 'akash_thomas_294_cf',
  codechef_username = 'akash_thomas_294_cc',
  github_url = 'https://github.com/akash_thomas_294',
  linkedin_url = 'https://linkedin.com/in/akash_thomas_294',
  portfolio_url = 'https://akash_thomas_294.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'bcdf7c6f-3c76-47b9-b77b-2fa74ab686fd';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2029',
  academic_credits = 37,
  leetcode_username = 'sanjana_rodriguez_621_lc',
  codeforces_username = 'sanjana_rodriguez_621_cf',
  codechef_username = 'sanjana_rodriguez_621_cc',
  github_url = 'https://github.com/sanjana_rodriguez_621',
  linkedin_url = 'https://linkedin.com/in/sanjana_rodriguez_621',
  portfolio_url = 'https://sanjana_rodriguez_621.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '6b062513-8be6-4122-a33a-0a203fc0ad8d';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2027',
  academic_credits = 26,
  leetcode_username = 'pooja_roy_360_lc',
  codeforces_username = 'pooja_roy_360_cf',
  codechef_username = 'pooja_roy_360_cc',
  github_url = 'https://github.com/pooja_roy_360',
  linkedin_url = 'https://linkedin.com/in/pooja_roy_360',
  portfolio_url = 'https://pooja_roy_360.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'f63afe9b-16b6-484a-9cd7-458a7b3ecc99';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2028',
  academic_credits = 47,
  leetcode_username = 'sanjay_banerjee_373_lc',
  codeforces_username = 'sanjay_banerjee_373_cf',
  codechef_username = 'sanjay_banerjee_373_cc',
  github_url = 'https://github.com/sanjay_banerjee_373',
  linkedin_url = 'https://linkedin.com/in/sanjay_banerjee_373',
  portfolio_url = 'https://sanjay_banerjee_373.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '1c79d5f0-4d12-4b21-ae80-cfef10a42938';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2026',
  academic_credits = 27,
  leetcode_username = 'kabir_ghosh_523_lc',
  codeforces_username = 'kabir_ghosh_523_cf',
  codechef_username = 'kabir_ghosh_523_cc',
  github_url = 'https://github.com/kabir_ghosh_523',
  linkedin_url = 'https://linkedin.com/in/kabir_ghosh_523',
  portfolio_url = 'https://kabir_ghosh_523.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'd9f60f3f-4e97-4f52-bbba-3f9445c2778a';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2026',
  academic_credits = 24,
  leetcode_username = 'alex_anderson_172_lc',
  codeforces_username = 'alex_anderson_172_cf',
  codechef_username = 'alex_anderson_172_cc',
  github_url = 'https://github.com/alex_anderson_172',
  linkedin_url = 'https://linkedin.com/in/alex_anderson_172',
  portfolio_url = 'https://alex_anderson_172.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '1e34604b-7948-46d4-b430-d95b1d5864f2';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = '2026',
  academic_credits = 42,
  leetcode_username = 'kabir_jones_598_lc',
  codeforces_username = 'kabir_jones_598_cf',
  codechef_username = 'kabir_jones_598_cc',
  github_url = 'https://github.com/kabir_jones_598',
  linkedin_url = 'https://linkedin.com/in/kabir_jones_598',
  portfolio_url = 'https://kabir_jones_598.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '523d3dc9-14e2-4c51-92f6-58085dc2ccc0';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2026',
  academic_credits = 23,
  leetcode_username = 'meera_jones_548_lc',
  codeforces_username = 'meera_jones_548_cf',
  codechef_username = 'meera_jones_548_cc',
  github_url = 'https://github.com/meera_jones_548',
  linkedin_url = 'https://linkedin.com/in/meera_jones_548',
  portfolio_url = 'https://meera_jones_548.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '8242d1fd-e2a7-4f74-9659-c025d48a77f8';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2027',
  academic_credits = 11,
  leetcode_username = 'priya_patel_327_lc',
  codeforces_username = 'priya_patel_327_cf',
  codechef_username = 'priya_patel_327_cc',
  github_url = 'https://github.com/priya_patel_327',
  linkedin_url = 'https://linkedin.com/in/priya_patel_327',
  portfolio_url = 'https://priya_patel_327.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '90d56139-eefa-4596-a095-d328ccbc7c96';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2027',
  academic_credits = 19,
  leetcode_username = 'akash_jones_988_lc',
  codeforces_username = 'akash_jones_988_cf',
  codechef_username = 'akash_jones_988_cc',
  github_url = 'https://github.com/akash_jones_988',
  linkedin_url = 'https://linkedin.com/in/akash_jones_988',
  portfolio_url = 'https://akash_jones_988.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'a561c14d-ce6d-4739-a4e6-aaf99b9d3b49';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2026',
  academic_credits = 15,
  leetcode_username = 'mason_mitra_956_lc',
  codeforces_username = 'mason_mitra_956_cf',
  codechef_username = 'mason_mitra_956_cc',
  github_url = 'https://github.com/mason_mitra_956',
  linkedin_url = 'https://linkedin.com/in/mason_mitra_956',
  portfolio_url = 'https://mason_mitra_956.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'eac37ad1-ea13-4622-9e9b-b63c72aaefcf';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = '2029',
  academic_credits = 10,
  leetcode_username = 'sanjana_roy_345_lc',
  codeforces_username = 'sanjana_roy_345_cf',
  codechef_username = 'sanjana_roy_345_cc',
  github_url = 'https://github.com/sanjana_roy_345',
  linkedin_url = 'https://linkedin.com/in/sanjana_roy_345',
  portfolio_url = 'https://sanjana_roy_345.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '3f65a569-2094-4786-b2f2-268bb6697839';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Information Technology',
  graduation_year = '2029',
  academic_credits = 54,
  leetcode_username = 'sanjay_pal_322_lc',
  codeforces_username = 'sanjay_pal_322_cf',
  codechef_username = 'sanjay_pal_322_cc',
  github_url = 'https://github.com/sanjay_pal_322',
  linkedin_url = 'https://linkedin.com/in/sanjay_pal_322',
  portfolio_url = 'https://sanjay_pal_322.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'ca50075a-9b25-4e44-8c50-683c009f2118';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2026',
  academic_credits = 19,
  leetcode_username = 'dev_hernandez_730_lc',
  codeforces_username = 'dev_hernandez_730_cf',
  codechef_username = 'dev_hernandez_730_cc',
  github_url = 'https://github.com/dev_hernandez_730',
  linkedin_url = 'https://linkedin.com/in/dev_hernandez_730',
  portfolio_url = 'https://dev_hernandez_730.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'eeee7f1d-c207-42a2-b4bc-0f549c07795b';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2028',
  academic_credits = 43,
  leetcode_username = 'mason_taylor_890_lc',
  codeforces_username = 'mason_taylor_890_cf',
  codechef_username = 'mason_taylor_890_cc',
  github_url = 'https://github.com/mason_taylor_890',
  linkedin_url = 'https://linkedin.com/in/mason_taylor_890',
  portfolio_url = 'https://mason_taylor_890.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = 'c7010de5-3997-41fd-b411-460b0f04fe26';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Computer Science',
  graduation_year = '2029',
  academic_credits = 50,
  leetcode_username = 'ananya_dutta_360_lc',
  codeforces_username = 'ananya_dutta_360_cf',
  codechef_username = 'ananya_dutta_360_cc',
  github_url = 'https://github.com/ananya_dutta_360',
  linkedin_url = 'https://linkedin.com/in/ananya_dutta_360',
  portfolio_url = 'https://ananya_dutta_360.github.io',
  college_key = 'COLLEGE_SRM',
  company_key = NULL
WHERE id = '08d480c6-be62-44ca-9a47-b8493a116495';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = NULL,
  academic_credits = 0,
  leetcode_username = 'ava_iyer_166_lc',
  codeforces_username = 'ava_iyer_166_cf',
  codechef_username = 'ava_iyer_166_cc',
  github_url = 'https://github.com/ava_iyer_166',
  linkedin_url = 'https://linkedin.com/in/ava_iyer_166',
  portfolio_url = 'https://ava_iyer_166.github.io',
  college_key = 'COLLEGE_SRM_FACULTY',
  company_key = NULL
WHERE id = 'bb62f128-074b-4513-93ac-f23d3ef6f87e';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Electronics & Communication',
  graduation_year = NULL,
  academic_credits = 0,
  leetcode_username = 'neha_sarkar_692_lc',
  codeforces_username = 'neha_sarkar_692_cf',
  codechef_username = 'neha_sarkar_692_cc',
  github_url = 'https://github.com/neha_sarkar_692',
  linkedin_url = 'https://linkedin.com/in/neha_sarkar_692',
  portfolio_url = 'https://neha_sarkar_692.github.io',
  college_key = 'COLLEGE_SRM_FACULTY',
  company_key = NULL
WHERE id = 'ec39b5d9-32ae-4a25-8b3e-960c0b4e00aa';

UPDATE public.profiles
SET 
  institute_id = 'e1b8b8f1-e123-4567-89ab-cdef01234567',
  college_name = 'SRM Easwari Engineering College',
  department = 'Software Engineering',
  graduation_year = NULL,
  academic_credits = 0,
  leetcode_username = 'rahul_pal_231_lc',
  codeforces_username = 'rahul_pal_231_cf',
  codechef_username = 'rahul_pal_231_cc',
  github_url = 'https://github.com/rahul_pal_231',
  linkedin_url = 'https://linkedin.com/in/rahul_pal_231',
  portfolio_url = 'https://rahul_pal_231.github.io',
  college_key = 'COLLEGE_SRM_FACULTY',
  company_key = NULL
WHERE id = '6357186f-0d1f-478a-a673-d952be58cbb9';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Software Engineering',
  graduation_year = '2027',
  academic_credits = 11,
  leetcode_username = 'pranav_shukla_734_lc',
  codeforces_username = 'pranav_shukla_734_cf',
  codechef_username = 'pranav_shukla_734_cc',
  github_url = 'https://github.com/pranav_shukla_734',
  linkedin_url = 'https://linkedin.com/in/pranav_shukla_734',
  portfolio_url = 'https://pranav_shukla_734.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '90ba2aee-0530-4015-a95f-5e4064c1ed26';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Electronics & Communication',
  graduation_year = '2026',
  academic_credits = 22,
  leetcode_username = 'mia_banerjee_137_lc',
  codeforces_username = 'mia_banerjee_137_cf',
  codechef_username = 'mia_banerjee_137_cc',
  github_url = 'https://github.com/mia_banerjee_137',
  linkedin_url = 'https://linkedin.com/in/mia_banerjee_137',
  portfolio_url = 'https://mia_banerjee_137.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = 'b1685ff5-4d76-4605-bceb-3c5e30808acf';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Software Engineering',
  graduation_year = '2029',
  academic_credits = 35,
  leetcode_username = 'tanvi_brown_297_lc',
  codeforces_username = 'tanvi_brown_297_cf',
  codechef_username = 'tanvi_brown_297_cc',
  github_url = 'https://github.com/tanvi_brown_297',
  linkedin_url = 'https://linkedin.com/in/tanvi_brown_297',
  portfolio_url = 'https://tanvi_brown_297.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = 'edf37ca9-63ff-435f-a668-28a01d249408';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Software Engineering',
  graduation_year = '2027',
  academic_credits = 43,
  leetcode_username = 'aarav_rao_541_lc',
  codeforces_username = 'aarav_rao_541_cf',
  codechef_username = 'aarav_rao_541_cc',
  github_url = 'https://github.com/aarav_rao_541',
  linkedin_url = 'https://linkedin.com/in/aarav_rao_541',
  portfolio_url = 'https://aarav_rao_541.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '230a48ef-b259-4710-9cc7-67f031f494ed';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Information Technology',
  graduation_year = '2028',
  academic_credits = 11,
  leetcode_username = 'sophia_johnson_452_lc',
  codeforces_username = 'sophia_johnson_452_cf',
  codechef_username = 'sophia_johnson_452_cc',
  github_url = 'https://github.com/sophia_johnson_452',
  linkedin_url = 'https://linkedin.com/in/sophia_johnson_452',
  portfolio_url = 'https://sophia_johnson_452.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '3d08b628-f90a-48cd-b7a7-ee8d8c94245c';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Software Engineering',
  graduation_year = '2027',
  academic_credits = 35,
  leetcode_username = 'rahul_adhikari_951_lc',
  codeforces_username = 'rahul_adhikari_951_cf',
  codechef_username = 'rahul_adhikari_951_cc',
  github_url = 'https://github.com/rahul_adhikari_951',
  linkedin_url = 'https://linkedin.com/in/rahul_adhikari_951',
  portfolio_url = 'https://rahul_adhikari_951.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '94c790da-6922-4892-a827-46db5fd34b07';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Information Technology',
  graduation_year = '2028',
  academic_credits = 58,
  leetcode_username = 'sanjay_tiwari_756_lc',
  codeforces_username = 'sanjay_tiwari_756_cf',
  codechef_username = 'sanjay_tiwari_756_cc',
  github_url = 'https://github.com/sanjay_tiwari_756',
  linkedin_url = 'https://linkedin.com/in/sanjay_tiwari_756',
  portfolio_url = 'https://sanjay_tiwari_756.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '3c1554eb-ae3d-456d-94a9-036d9cc134a2';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Electronics & Communication',
  graduation_year = '2029',
  academic_credits = 25,
  leetcode_username = 'dev_roy_963_lc',
  codeforces_username = 'dev_roy_963_cf',
  codechef_username = 'dev_roy_963_cc',
  github_url = 'https://github.com/dev_roy_963',
  linkedin_url = 'https://linkedin.com/in/dev_roy_963',
  portfolio_url = 'https://dev_roy_963.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '36acbc42-aa58-4b42-9fb3-2d4cfebfdf8c';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Computer Science',
  graduation_year = '2028',
  academic_credits = 49,
  leetcode_username = 'priya_taylor_694_lc',
  codeforces_username = 'priya_taylor_694_cf',
  codechef_username = 'priya_taylor_694_cc',
  github_url = 'https://github.com/priya_taylor_694',
  linkedin_url = 'https://linkedin.com/in/priya_taylor_694',
  portfolio_url = 'https://priya_taylor_694.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = 'e52e5717-6920-4008-87b9-30df639dee22';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Software Engineering',
  graduation_year = '2027',
  academic_credits = 20,
  leetcode_username = 'aria_pal_962_lc',
  codeforces_username = 'aria_pal_962_cf',
  codechef_username = 'aria_pal_962_cc',
  github_url = 'https://github.com/aria_pal_962',
  linkedin_url = 'https://linkedin.com/in/aria_pal_962',
  portfolio_url = 'https://aria_pal_962.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = 'e8cf5c3e-2648-4b7a-a3ee-243d5c609a2b';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Electronics & Communication',
  graduation_year = '2026',
  academic_credits = 32,
  leetcode_username = 'diya_anderson_810_lc',
  codeforces_username = 'diya_anderson_810_cf',
  codechef_username = 'diya_anderson_810_cc',
  github_url = 'https://github.com/diya_anderson_810',
  linkedin_url = 'https://linkedin.com/in/diya_anderson_810',
  portfolio_url = 'https://diya_anderson_810.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '4fd7de47-dc26-40b3-9f71-ea9bb0166376';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Computer Science',
  graduation_year = '2026',
  academic_credits = 12,
  leetcode_username = 'karan_dutta_531_lc',
  codeforces_username = 'karan_dutta_531_cf',
  codechef_username = 'karan_dutta_531_cc',
  github_url = 'https://github.com/karan_dutta_531',
  linkedin_url = 'https://linkedin.com/in/karan_dutta_531',
  portfolio_url = 'https://karan_dutta_531.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = 'cc656283-a152-4cea-97e7-543d7b6ef605';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Software Engineering',
  graduation_year = '2027',
  academic_credits = 40,
  leetcode_username = 'swati_mukherjee_533_lc',
  codeforces_username = 'swati_mukherjee_533_cf',
  codechef_username = 'swati_mukherjee_533_cc',
  github_url = 'https://github.com/swati_mukherjee_533',
  linkedin_url = 'https://linkedin.com/in/swati_mukherjee_533',
  portfolio_url = 'https://swati_mukherjee_533.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '847ea109-f13d-498a-9ffb-90da77cf4355';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Computer Science',
  graduation_year = '2027',
  academic_credits = 19,
  leetcode_username = 'ava_verma_460_lc',
  codeforces_username = 'ava_verma_460_cf',
  codechef_username = 'ava_verma_460_cc',
  github_url = 'https://github.com/ava_verma_460',
  linkedin_url = 'https://linkedin.com/in/ava_verma_460',
  portfolio_url = 'https://ava_verma_460.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = 'd8b82df6-6297-4df8-8489-92f1a710c829';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Information Technology',
  graduation_year = '2027',
  academic_credits = 10,
  leetcode_username = 'raj_mitra_322_lc',
  codeforces_username = 'raj_mitra_322_cf',
  codechef_username = 'raj_mitra_322_cc',
  github_url = 'https://github.com/raj_mitra_322',
  linkedin_url = 'https://linkedin.com/in/raj_mitra_322',
  portfolio_url = 'https://raj_mitra_322.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = 'd133c9e6-0372-4e65-8a99-7f24fa5dac57';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Electronics & Communication',
  graduation_year = '2027',
  academic_credits = 56,
  leetcode_username = 'pooja_pal_527_lc',
  codeforces_username = 'pooja_pal_527_cf',
  codechef_username = 'pooja_pal_527_cc',
  github_url = 'https://github.com/pooja_pal_527',
  linkedin_url = 'https://linkedin.com/in/pooja_pal_527',
  portfolio_url = 'https://pooja_pal_527.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '76bc3ce3-a143-462b-a045-bb065f3b1bd6';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Electronics & Communication',
  graduation_year = '2026',
  academic_credits = 20,
  leetcode_username = 'amit_williams_801_lc',
  codeforces_username = 'amit_williams_801_cf',
  codechef_username = 'amit_williams_801_cc',
  github_url = 'https://github.com/amit_williams_801',
  linkedin_url = 'https://linkedin.com/in/amit_williams_801',
  portfolio_url = 'https://amit_williams_801.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '77ad442e-4109-4023-8471-0899ba4b7ccf';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Electronics & Communication',
  graduation_year = '2029',
  academic_credits = 11,
  leetcode_username = 'aarav_nair_581_lc',
  codeforces_username = 'aarav_nair_581_cf',
  codechef_username = 'aarav_nair_581_cc',
  github_url = 'https://github.com/aarav_nair_581',
  linkedin_url = 'https://linkedin.com/in/aarav_nair_581',
  portfolio_url = 'https://aarav_nair_581.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = 'a07a787f-0337-45ca-9ad5-2bcbd31a61fc';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Computer Science',
  graduation_year = '2026',
  academic_credits = 23,
  leetcode_username = 'sophia_dutta_475_lc',
  codeforces_username = 'sophia_dutta_475_cf',
  codechef_username = 'sophia_dutta_475_cc',
  github_url = 'https://github.com/sophia_dutta_475',
  linkedin_url = 'https://linkedin.com/in/sophia_dutta_475',
  portfolio_url = 'https://sophia_dutta_475.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '59e40063-0efa-4007-a962-dffcf4d0b125';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Computer Science',
  graduation_year = '2027',
  academic_credits = 15,
  leetcode_username = 'anjali_thomas_470_lc',
  codeforces_username = 'anjali_thomas_470_cf',
  codechef_username = 'anjali_thomas_470_cc',
  github_url = 'https://github.com/anjali_thomas_470',
  linkedin_url = 'https://linkedin.com/in/anjali_thomas_470',
  portfolio_url = 'https://anjali_thomas_470.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '5fc516b0-5e1a-4f38-9390-20c5aed49bde';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Software Engineering',
  graduation_year = '2029',
  academic_credits = 51,
  leetcode_username = 'isabella_reddy_390_lc',
  codeforces_username = 'isabella_reddy_390_cf',
  codechef_username = 'isabella_reddy_390_cc',
  github_url = 'https://github.com/isabella_reddy_390',
  linkedin_url = 'https://linkedin.com/in/isabella_reddy_390',
  portfolio_url = 'https://isabella_reddy_390.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '439bb5c3-ec9e-4b0e-9d7c-68db8c1f667b';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Software Engineering',
  graduation_year = '2029',
  academic_credits = 28,
  leetcode_username = 'pooja_hernandez_616_lc',
  codeforces_username = 'pooja_hernandez_616_cf',
  codechef_username = 'pooja_hernandez_616_cc',
  github_url = 'https://github.com/pooja_hernandez_616',
  linkedin_url = 'https://linkedin.com/in/pooja_hernandez_616',
  portfolio_url = 'https://pooja_hernandez_616.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = 'aeb956f4-c040-4b95-9002-75a9348003bb';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Information Technology',
  graduation_year = '2029',
  academic_credits = 15,
  leetcode_username = 'noah_reddy_401_lc',
  codeforces_username = 'noah_reddy_401_cf',
  codechef_username = 'noah_reddy_401_cc',
  github_url = 'https://github.com/noah_reddy_401',
  linkedin_url = 'https://linkedin.com/in/noah_reddy_401',
  portfolio_url = 'https://noah_reddy_401.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '84cea089-b149-4d45-95a1-655302a00713';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Software Engineering',
  graduation_year = '2027',
  academic_credits = 21,
  leetcode_username = 'vijay_gupta_540_lc',
  codeforces_username = 'vijay_gupta_540_cf',
  codechef_username = 'vijay_gupta_540_cc',
  github_url = 'https://github.com/vijay_gupta_540',
  linkedin_url = 'https://linkedin.com/in/vijay_gupta_540',
  portfolio_url = 'https://vijay_gupta_540.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = 'c89b378a-0515-41f4-bb79-1eeb7f5ffb01';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Electronics & Communication',
  graduation_year = '2029',
  academic_credits = 41,
  leetcode_username = 'rohan_reddy_524_lc',
  codeforces_username = 'rohan_reddy_524_cf',
  codechef_username = 'rohan_reddy_524_cc',
  github_url = 'https://github.com/rohan_reddy_524',
  linkedin_url = 'https://linkedin.com/in/rohan_reddy_524',
  portfolio_url = 'https://rohan_reddy_524.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '2eb33d5c-e05b-4c2d-ac0e-415449f5bc0b';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Computer Science',
  graduation_year = '2029',
  academic_credits = 23,
  leetcode_username = 'kavya_bose_750_lc',
  codeforces_username = 'kavya_bose_750_cf',
  codechef_username = 'kavya_bose_750_cc',
  github_url = 'https://github.com/kavya_bose_750',
  linkedin_url = 'https://linkedin.com/in/kavya_bose_750',
  portfolio_url = 'https://kavya_bose_750.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '0dea342a-f9df-44bf-a1cd-f9be169561e4';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Information Technology',
  graduation_year = '2027',
  academic_credits = 29,
  leetcode_username = 'sophia_pandey_906_lc',
  codeforces_username = 'sophia_pandey_906_cf',
  codechef_username = 'sophia_pandey_906_cc',
  github_url = 'https://github.com/sophia_pandey_906',
  linkedin_url = 'https://linkedin.com/in/sophia_pandey_906',
  portfolio_url = 'https://sophia_pandey_906.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = 'f9d59114-543a-41c6-b915-e532e216dbfe';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Software Engineering',
  graduation_year = '2028',
  academic_credits = 48,
  leetcode_username = 'rahul_gupta_343_lc',
  codeforces_username = 'rahul_gupta_343_cf',
  codechef_username = 'rahul_gupta_343_cc',
  github_url = 'https://github.com/rahul_gupta_343',
  linkedin_url = 'https://linkedin.com/in/rahul_gupta_343',
  portfolio_url = 'https://rahul_gupta_343.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = 'b547ac66-cbfe-4f45-ab5e-f3757056c0d3';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Computer Science',
  graduation_year = '2027',
  academic_credits = 37,
  leetcode_username = 'lucas_nair_190_lc',
  codeforces_username = 'lucas_nair_190_cf',
  codechef_username = 'lucas_nair_190_cc',
  github_url = 'https://github.com/lucas_nair_190',
  linkedin_url = 'https://linkedin.com/in/lucas_nair_190',
  portfolio_url = 'https://lucas_nair_190.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '7bcd19a5-4c10-4692-b0d9-62b2709ac8d0';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Electronics & Communication',
  graduation_year = '2027',
  academic_credits = 36,
  leetcode_username = 'shruti_hernandez_934_lc',
  codeforces_username = 'shruti_hernandez_934_cf',
  codechef_username = 'shruti_hernandez_934_cc',
  github_url = 'https://github.com/shruti_hernandez_934',
  linkedin_url = 'https://linkedin.com/in/shruti_hernandez_934',
  portfolio_url = 'https://shruti_hernandez_934.github.io',
  college_key = 'COLLEGE_IITD',
  company_key = NULL
WHERE id = '87bb46b4-c2a7-46c2-a602-d03630ace053';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Information Technology',
  graduation_year = NULL,
  academic_credits = 0,
  leetcode_username = 'neha_joshi_990_lc',
  codeforces_username = 'neha_joshi_990_cf',
  codechef_username = 'neha_joshi_990_cc',
  github_url = 'https://github.com/neha_joshi_990',
  linkedin_url = 'https://linkedin.com/in/neha_joshi_990',
  portfolio_url = 'https://neha_joshi_990.github.io',
  college_key = 'COLLEGE_IITD_FACULTY',
  company_key = NULL
WHERE id = '5b28f8b9-1129-4804-ae02-27efa236abff';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Information Technology',
  graduation_year = NULL,
  academic_credits = 0,
  leetcode_username = 'rohan_sharma_320_lc',
  codeforces_username = 'rohan_sharma_320_cf',
  codechef_username = 'rohan_sharma_320_cc',
  github_url = 'https://github.com/rohan_sharma_320',
  linkedin_url = 'https://linkedin.com/in/rohan_sharma_320',
  portfolio_url = 'https://rohan_sharma_320.github.io',
  college_key = 'COLLEGE_IITD_FACULTY',
  company_key = NULL
WHERE id = '1cf48f00-0159-43be-8494-317e93a1664d';

UPDATE public.profiles
SET 
  institute_id = 'e2b8b8f2-e123-4567-89ab-cdef01234568',
  college_name = 'Indian Institute of Technology Delhi',
  department = 'Electronics & Communication',
  graduation_year = NULL,
  academic_credits = 0,
  leetcode_username = 'akash_mitra_498_lc',
  codeforces_username = 'akash_mitra_498_cf',
  codechef_username = 'akash_mitra_498_cc',
  github_url = 'https://github.com/akash_mitra_498',
  linkedin_url = 'https://linkedin.com/in/akash_mitra_498',
  portfolio_url = 'https://akash_mitra_498.github.io',
  college_key = 'COLLEGE_IITD_FACULTY',
  company_key = NULL
WHERE id = '50588c59-f86c-45cc-bd3b-ced426264e00';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 16,
  leetcode_username = 'tanvi_das_118_lc',
  codeforces_username = 'tanvi_das_118_cf',
  codechef_username = 'tanvi_das_118_cc',
  github_url = 'https://github.com/tanvi_das_118',
  linkedin_url = 'https://linkedin.com/in/tanvi_das_118',
  portfolio_url = 'https://tanvi_das_118.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = 'b5c78196-7061-4b36-83d5-3adf7f19b73a';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 54,
  leetcode_username = 'dev_pal_154_lc',
  codeforces_username = 'dev_pal_154_cf',
  codechef_username = 'dev_pal_154_cc',
  github_url = 'https://github.com/dev_pal_154',
  linkedin_url = 'https://linkedin.com/in/dev_pal_154',
  portfolio_url = 'https://dev_pal_154.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '617845f8-43ba-40c3-8cbc-b1d7403e0a94';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 14,
  leetcode_username = 'alex_roy_270_lc',
  codeforces_username = 'alex_roy_270_cf',
  codechef_username = 'alex_roy_270_cc',
  github_url = 'https://github.com/alex_roy_270',
  linkedin_url = 'https://linkedin.com/in/alex_roy_270',
  portfolio_url = 'https://alex_roy_270.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '623f34b2-93e9-44a8-8701-1fc01d31c94b';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 38,
  leetcode_username = 'isha_tiwari_726_lc',
  codeforces_username = 'isha_tiwari_726_cf',
  codechef_username = 'isha_tiwari_726_cc',
  github_url = 'https://github.com/isha_tiwari_726',
  linkedin_url = 'https://linkedin.com/in/isha_tiwari_726',
  portfolio_url = 'https://isha_tiwari_726.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '726ddef2-65a3-4fba-addb-1d0b603a5b0e';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 54,
  leetcode_username = 'vihaan_sharma_789_lc',
  codeforces_username = 'vihaan_sharma_789_cf',
  codechef_username = 'vihaan_sharma_789_cc',
  github_url = 'https://github.com/vihaan_sharma_789',
  linkedin_url = 'https://linkedin.com/in/vihaan_sharma_789',
  portfolio_url = 'https://vihaan_sharma_789.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '83a31022-8874-48bc-9ff8-702e5e41dd52';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 13,
  leetcode_username = 'aishwarya_wilson_145_lc',
  codeforces_username = 'aishwarya_wilson_145_cf',
  codechef_username = 'aishwarya_wilson_145_cc',
  github_url = 'https://github.com/aishwarya_wilson_145',
  linkedin_url = 'https://linkedin.com/in/aishwarya_wilson_145',
  portfolio_url = 'https://aishwarya_wilson_145.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '083772b1-04e0-42db-811a-66687c2dfb8e';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 24,
  leetcode_username = 'isha_kumar_789_lc',
  codeforces_username = 'isha_kumar_789_cf',
  codechef_username = 'isha_kumar_789_cc',
  github_url = 'https://github.com/isha_kumar_789',
  linkedin_url = 'https://linkedin.com/in/isha_kumar_789',
  portfolio_url = 'https://isha_kumar_789.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '3e292949-1a8d-4c22-8863-36473ee2fd45';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 16,
  leetcode_username = 'priya_bose_780_lc',
  codeforces_username = 'priya_bose_780_cf',
  codechef_username = 'priya_bose_780_cc',
  github_url = 'https://github.com/priya_bose_780',
  linkedin_url = 'https://linkedin.com/in/priya_bose_780',
  portfolio_url = 'https://priya_bose_780.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = 'fad814ce-fb87-4200-aa73-3220370d507c';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 45,
  leetcode_username = 'liam_pandey_312_lc',
  codeforces_username = 'liam_pandey_312_cf',
  codechef_username = 'liam_pandey_312_cc',
  github_url = 'https://github.com/liam_pandey_312',
  linkedin_url = 'https://linkedin.com/in/liam_pandey_312',
  portfolio_url = 'https://liam_pandey_312.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = 'b60b3f90-b1b7-4059-ab33-556ca86e2d10';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 21,
  leetcode_username = 'divya_sharma_931_lc',
  codeforces_username = 'divya_sharma_931_cf',
  codechef_username = 'divya_sharma_931_cc',
  github_url = 'https://github.com/divya_sharma_931',
  linkedin_url = 'https://linkedin.com/in/divya_sharma_931',
  portfolio_url = 'https://divya_sharma_931.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '76f00d37-1a05-43b8-be3c-1bbdebaf8fab';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 29,
  leetcode_username = 'sneha_tiwari_242_lc',
  codeforces_username = 'sneha_tiwari_242_cf',
  codechef_username = 'sneha_tiwari_242_cc',
  github_url = 'https://github.com/sneha_tiwari_242',
  linkedin_url = 'https://linkedin.com/in/sneha_tiwari_242',
  portfolio_url = 'https://sneha_tiwari_242.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = 'dfa29051-3d4e-48f4-b3d6-e494a2d2432d';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 11,
  leetcode_username = 'liam_nair_387_lc',
  codeforces_username = 'liam_nair_387_cf',
  codechef_username = 'liam_nair_387_cc',
  github_url = 'https://github.com/liam_nair_387',
  linkedin_url = 'https://linkedin.com/in/liam_nair_387',
  portfolio_url = 'https://liam_nair_387.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '19023178-e52d-4545-80a5-e7d66b461e5f';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 25,
  leetcode_username = 'lucas_rao_442_lc',
  codeforces_username = 'lucas_rao_442_cf',
  codechef_username = 'lucas_rao_442_cc',
  github_url = 'https://github.com/lucas_rao_442',
  linkedin_url = 'https://linkedin.com/in/lucas_rao_442',
  portfolio_url = 'https://lucas_rao_442.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = 'ff47290d-71f3-4af9-8949-92142c2b33be';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 27,
  leetcode_username = 'sid_jones_841_lc',
  codeforces_username = 'sid_jones_841_cf',
  codechef_username = 'sid_jones_841_cc',
  github_url = 'https://github.com/sid_jones_841',
  linkedin_url = 'https://linkedin.com/in/sid_jones_841',
  portfolio_url = 'https://sid_jones_841.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = 'a372d3f3-503d-467c-893f-f6ab09278f02';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 28,
  leetcode_username = 'alex_sharma_711_lc',
  codeforces_username = 'alex_sharma_711_cf',
  codechef_username = 'alex_sharma_711_cc',
  github_url = 'https://github.com/alex_sharma_711',
  linkedin_url = 'https://linkedin.com/in/alex_sharma_711',
  portfolio_url = 'https://alex_sharma_711.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = 'bd8cc4ff-ec46-4e44-995c-c07aeaa2d701';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 48,
  leetcode_username = 'raj_martinez_952_lc',
  codeforces_username = 'raj_martinez_952_cf',
  codechef_username = 'raj_martinez_952_cc',
  github_url = 'https://github.com/raj_martinez_952',
  linkedin_url = 'https://linkedin.com/in/raj_martinez_952',
  portfolio_url = 'https://raj_martinez_952.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '3e6e668c-2d9a-4870-ad75-865d727452e5';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 38,
  leetcode_username = 'divya_banerjee_114_lc',
  codeforces_username = 'divya_banerjee_114_cf',
  codechef_username = 'divya_banerjee_114_cc',
  github_url = 'https://github.com/divya_banerjee_114',
  linkedin_url = 'https://linkedin.com/in/divya_banerjee_114',
  portfolio_url = 'https://divya_banerjee_114.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = 'f797847c-a544-4794-b054-362297cf73cf';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 32,
  leetcode_username = 'liam_tiwari_557_lc',
  codeforces_username = 'liam_tiwari_557_cf',
  codechef_username = 'liam_tiwari_557_cc',
  github_url = 'https://github.com/liam_tiwari_557',
  linkedin_url = 'https://linkedin.com/in/liam_tiwari_557',
  portfolio_url = 'https://liam_tiwari_557.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = 'e54ca72d-fa79-4a4b-9437-ab75f2586922';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 25,
  leetcode_username = 'pranav_nair_341_lc',
  codeforces_username = 'pranav_nair_341_cf',
  codechef_username = 'pranav_nair_341_cc',
  github_url = 'https://github.com/pranav_nair_341',
  linkedin_url = 'https://linkedin.com/in/pranav_nair_341',
  portfolio_url = 'https://pranav_nair_341.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '29bc4e9a-c4d0-4cdb-873e-8ea9242e704c';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 21,
  leetcode_username = 'noah_pandey_433_lc',
  codeforces_username = 'noah_pandey_433_cf',
  codechef_username = 'noah_pandey_433_cc',
  github_url = 'https://github.com/noah_pandey_433',
  linkedin_url = 'https://linkedin.com/in/noah_pandey_433',
  portfolio_url = 'https://noah_pandey_433.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '8341d7c2-1a29-4864-8cf0-15ac8797bcaa';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 47,
  leetcode_username = 'pranav_ghosh_562_lc',
  codeforces_username = 'pranav_ghosh_562_cf',
  codechef_username = 'pranav_ghosh_562_cc',
  github_url = 'https://github.com/pranav_ghosh_562',
  linkedin_url = 'https://linkedin.com/in/pranav_ghosh_562',
  portfolio_url = 'https://pranav_ghosh_562.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = 'df9c4d69-5661-4aec-b91c-cbd06469c1af';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 56,
  leetcode_username = 'meera_davis_355_lc',
  codeforces_username = 'meera_davis_355_cf',
  codechef_username = 'meera_davis_355_cc',
  github_url = 'https://github.com/meera_davis_355',
  linkedin_url = 'https://linkedin.com/in/meera_davis_355',
  portfolio_url = 'https://meera_davis_355.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = 'f58852ad-8023-4d7c-b33c-9106d770fde9';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 40,
  leetcode_username = 'riya_singh_398_lc',
  codeforces_username = 'riya_singh_398_cf',
  codechef_username = 'riya_singh_398_cc',
  github_url = 'https://github.com/riya_singh_398',
  linkedin_url = 'https://linkedin.com/in/riya_singh_398',
  portfolio_url = 'https://riya_singh_398.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '0184ed0b-c1d8-40f1-ad8a-d42856143c3f';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 59,
  leetcode_username = 'tanvi_rodriguez_667_lc',
  codeforces_username = 'tanvi_rodriguez_667_cf',
  codechef_username = 'tanvi_rodriguez_667_cc',
  github_url = 'https://github.com/tanvi_rodriguez_667',
  linkedin_url = 'https://linkedin.com/in/tanvi_rodriguez_667',
  portfolio_url = 'https://tanvi_rodriguez_667.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = 'a3c38c25-5fd8-482f-a9e8-a5a64fb6ad03';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 17,
  leetcode_username = 'riya_choudhury_297_lc',
  codeforces_username = 'riya_choudhury_297_cf',
  codechef_username = 'riya_choudhury_297_cc',
  github_url = 'https://github.com/riya_choudhury_297',
  linkedin_url = 'https://linkedin.com/in/riya_choudhury_297',
  portfolio_url = 'https://riya_choudhury_297.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '2219c9dc-29f1-4678-925a-80f68dbe7a13';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 39,
  leetcode_username = 'dev_jones_883_lc',
  codeforces_username = 'dev_jones_883_cf',
  codechef_username = 'dev_jones_883_cc',
  github_url = 'https://github.com/dev_jones_883',
  linkedin_url = 'https://linkedin.com/in/dev_jones_883',
  portfolio_url = 'https://dev_jones_883.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '4eb262ab-2144-4f9e-ab69-37d4db1ef336';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 51,
  leetcode_username = 'sophia_taylor_483_lc',
  codeforces_username = 'sophia_taylor_483_cf',
  codechef_username = 'sophia_taylor_483_cc',
  github_url = 'https://github.com/sophia_taylor_483',
  linkedin_url = 'https://linkedin.com/in/sophia_taylor_483',
  portfolio_url = 'https://sophia_taylor_483.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '63faef35-8abc-4c8d-a69b-59369667c38d';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 35,
  leetcode_username = 'rahul_miller_408_lc',
  codeforces_username = 'rahul_miller_408_cf',
  codechef_username = 'rahul_miller_408_cc',
  github_url = 'https://github.com/rahul_miller_408',
  linkedin_url = 'https://linkedin.com/in/rahul_miller_408',
  portfolio_url = 'https://rahul_miller_408.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = 'dad8346e-cbce-4c2e-bee9-8493e9ba1958';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 55,
  leetcode_username = 'shruti_banerjee_293_lc',
  codeforces_username = 'shruti_banerjee_293_cf',
  codechef_username = 'shruti_banerjee_293_cc',
  github_url = 'https://github.com/shruti_banerjee_293',
  linkedin_url = 'https://linkedin.com/in/shruti_banerjee_293',
  portfolio_url = 'https://shruti_banerjee_293.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '76879a4d-1258-48c6-87ab-c24352839a64';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 33,
  leetcode_username = 'sanjay_thomas_813_lc',
  codeforces_username = 'sanjay_thomas_813_cf',
  codechef_username = 'sanjay_thomas_813_cc',
  github_url = 'https://github.com/sanjay_thomas_813',
  linkedin_url = 'https://linkedin.com/in/sanjay_thomas_813',
  portfolio_url = 'https://sanjay_thomas_813.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '24811ec3-7f45-4926-bdff-e5733f11c785';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 24,
  leetcode_username = 'shruti_sen_579_lc',
  codeforces_username = 'shruti_sen_579_cf',
  codechef_username = 'shruti_sen_579_cc',
  github_url = 'https://github.com/shruti_sen_579',
  linkedin_url = 'https://linkedin.com/in/shruti_sen_579',
  portfolio_url = 'https://shruti_sen_579.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '1eaa2260-f8fe-49aa-a7a8-a60b75ad0285';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 41,
  leetcode_username = 'akash_brown_338_lc',
  codeforces_username = 'akash_brown_338_cf',
  codechef_username = 'akash_brown_338_cc',
  github_url = 'https://github.com/akash_brown_338',
  linkedin_url = 'https://linkedin.com/in/akash_brown_338',
  portfolio_url = 'https://akash_brown_338.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '48b1e79c-37d1-4bbc-9240-50e66f8a63bb';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 24,
  leetcode_username = 'isha_smith_264_lc',
  codeforces_username = 'isha_smith_264_cf',
  codechef_username = 'isha_smith_264_cc',
  github_url = 'https://github.com/isha_smith_264',
  linkedin_url = 'https://linkedin.com/in/isha_smith_264',
  portfolio_url = 'https://isha_smith_264.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '469ca073-3e46-4f35-bffa-dfd1d117164c';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 25,
  leetcode_username = 'lucas_martinez_634_lc',
  codeforces_username = 'lucas_martinez_634_cf',
  codechef_username = 'lucas_martinez_634_cc',
  github_url = 'https://github.com/lucas_martinez_634',
  linkedin_url = 'https://linkedin.com/in/lucas_martinez_634',
  portfolio_url = 'https://lucas_martinez_634.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '5cfca2df-f436-4486-860b-b80e2ccf4e0d';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 26,
  leetcode_username = 'aarav_nair_139_lc',
  codeforces_username = 'aarav_nair_139_cf',
  codechef_username = 'aarav_nair_139_cc',
  github_url = 'https://github.com/aarav_nair_139',
  linkedin_url = 'https://linkedin.com/in/aarav_nair_139',
  portfolio_url = 'https://aarav_nair_139.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '8d95ff10-5eb4-4e0e-bfe2-3279593a8463';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 29,
  leetcode_username = 'sophia_sarkar_751_lc',
  codeforces_username = 'sophia_sarkar_751_cf',
  codechef_username = 'sophia_sarkar_751_cc',
  github_url = 'https://github.com/sophia_sarkar_751',
  linkedin_url = 'https://linkedin.com/in/sophia_sarkar_751',
  portfolio_url = 'https://sophia_sarkar_751.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '9b06bea1-885c-415a-a9d9-59ed7b0968ee';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 58,
  leetcode_username = 'aria_patel_404_lc',
  codeforces_username = 'aria_patel_404_cf',
  codechef_username = 'aria_patel_404_cc',
  github_url = 'https://github.com/aria_patel_404',
  linkedin_url = 'https://linkedin.com/in/aria_patel_404',
  portfolio_url = 'https://aria_patel_404.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = 'b5b78d99-fc9c-47ed-868b-43b53540084d';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 18,
  leetcode_username = 'ava_tiwari_560_lc',
  codeforces_username = 'ava_tiwari_560_cf',
  codechef_username = 'ava_tiwari_560_cc',
  github_url = 'https://github.com/ava_tiwari_560',
  linkedin_url = 'https://linkedin.com/in/ava_tiwari_560',
  portfolio_url = 'https://ava_tiwari_560.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '4f1b122b-80a5-4e2c-bf15-c0eeb3aadefb';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 57,
  leetcode_username = 'ava_roy_251_lc',
  codeforces_username = 'ava_roy_251_cf',
  codechef_username = 'ava_roy_251_cc',
  github_url = 'https://github.com/ava_roy_251',
  linkedin_url = 'https://linkedin.com/in/ava_roy_251',
  portfolio_url = 'https://ava_roy_251.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = 'f8485af8-1c51-48de-a54d-0534b0a68590';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 44,
  leetcode_username = 'vihaan_miller_337_lc',
  codeforces_username = 'vihaan_miller_337_cf',
  codechef_username = 'vihaan_miller_337_cc',
  github_url = 'https://github.com/vihaan_miller_337',
  linkedin_url = 'https://linkedin.com/in/vihaan_miller_337',
  portfolio_url = 'https://vihaan_miller_337.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = 'cd0a0ff4-4c4f-4954-b47c-3f5252e028e8';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 17,
  leetcode_username = 'anjali_martinez_942_lc',
  codeforces_username = 'anjali_martinez_942_cf',
  codechef_username = 'anjali_martinez_942_cc',
  github_url = 'https://github.com/anjali_martinez_942',
  linkedin_url = 'https://linkedin.com/in/anjali_martinez_942',
  portfolio_url = 'https://anjali_martinez_942.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '3b2989ad-e761-413a-a646-a58b2a45c4a2';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 43,
  leetcode_username = 'vihaan_taylor_356_lc',
  codeforces_username = 'vihaan_taylor_356_cf',
  codechef_username = 'vihaan_taylor_356_cc',
  github_url = 'https://github.com/vihaan_taylor_356',
  linkedin_url = 'https://linkedin.com/in/vihaan_taylor_356',
  portfolio_url = 'https://vihaan_taylor_356.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '3779cf13-913b-486c-81e3-5a2e3f6dc2dc';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 43,
  leetcode_username = 'sanjay_martinez_681_lc',
  codeforces_username = 'sanjay_martinez_681_cf',
  codechef_username = 'sanjay_martinez_681_cc',
  github_url = 'https://github.com/sanjay_martinez_681',
  linkedin_url = 'https://linkedin.com/in/sanjay_martinez_681',
  portfolio_url = 'https://sanjay_martinez_681.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '2634b114-a608-47d2-85e6-b6ef38cb2239';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 32,
  leetcode_username = 'riya_martinez_965_lc',
  codeforces_username = 'riya_martinez_965_cf',
  codechef_username = 'riya_martinez_965_cc',
  github_url = 'https://github.com/riya_martinez_965',
  linkedin_url = 'https://linkedin.com/in/riya_martinez_965',
  portfolio_url = 'https://riya_martinez_965.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '299e7c9a-3313-4171-95b1-cda414660120';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 55,
  leetcode_username = 'sophia_nair_967_lc',
  codeforces_username = 'sophia_nair_967_cf',
  codechef_username = 'sophia_nair_967_cc',
  github_url = 'https://github.com/sophia_nair_967',
  linkedin_url = 'https://linkedin.com/in/sophia_nair_967',
  portfolio_url = 'https://sophia_nair_967.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '5149d476-5bc5-4a82-952f-89a86908893b';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 44,
  leetcode_username = 'rohan_williams_430_lc',
  codeforces_username = 'rohan_williams_430_cf',
  codechef_username = 'rohan_williams_430_cc',
  github_url = 'https://github.com/rohan_williams_430',
  linkedin_url = 'https://linkedin.com/in/rohan_williams_430',
  portfolio_url = 'https://rohan_williams_430.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '91017b7c-8270-49a4-bbbe-9aecaecdddda';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 56,
  leetcode_username = 'kavya_mehta_966_lc',
  codeforces_username = 'kavya_mehta_966_cf',
  codechef_username = 'kavya_mehta_966_cc',
  github_url = 'https://github.com/kavya_mehta_966',
  linkedin_url = 'https://linkedin.com/in/kavya_mehta_966',
  portfolio_url = 'https://kavya_mehta_966.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '5f2b98bf-e220-4342-909c-4f4f43f85ec9';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 35,
  leetcode_username = 'sanjay_mehta_818_lc',
  codeforces_username = 'sanjay_mehta_818_cf',
  codechef_username = 'sanjay_mehta_818_cc',
  github_url = 'https://github.com/sanjay_mehta_818',
  linkedin_url = 'https://linkedin.com/in/sanjay_mehta_818',
  portfolio_url = 'https://sanjay_mehta_818.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = 'c426afcf-81b5-41a2-ba3c-07c29e0d7312';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 12,
  leetcode_username = 'kabir_shukla_670_lc',
  codeforces_username = 'kabir_shukla_670_cf',
  codechef_username = 'kabir_shukla_670_cc',
  github_url = 'https://github.com/kabir_shukla_670',
  linkedin_url = 'https://linkedin.com/in/kabir_shukla_670',
  portfolio_url = 'https://kabir_shukla_670.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '43535e33-49b8-4b39-b81a-47c6a9d5623a';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Engineering',
  graduation_year = NULL,
  academic_credits = 58,
  leetcode_username = 'riya_mukherjee_396_lc',
  codeforces_username = 'riya_mukherjee_396_cf',
  codechef_username = 'riya_mukherjee_396_cc',
  github_url = 'https://github.com/riya_mukherjee_396',
  linkedin_url = 'https://linkedin.com/in/riya_mukherjee_396',
  portfolio_url = 'https://riya_mukherjee_396.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE'
WHERE id = '963e77a1-01e6-45ea-ad06-3a37d6bd4818';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Computer Science',
  graduation_year = NULL,
  academic_credits = 0,
  leetcode_username = 'lucas_mehta_713_lc',
  codeforces_username = 'lucas_mehta_713_cf',
  codechef_username = 'lucas_mehta_713_cc',
  github_url = 'https://github.com/lucas_mehta_713',
  linkedin_url = 'https://linkedin.com/in/lucas_mehta_713',
  portfolio_url = 'https://lucas_mehta_713.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE_ADMIN'
WHERE id = 'c0fc1b83-013c-4493-8a43-f6f8ffdc69ed';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Software Engineering',
  graduation_year = NULL,
  academic_credits = 0,
  leetcode_username = 'manish_smith_661_lc',
  codeforces_username = 'manish_smith_661_cf',
  codechef_username = 'manish_smith_661_cc',
  github_url = 'https://github.com/manish_smith_661',
  linkedin_url = 'https://linkedin.com/in/manish_smith_661',
  portfolio_url = 'https://manish_smith_661.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE_ADMIN'
WHERE id = '3216a0ca-4162-4b05-9d16-04890c77b70d';

UPDATE public.profiles
SET 
  institute_id = NULL,
  college_name = NULL,
  department = 'Information Technology',
  graduation_year = NULL,
  academic_credits = 0,
  leetcode_username = 'pooja_garcia_628_lc',
  codeforces_username = 'pooja_garcia_628_cf',
  codechef_username = 'pooja_garcia_628_cc',
  github_url = 'https://github.com/pooja_garcia_628',
  linkedin_url = 'https://linkedin.com/in/pooja_garcia_628',
  portfolio_url = 'https://pooja_garcia_628.github.io',
  college_key = NULL,
  company_key = 'COMPANY_GOOGLE_ADMIN'
WHERE id = 'e8019784-d494-460f-a4f0-f859a5542275';