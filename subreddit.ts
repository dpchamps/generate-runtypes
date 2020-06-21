 import * as RT from "runtypes";
export const MediaEmbed = RT.Record({});
export type MediaEmbed = RT.Static<typeof MediaEmbed>;

export const DataDataCrosspostParentListData = RT.Record({
  approved_at_utc: RT.Null,
  subreddit: RT.String,
  selftext: RT.String,
  author_fullname: RT.String,
  saved: RT.Boolean,
  mod_reason_title: RT.Null,
  gilded: RT.Number,
  clicked: RT.Boolean,
  title: RT.String,
  subreddit_name_prefixed: RT.String,
  hidden: RT.Boolean,
  pwls: Union(RT.Number, RT.Null),
  link_flair_css_class: RT.Null,
  downs: RT.Number,
  top_awarded_type: RT.Null,
  hide_score: RT.Boolean,
  name: RT.String,
  quarantine: RT.Boolean,
  link_flair_text_color: RT.String,
  upvote_ratio: RT.Number,
  author_flair_background_color: Union(RT.Null, RT.String),
  subreddit_type: RT.String,
  ups: RT.Number,
  total_awards_received: RT.Number,
  media_embed: Union(MediaEmbed, MediaEmbed1),
  author_flair_template_id: Union(RT.String, RT.Null),
  is_original_content: RT.Boolean,
  secure_media: Union(RT.Null, SecureMedia),
  is_reddit_media_domain: RT.Boolean,
  is_meta: RT.Boolean,
  category: RT.Null,
  secure_media_embed: Union(MediaEmbed, SecureMediaEmbed),
  link_flair_text: RT.Null,
  can_mod_post: RT.Boolean,
  score: RT.Number,
  approved_by: RT.Null,
  author_premium: RT.Boolean,
  thumbnail: RT.String,
  edited: Union(RT.Boolean, RT.Number),
  author_flair_css_class: Union(RT.Null, RT.String),
  gildings: MediaEmbed,
  content_categories: RT.Null,
  is_self: RT.Boolean,
  mod_note: RT.Null,
  created: RT.Number,
  link_flair_type: RT.String,
  wls: Union(RT.Number, RT.Null),
  removed_by_category: RT.Null,
  banned_by: RT.Null,
  author_flair_type: RT.String,
  domain: RT.String,
  allow_live_comments: RT.Boolean,
  selftext_html: Union(RT.String, RT.Null),
  likes: RT.Null,
  suggested_sort: Union(RT.String, RT.Null),
  banned_at_utc: RT.Null,
  view_count: RT.Null,
  archived: RT.Boolean,
  no_follow: RT.Boolean,
  is_crosspostable: RT.Boolean,
  pinned: RT.Boolean,
  over_18: RT.Boolean,
  media_only: RT.Boolean,
  can_gild: RT.Boolean,
  spoiler: RT.Boolean,
  locked: RT.Boolean,
  author_flair_text: Union(RT.String, RT.Null),
  visited: RT.Boolean,
  removed_by: RT.Null,
  num_reports: RT.Null,
  distinguished: Union(RT.String, RT.Null),
  subreddit_id: RT.String,
  mod_reason_by: RT.Null,
  removal_reason: RT.Null,
  link_flair_background_color: RT.String,
  id: RT.String,
  is_robot_indexable: RT.Boolean,
  report_reasons: RT.Null,
  author: RT.String,
  discussion_type: RT.Null,
  num_comments: RT.Number,
  send_replies: RT.Boolean,
  whitelist_status: Union(RT.String, RT.Null),
  contest_mode: RT.Boolean,
  author_patreon_flair: RT.Boolean,
  author_flair_text_color: Union(RT.String, RT.Null),
  permalink: RT.String,
  parent_whitelist_status: Union(RT.String, RT.Null),
  stickied: RT.Boolean,
  url: RT.String,
  subreddit_subscribers: RT.Number,
  created_utc: RT.Number,
  num_crossposts: RT.Number,
  media: Union(RT.Null, SecureMedia),
  is_video: RT.Boolean,
});
export type DataDataCrosspostParentListData = RT.Static<
  typeof DataDataCrosspostParentListData
>;

export const SubredditChildren = RT.Record({
  kind: RT.String,
  data: Union(
    Data,
    Data1,
    DataData1,
    Data2,
    DataCrosspostParentListData,
    DataDataCrosspostParentListData,
    Data3
  ),
});
export type SubredditChildren = RT.Static<typeof SubredditChildren>;

export const DataData1 = RT.Record({
  approved_at_utc: RT.Null,
  subreddit: RT.String,
  selftext: RT.String,
  author_fullname: RT.String,
  saved: RT.Boolean,
  mod_reason_title: RT.Null,
  gilded: RT.Number,
  clicked: RT.Boolean,
  title: RT.String,
  subreddit_name_prefixed: RT.String,
  hidden: RT.Boolean,
  pwls: RT.Number,
  link_flair_css_class: RT.String,
  downs: RT.Number,
  top_awarded_type: RT.Null,
  hide_score: RT.Boolean,
  name: RT.String,
  quarantine: RT.Boolean,
  link_flair_text_color: RT.String,
  upvote_ratio: RT.Number,
  author_flair_background_color: RT.Null,
  subreddit_type: RT.String,
  ups: RT.Number,
  total_awards_received: RT.Number,
  media_embed: MediaEmbed,
  author_flair_template_id: RT.Null,
  is_original_content: RT.Boolean,
  secure_media: RT.Null,
  is_reddit_media_domain: RT.Boolean,
  is_meta: RT.Boolean,
  category: RT.Null,
  secure_media_embed: MediaEmbed,
  link_flair_text: RT.String,
  can_mod_post: RT.Boolean,
  score: RT.Number,
  approved_by: RT.Null,
  author_premium: RT.Boolean,
  thumbnail: RT.String,
  edited: Union(RT.Boolean, RT.Number),
  author_flair_css_class: RT.Null,
  gildings: MediaEmbed,
  content_categories: RT.Null,
  is_self: RT.Boolean,
  mod_note: RT.Null,
  created: RT.Number,
  link_flair_type: RT.String,
  wls: RT.Number,
  removed_by_category: RT.Null,
  banned_by: RT.Null,
  author_flair_type: RT.String,
  domain: RT.String,
  allow_live_comments: RT.Boolean,
  selftext_html: Union(RT.Null, RT.String),
  likes: RT.Null,
  suggested_sort: RT.Null,
  banned_at_utc: RT.Null,
  view_count: RT.Null,
  archived: RT.Boolean,
  no_follow: RT.Boolean,
  is_crosspostable: RT.Boolean,
  pinned: RT.Boolean,
  over_18: RT.Boolean,
  media_only: RT.Boolean,
  link_flair_template_id: RT.String,
  can_gild: RT.Boolean,
  spoiler: RT.Boolean,
  locked: RT.Boolean,
  author_flair_text: RT.Null,
  visited: RT.Boolean,
  removed_by: RT.Null,
  num_reports: RT.Null,
  distinguished: RT.Null,
  subreddit_id: RT.String,
  mod_reason_by: RT.Null,
  removal_reason: RT.Null,
  link_flair_background_color: RT.String,
  id: RT.String,
  is_robot_indexable: RT.Boolean,
  report_reasons: RT.Null,
  author: RT.String,
  discussion_type: RT.Null,
  num_comments: RT.Number,
  send_replies: RT.Boolean,
  whitelist_status: RT.String,
  contest_mode: RT.Boolean,
  author_patreon_flair: RT.Boolean,
  author_flair_text_color: RT.Null,
  permalink: RT.String,
  parent_whitelist_status: RT.String,
  stickied: RT.Boolean,
  url: RT.String,
  subreddit_subscribers: RT.Number,
  created_utc: RT.Number,
  num_crossposts: RT.Number,
  media: RT.Null,
  is_video: RT.Boolean,
});
export type DataData1 = RT.Static<typeof DataData1>;

export const Data2 = RT.Record({
  approved_at_utc: RT.Null,
  subreddit: RT.String,
  selftext: RT.String,
  author_fullname: RT.String,
  saved: RT.Boolean,
  mod_reason_title: RT.Null,
  gilded: RT.Number,
  clicked: RT.Boolean,
  title: RT.String,
  subreddit_name_prefixed: RT.String,
  hidden: RT.Boolean,
  pwls: RT.Number,
  link_flair_css_class: RT.Null,
  downs: RT.Number,
  top_awarded_type: RT.Null,
  hide_score: RT.Boolean,
  name: RT.String,
  quarantine: RT.Boolean,
  link_flair_text_color: RT.String,
  upvote_ratio: RT.Number,
  author_flair_background_color: RT.Null,
  subreddit_type: RT.String,
  ups: RT.Number,
  total_awards_received: RT.Number,
  media_embed: MediaEmbed,
  author_flair_template_id: RT.Null,
  is_original_content: RT.Boolean,
  secure_media: RT.Null,
  is_reddit_media_domain: RT.Boolean,
  is_meta: RT.Boolean,
  category: RT.Null,
  secure_media_embed: MediaEmbed,
  link_flair_text: RT.Null,
  can_mod_post: RT.Boolean,
  score: RT.Number,
  approved_by: RT.Null,
  author_premium: RT.Boolean,
  thumbnail: RT.String,
  edited: RT.Boolean,
  author_flair_css_class: RT.Null,
  gildings: MediaEmbed,
  content_categories: RT.Null,
  is_self: RT.Boolean,
  mod_note: RT.Null,
  crosspost_parent_list: RT.Array(CrosspostParentListData),
  created: RT.Number,
  link_flair_type: RT.String,
  wls: RT.Number,
  removed_by_category: RT.Null,
  banned_by: RT.Null,
  author_flair_type: RT.String,
  domain: RT.String,
  allow_live_comments: RT.Boolean,
  selftext_html: RT.Null,
  likes: RT.Null,
  suggested_sort: RT.Null,
  banned_at_utc: RT.Null,
  view_count: RT.Null,
  archived: RT.Boolean,
  no_follow: RT.Boolean,
  is_crosspostable: RT.Boolean,
  pinned: RT.Boolean,
  over_18: RT.Boolean,
  media_only: RT.Boolean,
  can_gild: RT.Boolean,
  spoiler: RT.Boolean,
  locked: RT.Boolean,
  author_flair_text: RT.Null,
  visited: RT.Boolean,
  removed_by: RT.Null,
  num_reports: RT.Null,
  distinguished: RT.Null,
  subreddit_id: RT.String,
  mod_reason_by: RT.Null,
  removal_reason: RT.Null,
  link_flair_background_color: RT.String,
  id: RT.String,
  is_robot_indexable: RT.Boolean,
  report_reasons: RT.Null,
  author: RT.String,
  discussion_type: RT.Null,
  num_comments: RT.Number,
  send_replies: RT.Boolean,
  whitelist_status: RT.String,
  contest_mode: RT.Boolean,
  author_patreon_flair: RT.Boolean,
  crosspost_parent: RT.String,
  author_flair_text_color: RT.Null,
  permalink: RT.String,
  parent_whitelist_status: RT.String,
  stickied: RT.Boolean,
  url: RT.String,
  subreddit_subscribers: RT.Number,
  created_utc: RT.Number,
  num_crossposts: RT.Number,
  media: RT.Null,
  is_video: RT.Boolean,
});
export type Data2 = RT.Static<typeof Data2>;

export const MediaEmbed1 = RT.Record({
  content: RT.String,
  width: RT.Number,
  scrolling: RT.Boolean,
  height: RT.Number,
});
export type MediaEmbed1 = RT.Static<typeof MediaEmbed1>;

export const Oembed = RT.Record({
  provider_url: RT.String,
  title: RT.String,
  html: RT.String,
  thumbnail_width: RT.Number,
  height: RT.Number,
  width: RT.Number,
  version: RT.String,
  author_name: RT.String,
  provider_name: RT.String,
  thumbnail_url: RT.String,
  type: RT.String,
  thumbnail_height: RT.Number,
  author_url: RT.String,
});
export type Oembed = RT.Static<typeof Oembed>;

export const SecureMedia = RT.Record({
  oembed: Oembed,
  type: RT.String,
});
export type SecureMedia = RT.Static<typeof SecureMedia>;

export const SecureMediaEmbed = RT.Record({
  content: RT.String,
  width: RT.Number,
  scrolling: RT.Boolean,
  media_domain_url: RT.String,
  height: RT.Number,
});
export type SecureMediaEmbed = RT.Static<typeof SecureMediaEmbed>;

export const Data3 = RT.Record({
  modhash: RT.String,
  dist: RT.Number,
  children: RT.Array(Children),
  after: RT.String,
  before: RT.Null,
});
export type Data3 = RT.Static<typeof Data3>;
