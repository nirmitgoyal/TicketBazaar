--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

-- Started on 2025-06-09 11:15:13 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 216 (class 1259 OID 24577)
-- Name: contact_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_requests (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    requester_id integer NOT NULL,
    seller_id integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone,
    contact_method text,
    message text,
    offered_price double precision,
    meeting_location text,
    preferred_time text,
    responded_at timestamp without time zone
);


--
-- TOC entry 215 (class 1259 OID 24576)
-- Name: contact_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3449 (class 0 OID 0)
-- Dependencies: 215
-- Name: contact_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_requests_id_seq OWNED BY public.contact_requests.id;


--
-- TOC entry 231 (class 1259 OID 98319)
--

    id integer NOT NULL,
    user_id integer NOT NULL,
    amount double precision NOT NULL,
    type text NOT NULL,
    description text NOT NULL,
    ticket_id integer,
    created_at timestamp without time zone DEFAULT now()
);


--
-- TOC entry 230 (class 1259 OID 98318)
--

    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3450 (class 0 OID 0)
-- Dependencies: 230
--



--
-- TOC entry 229 (class 1259 OID 98308)
--

    id integer NOT NULL,
    referrer_id integer NOT NULL,
    referee_id integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    completed_at timestamp without time zone,
    rewarded_at timestamp without time zone
);


--
-- TOC entry 228 (class 1259 OID 98307)
--

    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3451 (class 0 OID 0)
-- Dependencies: 228
--



--
-- TOC entry 225 (class 1259 OID 32768)
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 73729)
-- Name: ticket_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_views (
    id integer NOT NULL,
    user_id integer NOT NULL,
    ticket_id integer NOT NULL,
    event_id integer NOT NULL,
    viewed_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 226 (class 1259 OID 73728)
-- Name: ticket_views_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ticket_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3452 (class 0 OID 0)
-- Dependencies: 226
-- Name: ticket_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ticket_views_id_seq OWNED BY public.ticket_views.id;


--
-- TOC entry 218 (class 1259 OID 24599)
-- Name: tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    seller_id integer NOT NULL,
    title text NOT NULL,
    section text NOT NULL,
    "row" text,
    seat text,
    quantity integer NOT NULL,
    status text DEFAULT 'available'::text NOT NULL,
    is_transferrable boolean DEFAULT true,
    transfer_method text,
    additional_info text,
    show_contact_info boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp without time zone,
    verification_code text,
    qr_code text,
    verified boolean DEFAULT false,
    is_verified boolean DEFAULT false,
    verification_status text DEFAULT 'pending'::text,
    verification_notes text,
    verified_at timestamp without time zone,
    verified_by integer,
    price double precision NOT NULL,
    event_title text DEFAULT ''::text NOT NULL,
    event_description text,
    venue text DEFAULT ''::text NOT NULL,
    event_date timestamp without time zone DEFAULT now() NOT NULL,
    category text DEFAULT 'events'::text NOT NULL,
    event_image_url text,
    trending boolean DEFAULT false,
    selling_fast boolean DEFAULT false,
    latitude double precision,
    longitude double precision,
    city text DEFAULT ''::text NOT NULL,
    venue_address text
);


--
-- TOC entry 217 (class 1259 OID 24598)
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3453 (class 0 OID 0)
-- Dependencies: 217
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- TOC entry 220 (class 1259 OID 24612)
-- Name: user_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_feedback (
    id integer NOT NULL,
    user_id integer NOT NULL,
    ticket_id integer,
    feedback_type text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp without time zone
);


--
-- TOC entry 219 (class 1259 OID 24611)
-- Name: user_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3454 (class 0 OID 0)
-- Dependencies: 219
-- Name: user_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_feedback_id_seq OWNED BY public.user_feedback.id;


--
-- TOC entry 222 (class 1259 OID 24623)
-- Name: user_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_reviews (
    id integer NOT NULL,
    reviewer_id integer NOT NULL,
    user_id integer NOT NULL,
    ticket_id integer,
    rating integer NOT NULL,
    comment text,
    verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    contact_request_id integer,
    review_type text
);


--
-- TOC entry 221 (class 1259 OID 24622)
-- Name: user_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3455 (class 0 OID 0)
-- Dependencies: 221
-- Name: user_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_reviews_id_seq OWNED BY public.user_reviews.id;


--
-- TOC entry 224 (class 1259 OID 24634)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    password text NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    whatsapp text,
    rating double precision DEFAULT 0,
    ratings_count integer DEFAULT 0,
    preferred_contact_method text DEFAULT 'whatsapp'::text,
    instagram text
);


--
-- TOC entry 223 (class 1259 OID 24633)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3456 (class 0 OID 0)
-- Dependencies: 223
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3219 (class 2604 OID 24580)
-- Name: contact_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_requests ALTER COLUMN id SET DEFAULT nextval('public.contact_requests_id_seq'::regclass);


--
-- TOC entry 3253 (class 2604 OID 98322)
--



--
-- TOC entry 3250 (class 2604 OID 98311)
--



--
-- TOC entry 3248 (class 2604 OID 73732)
-- Name: ticket_views id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_views ALTER COLUMN id SET DEFAULT nextval('public.ticket_views_id_seq'::regclass);


--
-- TOC entry 3222 (class 2604 OID 24602)
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- TOC entry 3237 (class 2604 OID 24615)
-- Name: user_feedback id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_feedback ALTER COLUMN id SET DEFAULT nextval('public.user_feedback_id_seq'::regclass);


--
-- TOC entry 3240 (class 2604 OID 24626)
-- Name: user_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_reviews ALTER COLUMN id SET DEFAULT nextval('public.user_reviews_id_seq'::regclass);


--
-- TOC entry 3243 (class 2604 OID 24637)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3428 (class 0 OID 24577)
-- Dependencies: 216
-- Data for Name: contact_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_requests (id, ticket_id, requester_id, seller_id, status, created_at, completed_at, contact_method, message, offered_price, meeting_location, preferred_time, responded_at) FROM stdin;
1       3       2       4       pending 2025-05-26 19:00:14.729067      \N      whatsapp        f       \N      \N      \N      \N
2       5       2       3       pending 2025-05-26 19:00:32.431084      \N      phone   f       \N      \N      \N      \N
3       3       2       4       pending 2025-05-26 19:06:30.690992      \N      whatsapp        k       \N      \N      \N      \N
4       6       2       4       pending 2025-05-26 19:12:32.582601      \N      whatsapp        k       \N      \N      \N      \N
5       3       2       4       pending 2025-05-26 19:18:05.225707      \N      whatsapp        j       \N      \N      \N      \N
6       2       2       3       pending 2025-05-26 19:28:48.165813      \N      whatsapp        m       \N      \N      \N      \N
7       4       2       5       pending 2025-05-26 19:29:04.620485      \N      whatsapp        ,       \N      \N      \N      \N
8       6       2       4       pending 2025-05-26 19:29:35.544627      \N      whatsapp        ,,      \N      \N      \N      \N
9       2       2       3       pending 2025-05-26 19:30:11.893239      \N      whatsapp        ,,,,    \N      \N      \N      \N
10      4       2       5       pending 2025-05-26 19:40:33.660251      \N      whatsapp        mm      \N      \N      \N      \N
\.


--
-- TOC entry 3443 (class 0 OID 98319)
-- Dependencies: 231
--

\.


--
-- TOC entry 3441 (class 0 OID 98308)
-- Dependencies: 229
--

\.


--
-- TOC entry 3437 (class 0 OID 32768)
-- Dependencies: 225
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
COCm7BQMWonKPSjeWxbo7k7PPvxLKonv        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-09T09:44:00.671Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":28}} 2025-07-09 09:44:01
D1rj-HibFonkkPJIcjcKOs0-bP_fBvyG        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-09T09:47:09.700Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":28}} 2025-07-09 09:47:10
r4JFpd-MCixHhcm5_U4r1utCvnj1JEgP        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-28T13:10:30.389Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}        2025-06-28 13:10:31
AmYmaakTvBRUBRvlVNmpqZL452dyfmOP        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-27T09:54:53.658Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}        2025-06-27 09:54:55
HAYYzr-vTAxnBUKvzaXnVGPyTvZ002gb        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-09T09:49:07.021Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":28}} 2025-07-09 09:49:14
Gyg6mVPNtJdiXFgNBE_uqu32aSHtuoME        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-09T09:51:08.423Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":28}} 2025-07-09 09:51:09
Cb3Ox-evbfcKnmgW4DzgqXC3EBRsNQzP        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-09T09:53:36.724Z","secure":false,"httpOnly":false,"path":"/","sameSite":"lax"},"passport":{"user":28}}        2025-07-09 09:53:37
O2mHYH1sfCpPRPG0xwsx6MU_jet934gC        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-09T09:55:15.042Z","secure":false,"httpOnly":false,"path":"/","sameSite":"lax"},"passport":{"user":28}}        2025-07-09 09:55:16
JxWHwQBLY3n-tJFHPPZOgYss9M24FxmH        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-04T07:54:43.511Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":6}}  2025-07-09 11:12:23
ZbNFN4UI7KKJXtkG0-hURqI_XU9Dat1b        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-04T07:29:15.226Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"passport":{"user":6}}  2025-07-04 07:30:06
osdl3kpZsirQeYsEIfHNjnuhdF1OqfsY        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-28T13:13:49.690Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}        2025-06-28 13:13:51
kXmcVv_CqkLfP66H4dPrBojRkLFOMPZ9        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-28T12:27:06.295Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"}}        2025-06-28 12:28:49
rOymY6WZ1qLTu5MCv7bUgNZuuvKho9dw        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-27T09:42:07.393Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":6}}  2025-06-27 09:42:08
ykg0mDlygaJE9Aq3oZ_q9N5ELOpXc6MW        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-29T13:31:17.408Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}        2025-06-29 13:31:18
1-EtExERn6UPNPQEovQYhV8WsQjaQYLM        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-29T13:31:19.102Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}        2025-06-29 13:31:20
k-ufyiiAChTPd--EzC0JbtbTCCKAyvb1        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-30T18:37:23.217Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"passport":{"user":6}}  2025-07-02 08:29:18
6BcNOhSu8Iu6-SC8OaJrfnAzPHu752gF        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-06T08:51:42.807Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}        2025-07-06 08:51:44
_whVErSU-_QfgHdFV0Fe8S9BKnmKRd2-        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-04T07:46:52.747Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"passport":{"user":6}}  2025-07-04 08:39:38
2Y3sQ9W1BQ4HU-DSebz5h4vwOY_TirjE        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-27T09:39:13.439Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}        2025-06-27 09:39:14
YxKVzbSDIMjG6tFjr1Hprquxdk7RuU2R        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-29T13:31:18.087Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}        2025-06-29 13:31:19
9YImYrrSf2xHD_o0JuN_2yLxV1kvFM3m        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-29T13:31:19.296Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}        2025-06-29 13:31:21
nmu8P-RkCBLJ1VW5ZWMQkJUnzrIeT7EI        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-06T08:51:45.128Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}        2025-07-08 08:37:28
WYHsCDlqg97akayQ4BPAoiCaaphZ55ZC        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-28T13:10:29.609Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}        2025-06-28 13:10:31
aCXHaIBxnrmNjVv7qHmu1aqxrnmTayFE        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-09T09:47:24.609Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":28}} 2025-07-09 09:47:25
_aOa-1ipaqya_UXBno09GqDhUFbB68xz        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-09T09:51:58.330Z","secure":false,"httpOnly":false,"path":"/","sameSite":"lax"},"passport":{"user":28}}        2025-07-09 09:52:05
HLHJuIJmgdUhUkdsYs--CWUWyNR53r-t        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-02T15:56:22.199Z","secure":true,"httpOnly":true,"path":"/","sameSite":"none"},"passport":{"user":18}} 2025-07-06 12:40:53
luHa9_-HpBTxCYl6SXK6ts5kTGX2qX-5        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-28T13:13:49.380Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"}}        2025-06-28 13:13:50
FKd8rxjlsOMpQjxPWcOwPsw5xTYLf6h9        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-09T09:57:03.132Z","secure":false,"httpOnly":false,"path":"/","sameSite":"lax"},"passport":{"user":28}}        2025-07-09 09:57:04
dZ87PTMSzrfWYOBaNO5_vTY-MSf1-wRZ        {"cookie":{"originalMaxAge":2592000000,"expires":"2025-07-09T09:54:01.155Z","secure":false,"httpOnly":false,"path":"/","sameSite":"lax"},"passport":{"user":28}}        2025-07-09 09:57:43
\.


--
-- TOC entry 3439 (class 0 OID 73729)
-- Dependencies: 227
-- Data for Name: ticket_views; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ticket_views (id, user_id, ticket_id, event_id, viewed_at) FROM stdin;
1       18      17      49      2025-06-04 03:52:05.438154
2       18      18      50      2025-06-03 05:52:05.438154
3       18      17      49      2025-06-01 05:52:05.438154
\.


--
-- TOC entry 3430 (class 0 OID 24599)
-- Dependencies: 218
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tickets (id, seller_id, title, section, "row", seat, quantity, status, is_transferrable, transfer_method, additional_info, show_contact_info, created_at, expires_at, verification_code, qr_code, verified, is_verified, verification_status, verification_notes, verified_at, verified_by, price, event_title, event_description, venue, event_date, category, event_image_url, trending, selling_fast, latitude, longitude, city, venue_address) FROM stdin;
23      18      test Tickets    General \N      \N      2       available       t       electronic              t       2025-06-04 10:59:07.33735       \N      \N      \N      f       f       pending \N      \N      \N      0       test    test at Phoenix Arena   Phoenix Arena   2025-06-12 16:29:00     sports  \N      f       f       17.4453131      78.3748011      Telangana 500081        TSIIC Park, opposite to HSBC, Phase 2, HITEC City, Hyderabad, Telangana 500081, India
35      24      Arijit Singh Live in Concert - VIP Tickets      VIP Block A     Row 5   Seat 12-13      2       available       t       electronic      Premium VIP experience with meet and greet opportunity. Original BookMyShow tickets.    t       2025-06-06 10:32:46.122624      \N      \N      \N      f       f       pending \N      \N      \N      8500    Arijit Singh Live in Concert    The king of Bollywood playback singing performs live with his greatest hits including Tum Hi Ho, Channa Mereya, and Ae Dil Hai Mushkil. DY Patil Stadium        2025-07-15 19:30:00     concert https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800      t       t       19.033  73.0297 mumbai  DY Patil Stadium, Nerul, Navi Mumbai, Maharashtra 400706
36      25      Coldplay Music of the Spheres World Tour        Gold Circle     Standing        General Admission       1       available       t       electronic      Official Paytm Insider tickets. Best view of the main stage.    t       2025-06-06 10:32:46.372432      \N      \N      \N      f       f       pending \N      \N      \N      12000   Coldplay Music of the Spheres World Tour        British rock band Coldplay returns to India with their spectacular Music of the Spheres World Tour featuring hits like Yellow, Fix You, and Viva La Vida.       Narendra Modi Stadium   2025-08-22 19:00:00     concert https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800      t       t       23.0927 72.5953 ahmedabad       Narendra Modi Stadium, Ahmedabad, Gujarat 382475
37      26      Diljit Dosanjh Born to Shine Tour       Premium Row 15  Seat 45-46      2       available       t       in-person       Great seats with clear view. Selling due to travel conflict.    t       2025-06-06 10:32:46.616563      \N      \N      \N      f       f       pending \N      \N      \N      6500    Diljit Dosanjh Born to Shine Tour       Punjabi superstar Diljit Dosanjh brings his Born to Shine tour to India with hits like G.O.A.T, Do You Know, and Clash. Jawaharlal Nehru Stadium        2025-06-28 20:00:00     concert https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800      t       f       28.5706 77.2335 delhi   Jawaharlal Nehru Stadium, Lodhi Road, New Delhi 110003
38      24      India vs England ODI Series - Final Match       Club House      Tier 2  Block J, Row 8, Seat 25-26      2       available       t       electronic      Premium club house tickets with air conditioning and catering.  t       2025-06-06 10:32:46.858595      \N      \N      \N      f       f       pending \N      \N      \N      4500    India vs England ODI Series - Final Match       Witness the thrilling finale of the India vs England ODI series at the iconic Eden Gardens.     Eden Gardens    2025-07-05 14:30:00     sports  https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800      t       t       22.5645 88.3433 kolkata Eden Gardens, Maidan, Kolkata, West Bengal 700021
39      25      IPL 2025 Final - Premium Hospitality    Hospitality Pavilion    Premium Table for 4     1       available       t       electronic      Premium hospitality package includes food, beverages, and VIP parking.  t       2025-06-06 10:32:47.101185      \N      \N      \N      f       f       pending \N      \N      \N      25000   IPL 2025 Final  The biggest cricket match of the year - IPL Final 2025 with the top two teams battling for the championship.    Wankhede Stadium        2025-06-15 19:30:00     sports  https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800      t       t       18.9388 72.8258 mumbai  Wankhede Stadium, Churchgate, Mumbai, Maharashtra 400020
40      26      Zakir Khan Live - Haq Se Single Tour    Gold    Row 8   Seat 15-16      2       available       t       electronic      Front section seats. Original Insider tickets.  t       2025-06-06 10:32:47.346402      \N      \N      \N      f       f       pending \N      \N      \N      1200    Zakir Khan Live - Haq Se Single Tour    India's favorite stand-up comedian Zakir Khan returns with his hilarious new show about being single and loving it.     Phoenix Marketcity      2025-07-20 20:00:00     comedy  https://images.unsplash.com/photo-1585699975055-600f8061b5be?w=800      f       f       19.0821 72.8822 mumbai  Phoenix Marketcity, Kurla West, Mumbai, Maharashtra 400070
41      24      Mughal-E-Azam Musical - Premium Orchestra       Orchestra       Row 12  Seat 8-9        2       available       t       in-person       Premium orchestra seats with excellent acoustics. Includes intermission refreshments.   t       2025-06-06 10:32:47.593409      \N      \N      \N      f       f       pending \N      \N      \N      3500    Mughal-E-Azam - The Musical     The grand musical adaptation of the classic Bollywood film Mughal-E-Azam with spectacular sets, costumes, and live orchestra.   NCPA Tata Theatre       2025-08-10 19:30:00     theatre https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800      f       f       18.9233 72.8207 mumbai  National Centre for the Performing Arts, Nariman Point, Mumbai, Maharashtra 400021
42      25      Sunburn Festival Goa 2025 - 3-Day Pass  General Admission       Standing        3-Day Pass      1       available       t       electronic      Full 3-day festival pass. Includes access to all stages and activities. t       2025-06-06 10:32:47.833569      \N      \N      \N      f       f       pending \N      \N      \N      8900    Sunburn Festival Goa 2025       Asia's largest electronic dance music festival returns to Goa with world-class DJs, spectacular stages, and beach vibes.        Vagator Beach   2025-12-28 16:00:00     festival        https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800      t       f       15.6014 73.7442 goa     Vagator Beach, Bardez, Goa 403509
46      6       Shreya Ghoshal Live Tour 2025   Platinum        Row 3   Seat 12-13      2       available       t       electronic      Premium front row seats with VIP parking included.      t       2025-06-06 10:33:37.347772      \N      \N      \N      f       f       pending \N      \N      \N      7500    Shreya Ghoshal Live in Concert  The nightingale of Bollywood Shreya Ghoshal performs her melodious hits live.   Thyagaraj Sports Complex        2025-09-15 19:30:00     concert https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800      t       t       28.5678 77.2412 delhi   Thyagaraj Sports Complex, INA, New Delhi 110023
47      18      T20 World Cup 2025 - India vs Pakistan  Corporate Box   Box 15  Seats 1-4       4       available       t       electronic      Premium corporate box with catering and AC. Historic India-Pakistan clash.      t       2025-06-06 10:33:37.592046      \N      \N      \N      f       f       pending \N      \N      \N      15000   T20 World Cup 2025 - India vs Pakistan  The most anticipated cricket match - India vs Pakistan in T20 World Cup 2025.   Eden Gardens    2025-10-12 14:30:00     sports  https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800      t       t       22.5645 88.3433 kolkata Eden Gardens, Maidan, Kolkata, West Bengal 700021
48      1       Coldplay Concert Mumbai VIP     A       15      2       available       t       \N      \N      t       2025-06-08 13:00:15.467721      \N      \N      \N      f       f       pending \N      \N      \N      8500    Coldplay Music of the Spheres World Tour        Experience the magic of Coldplay live in Mumbai DY Patil Stadium        2024-01-15 19:30:00     concerts        https://example.com/coldplay.jpg        t       f       19.033  73.0297 Mumbai  D.Y. Patil Stadium, Navi Mumbai, Maharashtra 400614
49      1       IPL Final Delhi Premium B       25      1       available       t       \N      \N      t       2025-06-08 13:00:15.467721      \N      \N      \N      f       f       pending \N      \N      \N      12000   IPL 2024 Final  The ultimate cricket showdown   Arun Jaitley Stadium    2024-05-26 15:30:00     sports  https://example.com/ipl.jpg     f       t       28.6139 77.209  Delhi   Arun Jaitley Stadium, New Delhi, Delhi 110002
50      1       Comedy Nights Bangalore General C       10      4       available       t       \N      \N      t       2025-06-08 13:00:15.467721      \N      \N      \N      f       f       pending \N      \N      \N      1500    Stand Up Comedy Special An evening of laughter with top comedians       Phoenix Marketcity      2024-02-10 20:00:00     comedy  https://example.com/comedy.jpg  f       f       12.9698 77.75   Bangalore       Phoenix Marketcity, Whitefield, Bangalore
\.


--
-- TOC entry 3432 (class 0 OID 24612)
-- Dependencies: 220
-- Data for Name: user_feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_feedback (id, user_id, ticket_id, feedback_type, description, status, created_at, reviewed_at) FROM stdin;
\.


--
-- TOC entry 3434 (class 0 OID 24623)
-- Dependencies: 222
-- Data for Name: user_reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_reviews (id, reviewer_id, user_id, ticket_id, rating, comment, verified, created_at, updated_at, contact_request_id, review_type) FROM stdin;
\.


--
-- TOC entry 3436 (class 0 OID 24634)
-- Dependencies: 224
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, password, full_name, email, phone, whatsapp, rating, ratings_count, preferred_contact_method, instagram) FROM stdin;
19      $2b$10$OfoPmLbZXthYAC.d0Y9BceVJLTUiX4fBHhUG0wTeFgH9SJ54buiwW    Raj Patel       raj.patel@gmail.com     9876543210      919876543210    4.8     25      whatsapp        raj_musiclover
20      $2b$10$ULi0SAzgzVMXPf45I8nlQ.8GnJsGdivGobqLGgcwbDZMcgHjn/pYS    Priya Sharma    priya.sharma@yahoo.com  9876543211      919876543211    4.6     18      phone   priya_sportstickets
21      $2b$10$4V.bha/se3RybP6DoNJWM.7.bi.qy2I.dtE8FZC6kLeW6Ls4e04zC    Amit Kumar      amit.kumar@outlook.com  9876543212      919876543212    4.3     12      whatsapp        amit_eventlife
22      $2b$10$lL.nU4EAWs8c4rL4rTt8VOQYXv4B2l5iUWx/XAOHzkVIMmGiAp99e    Kavya Singh     kavya.singh@gmail.com   9876543213      919876543213    4.9     42      whatsapp        kavya_concerts
23      $2b$10$XJqQznzQbiDA.5CU0aeUCuTYQOkLRPna4J1G.103PBlFex/Kmwcv2    Rohit Mehta     rohit.mehta@rediffmail.com      9876543214      919876543214    4.2     8       phone   rohit_bollywoodfan
24      hashedpassword123       Rajesh Kumar    rajesh.kumar@gmail.com  +91-9876543210  +91-9876543210  4.8     25      whatsapp        @rajesh_mumbai
25      hashedpassword456       Priya Sharma    priya.sharma@gmail.com  +91-9876543211  +91-9876543211  4.6     18      instagram       @priya_delhi
26      hashedpassword789       Amit Patel      amit.patel@gmail.com    +91-9876543212  +91-9876543212  4.9     42      whatsapp        @amit_bangalore
27      $2b$10$F/dJXt.UmeeCeAlbYjuppeufQCcEc.CP93RqEKo3XNE.Tn4BTenF.    Test User       test@example.com        1234567890      \N      5       0       whatsapp        testuser
28      $2b$10$0TC8sXg9IMwC06SqvnXZ2.T//BPbn8OsGOrWsVSQh.tXgvzddaGke    Demo User       demo@ticketbazaar.com   9876543210      \N      5       0       whatsapp        demouser
29      $2b$10$D2dkK7icGVID0T6eBtgoPup16zge4UgbFyfd2eQR8ifA8/gKqmuY6    Refer   refer@ticketbazaar.co.in        9924    \N      5       0       whatsapp        @sdg
7       298de948f749723d        Nirmit Goyal    nirmit.goyal@universityliving.com               \N      5       0       whatsapp        pending_update
6       0f01af8dbc075e7d        Parth .G        parth23348134@gmail.com +91 7838454257  \N      5       0       whatsapp        pending_update
18      965b6da98f171d31        Nirmit Goyal    nirmitgoyal.goyal@gmail.com             \N      5       0       whatsapp        nirmit__goyal
\.


--
-- TOC entry 3457 (class 0 OID 0)
-- Dependencies: 215
-- Name: contact_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contact_requests_id_seq', 10, true);


--
-- TOC entry 3458 (class 0 OID 0)
-- Dependencies: 230
--



--
-- TOC entry 3459 (class 0 OID 0)
-- Dependencies: 228
--



--
-- TOC entry 3460 (class 0 OID 0)
-- Dependencies: 226
-- Name: ticket_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ticket_views_id_seq', 3, true);


--
-- TOC entry 3461 (class 0 OID 0)
-- Dependencies: 217
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tickets_id_seq', 50, true);


--
-- TOC entry 3462 (class 0 OID 0)
-- Dependencies: 219
-- Name: user_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_feedback_id_seq', 1, false);


--
-- TOC entry 3463 (class 0 OID 0)
-- Dependencies: 221
-- Name: user_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_reviews_id_seq', 1, false);


--
-- TOC entry 3464 (class 0 OID 0)
-- Dependencies: 223
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 29, true);


--
-- TOC entry 3256 (class 2606 OID 24586)
-- Name: contact_requests contact_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_requests
    ADD CONSTRAINT contact_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 3281 (class 2606 OID 98327)
--



--
-- TOC entry 3279 (class 2606 OID 98317)
--



--
-- TOC entry 3272 (class 2606 OID 32774)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 3274 (class 2606 OID 73735)
-- Name: ticket_views ticket_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_views
    ADD CONSTRAINT ticket_views_pkey PRIMARY KEY (id);


--
-- TOC entry 3259 (class 2606 OID 24610)
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 3261 (class 2606 OID 24621)
-- Name: user_feedback user_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_feedback
    ADD CONSTRAINT user_feedback_pkey PRIMARY KEY (id);


--
-- TOC entry 3263 (class 2606 OID 24632)
-- Name: user_reviews user_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_reviews
    ADD CONSTRAINT user_reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 3265 (class 2606 OID 24648)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 3267 (class 2606 OID 24644)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3269 (class 2606 OID 98306)
--

ALTER TABLE ONLY public.users


--
-- TOC entry 3270 (class 1259 OID 32775)
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- TOC entry 3282 (class 1259 OID 106500)
--



--
-- TOC entry 3283 (class 1259 OID 106499)
--



--
-- TOC entry 3275 (class 1259 OID 106498)
--



--
-- TOC entry 3276 (class 1259 OID 106497)
--



--
-- TOC entry 3277 (class 1259 OID 106496)
--



--
-- TOC entry 3257 (class 1259 OID 65540)
-- Name: idx_tickets_seller_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_seller_id ON public.tickets USING btree (seller_id);


-- Completed on 2025-06-09 11:15:36 UTC

--
-- PostgreSQL database dump complete