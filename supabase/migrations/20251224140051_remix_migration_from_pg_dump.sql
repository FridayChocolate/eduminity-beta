CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'student',
    'contributor'
);


--
-- Name: question_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.question_status AS ENUM (
    'open',
    'answered',
    'closed'
);


--
-- Name: subscription_tier; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.subscription_tier AS ENUM (
    'free',
    'basic',
    'premium',
    'pro'
);


--
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.transaction_type AS ENUM (
    'earn',
    'spend',
    'withdraw',
    'commission'
);


--
-- Name: verification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.verification_status AS ENUM (
    'pending',
    'verified',
    'rejected'
);


--
-- Name: create_user_subscription(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_user_subscription() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$;


--
-- Name: create_user_wallet(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_user_wallet() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


SET default_table_access_method = heap;

--
-- Name: ad_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ad_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    coins_earned numeric DEFAULT 5 NOT NULL,
    ad_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: answer_ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.answer_ratings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    answer_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating integer,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT answer_ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    is_best_answer boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    icon text,
    requirement_type text,
    requirement_value integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    author_id uuid NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category text,
    featured_image text,
    published boolean DEFAULT false,
    views integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: contributor_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contributor_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    university text NOT NULL,
    ssc_results text NOT NULL,
    hsc_results text NOT NULL,
    semester text NOT NULL,
    year text NOT NULL,
    verification_status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    business_name text,
    business_type text,
    CONSTRAINT contributor_profiles_verification_status_check CHECK ((verification_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: discussion_boards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discussion_boards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subject text NOT NULL,
    description text,
    icon text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: discussion_replies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discussion_replies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    discussion_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: discussions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.discussions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    board_id uuid NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    views integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: donations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.donations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    donor_user_id uuid NOT NULL,
    amount numeric NOT NULL,
    message text,
    is_anonymous boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: material_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.material_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    icon text,
    color text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: material_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.material_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    material_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating integer,
    comment text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT material_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: premium_features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.premium_features (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    tier public.subscription_tier NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: profile_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    institution_name text NOT NULL,
    verification_document text,
    status public.verification_status DEFAULT 'pending'::public.verification_status,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    bio text,
    phone text,
    location text,
    profile_completed boolean DEFAULT false
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    subject text NOT NULL,
    grade_level text,
    coin_reward numeric DEFAULT 0,
    status public.question_status DEFAULT 'open'::public.question_status,
    is_private boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: study_materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.study_materials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    category_id uuid,
    subject text NOT NULL,
    grade_level text,
    price numeric DEFAULT 0,
    is_free boolean DEFAULT false,
    file_url text,
    preview_url text,
    video_url text,
    views integer DEFAULT 0,
    downloads integer DEFAULT 0,
    rating numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tier public.subscription_tier DEFAULT 'free'::public.subscription_tier NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    stripe_subscription_id text,
    stripe_customer_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    amount numeric NOT NULL,
    type public.transaction_type NOT NULL,
    description text,
    reference_id uuid,
    commission_amount numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_badges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    badge_id uuid NOT NULL,
    earned_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    balance numeric DEFAULT 0,
    total_earned numeric DEFAULT 0,
    total_spent numeric DEFAULT 0,
    total_withdrawn numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: work_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    budget text,
    subject text,
    deadline text,
    status text DEFAULT 'open'::text,
    created_at timestamp with time zone DEFAULT now(),
    work_type text,
    payment_status text DEFAULT 'pending'::text,
    payment_amount numeric(10,2),
    CONSTRAINT work_requests_status_check CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: ad_views ad_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_views
    ADD CONSTRAINT ad_views_pkey PRIMARY KEY (id);


--
-- Name: answer_ratings answer_ratings_answer_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_ratings
    ADD CONSTRAINT answer_ratings_answer_id_user_id_key UNIQUE (answer_id, user_id);


--
-- Name: answer_ratings answer_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_ratings
    ADD CONSTRAINT answer_ratings_pkey PRIMARY KEY (id);


--
-- Name: answers answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_pkey PRIMARY KEY (id);


--
-- Name: badges badges_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_name_key UNIQUE (name);


--
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: contributor_profiles contributor_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contributor_profiles
    ADD CONSTRAINT contributor_profiles_pkey PRIMARY KEY (id);


--
-- Name: contributor_profiles contributor_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contributor_profiles
    ADD CONSTRAINT contributor_profiles_user_id_key UNIQUE (user_id);


--
-- Name: discussion_boards discussion_boards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussion_boards
    ADD CONSTRAINT discussion_boards_pkey PRIMARY KEY (id);


--
-- Name: discussion_replies discussion_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussion_replies
    ADD CONSTRAINT discussion_replies_pkey PRIMARY KEY (id);


--
-- Name: discussions discussions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_pkey PRIMARY KEY (id);


--
-- Name: donations donations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_pkey PRIMARY KEY (id);


--
-- Name: material_categories material_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_categories
    ADD CONSTRAINT material_categories_name_key UNIQUE (name);


--
-- Name: material_categories material_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_categories
    ADD CONSTRAINT material_categories_pkey PRIMARY KEY (id);


--
-- Name: material_reviews material_reviews_material_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_reviews
    ADD CONSTRAINT material_reviews_material_id_user_id_key UNIQUE (material_id, user_id);


--
-- Name: material_reviews material_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_reviews
    ADD CONSTRAINT material_reviews_pkey PRIMARY KEY (id);


--
-- Name: premium_features premium_features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.premium_features
    ADD CONSTRAINT premium_features_pkey PRIMARY KEY (id);


--
-- Name: profile_verifications profile_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_verifications
    ADD CONSTRAINT profile_verifications_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: study_materials study_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_materials
    ADD CONSTRAINT study_materials_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);


--
-- Name: user_badges user_badges_user_id_badge_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE (user_id, badge_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id);


--
-- Name: work_requests work_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_requests
    ADD CONSTRAINT work_requests_pkey PRIMARY KEY (id);


--
-- Name: idx_ad_views_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ad_views_created_at ON public.ad_views USING btree (created_at);


--
-- Name: idx_ad_views_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ad_views_user_id ON public.ad_views USING btree (user_id);


--
-- Name: idx_answers_question_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_answers_question_id ON public.answers USING btree (question_id);


--
-- Name: idx_answers_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_answers_user_id ON public.answers USING btree (user_id);


--
-- Name: idx_discussions_board_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_discussions_board_id ON public.discussions USING btree (board_id);


--
-- Name: idx_donations_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_donations_created_at ON public.donations USING btree (created_at);


--
-- Name: idx_donations_donor_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_donations_donor_user_id ON public.donations USING btree (donor_user_id);


--
-- Name: idx_questions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_questions_status ON public.questions USING btree (status);


--
-- Name: idx_questions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_questions_user_id ON public.questions USING btree (user_id);


--
-- Name: idx_study_materials_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_study_materials_category_id ON public.study_materials USING btree (category_id);


--
-- Name: idx_study_materials_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_study_materials_user_id ON public.study_materials USING btree (user_id);


--
-- Name: idx_subscriptions_tier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_tier ON public.subscriptions USING btree (tier);


--
-- Name: idx_subscriptions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions USING btree (user_id);


--
-- Name: idx_transactions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_user_id ON public.transactions USING btree (user_id);


--
-- Name: profiles on_profile_created_create_subscription; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_profile_created_create_subscription AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.create_user_subscription();


--
-- Name: profiles on_profile_created_create_wallet; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_profile_created_create_wallet AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.create_user_wallet();


--
-- Name: ad_views ad_views_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_views
    ADD CONSTRAINT ad_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: answer_ratings answer_ratings_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_ratings
    ADD CONSTRAINT answer_ratings_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.answers(id) ON DELETE CASCADE;


--
-- Name: answer_ratings answer_ratings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer_ratings
    ADD CONSTRAINT answer_ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: answers answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: answers answers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: contributor_profiles contributor_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contributor_profiles
    ADD CONSTRAINT contributor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: discussion_replies discussion_replies_discussion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussion_replies
    ADD CONSTRAINT discussion_replies_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES public.discussions(id) ON DELETE CASCADE;


--
-- Name: discussion_replies discussion_replies_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussion_replies
    ADD CONSTRAINT discussion_replies_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: discussions discussions_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.discussion_boards(id) ON DELETE CASCADE;


--
-- Name: discussions discussions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discussions
    ADD CONSTRAINT discussions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: donations donations_donor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.donations
    ADD CONSTRAINT donations_donor_user_id_fkey FOREIGN KEY (donor_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: material_reviews material_reviews_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_reviews
    ADD CONSTRAINT material_reviews_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.study_materials(id) ON DELETE CASCADE;


--
-- Name: material_reviews material_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_reviews
    ADD CONSTRAINT material_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profile_verifications profile_verifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_verifications
    ADD CONSTRAINT profile_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: questions questions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: study_materials study_materials_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_materials
    ADD CONSTRAINT study_materials_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.material_categories(id) ON DELETE SET NULL;


--
-- Name: study_materials study_materials_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.study_materials
    ADD CONSTRAINT study_materials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_badges user_badges_badge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id) ON DELETE CASCADE;


--
-- Name: user_badges user_badges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: wallets wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: work_requests work_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_requests
    ADD CONSTRAINT work_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: answers Anyone can view answers to public questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view answers to public questions" ON public.answers FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.questions
  WHERE ((questions.id = answers.question_id) AND ((questions.is_private = false) OR (questions.user_id = auth.uid()))))));


--
-- Name: badges Anyone can view badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);


--
-- Name: material_categories Anyone can view categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view categories" ON public.material_categories FOR SELECT USING (true);


--
-- Name: discussion_boards Anyone can view discussion boards; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view discussion boards" ON public.discussion_boards FOR SELECT USING (true);


--
-- Name: discussions Anyone can view discussions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view discussions" ON public.discussions FOR SELECT USING (true);


--
-- Name: donations Anyone can view non-anonymous donations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view non-anonymous donations" ON public.donations FOR SELECT USING (((is_anonymous = false) OR (auth.uid() = donor_user_id)));


--
-- Name: premium_features Anyone can view premium features; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view premium features" ON public.premium_features FOR SELECT USING (true);


--
-- Name: questions Anyone can view public questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view public questions" ON public.questions FOR SELECT USING (((is_private = false) OR (auth.uid() = user_id)));


--
-- Name: blog_posts Anyone can view published blog posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts FOR SELECT USING (((published = true) OR (auth.uid() = author_id)));


--
-- Name: answer_ratings Anyone can view ratings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view ratings" ON public.answer_ratings FOR SELECT USING (true);


--
-- Name: discussion_replies Anyone can view replies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view replies" ON public.discussion_replies FOR SELECT USING (true);


--
-- Name: material_reviews Anyone can view reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view reviews" ON public.material_reviews FOR SELECT USING (true);


--
-- Name: study_materials Anyone can view study materials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view study materials" ON public.study_materials FOR SELECT USING (true);


--
-- Name: user_badges Anyone can view user badges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view user badges" ON public.user_badges FOR SELECT USING (true);


--
-- Name: work_requests Anyone can view work requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view work requests" ON public.work_requests FOR SELECT USING (true);


--
-- Name: answers Authenticated users can create answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create answers" ON public.answers FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: blog_posts Authenticated users can create blog posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create blog posts" ON public.blog_posts FOR INSERT WITH CHECK ((auth.uid() = author_id));


--
-- Name: discussions Authenticated users can create discussions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create discussions" ON public.discussions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: donations Authenticated users can create donations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create donations" ON public.donations FOR INSERT WITH CHECK ((auth.uid() = donor_user_id));


--
-- Name: study_materials Authenticated users can create materials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create materials" ON public.study_materials FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: questions Authenticated users can create questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create questions" ON public.questions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: discussion_replies Authenticated users can create replies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create replies" ON public.discussion_replies FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: material_reviews Authenticated users can create reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create reviews" ON public.material_reviews FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: work_requests Authenticated users can create work requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create work requests" ON public.work_requests FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: answer_ratings Authenticated users can rate answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can rate answers" ON public.answer_ratings FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: blog_posts Authors can delete their own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can delete their own posts" ON public.blog_posts FOR DELETE USING ((auth.uid() = author_id));


--
-- Name: blog_posts Authors can update their own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can update their own posts" ON public.blog_posts FOR UPDATE USING ((auth.uid() = author_id));


--
-- Name: profile_verifications Users can create verification request; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create verification request" ON public.profile_verifications FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: answers Users can delete their own answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own answers" ON public.answers FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: discussions Users can delete their own discussions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own discussions" ON public.discussions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: study_materials Users can delete their own materials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own materials" ON public.study_materials FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: questions Users can delete their own questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own questions" ON public.questions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: discussion_replies Users can delete their own replies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own replies" ON public.discussion_replies FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: material_reviews Users can delete their own reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own reviews" ON public.material_reviews FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: work_requests Users can delete their own work requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own work requests" ON public.work_requests FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: ad_views Users can insert their own ad views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own ad views" ON public.ad_views FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: contributor_profiles Users can insert their own contributor profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own contributor profile" ON public.contributor_profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: answers Users can update their own answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own answers" ON public.answers FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: contributor_profiles Users can update their own contributor profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own contributor profile" ON public.contributor_profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: discussions Users can update their own discussions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own discussions" ON public.discussions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: study_materials Users can update their own materials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own materials" ON public.study_materials FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: questions Users can update their own questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own questions" ON public.questions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: answer_ratings Users can update their own ratings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own ratings" ON public.answer_ratings FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: discussion_replies Users can update their own replies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own replies" ON public.discussion_replies FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: material_reviews Users can update their own reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own reviews" ON public.material_reviews FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: subscriptions Users can update their own subscription; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own subscription" ON public.subscriptions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profile_verifications Users can update their own verification; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own verification" ON public.profile_verifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: wallets Users can update their own wallet; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own wallet" ON public.wallets FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: work_requests Users can update their own work requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own work requests" ON public.work_requests FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: ad_views Users can view their own ad views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own ad views" ON public.ad_views FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: contributor_profiles Users can view their own contributor profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own contributor profile" ON public.contributor_profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: donations Users can view their own donations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own donations" ON public.donations FOR SELECT USING ((auth.uid() = donor_user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: subscriptions Users can view their own subscription; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own subscription" ON public.subscriptions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: transactions Users can view their own transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profile_verifications Users can view their own verification; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own verification" ON public.profile_verifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: wallets Users can view their own wallet; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own wallet" ON public.wallets FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ad_views; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;

--
-- Name: answer_ratings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.answer_ratings ENABLE ROW LEVEL SECURITY;

--
-- Name: answers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

--
-- Name: badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: contributor_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contributor_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: discussion_boards; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.discussion_boards ENABLE ROW LEVEL SECURITY;

--
-- Name: discussion_replies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;

--
-- Name: discussions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

--
-- Name: donations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

--
-- Name: material_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.material_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: material_reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.material_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: premium_features; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.premium_features ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_verifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile_verifications ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

--
-- Name: study_materials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_badges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: wallets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

--
-- Name: work_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.work_requests ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;