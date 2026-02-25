<?php

namespace Datlechin\TagPasswords;

use Datlechin\TagPasswords\Api\Controller\AuthController;
use Datlechin\TagPasswords\Api\DiscussionResourceFields;
use Datlechin\TagPasswords\Api\PostResourceFields;
use Datlechin\TagPasswords\Api\TagResourceFields;
use Flarum\Api\Resource\DiscussionResource;
use Flarum\Api\Resource\PostResource;
use Flarum\Discussion\Discussion;
use Flarum\Extend;
use Flarum\Tags\Api\Resource\TagResource;
use Flarum\Tags\Tag;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js'),

    new Extend\Locales(__DIR__ . '/locale'),

    (new Extend\ApiResource(TagResource::class))
        ->fields(TagResourceFields::class),

    (new Extend\ApiResource(DiscussionResource::class))
        ->fields(DiscussionResourceFields::class)
        ->field('slug', [DiscussionResourceFields::class, 'slug'])
        ->field('title', [DiscussionResourceFields::class, 'title']),

    (new Extend\ApiResource(PostResource::class))
        ->fields(PostResourceFields::class)
        ->field('content', [PostResourceFields::class, 'content'])
        ->field('contentHtml', [PostResourceFields::class, 'contentHtml']),

    (new Extend\Policy())
        ->modelPolicy(Discussion::class, Policy\DiscussionPolicy::class)
        ->modelPolicy(Tag::class, Policy\TagPolicy::class),

    (new Extend\Routes('api'))
        ->post('/datlechin/tag-passwords/auth', 'datlechin-tag-passwords.auth', AuthController::class),

    (new Extend\Settings())
        ->default('flarum-tag-passwords.display_unlock_icon', true)
        ->default('flarum-tag-passwords.display_protected_tag_from_sidebar', true)
        ->default('flarum-tag-passwords.display_protected_tag_from_tags_page', true)
        ->default('flarum-tag-passwords.display_protected_tag_from_discussion_list', false)
        ->default('flarum-tag-passwords.display_discussion_avatar', false)
        ->default('flarum-tag-passwords.display_protected_tag_from_post_list', false)
        ->default('flarum-tag-passwords.display_protected_tag_from_discussion_page', true),
];
