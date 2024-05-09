<?php

namespace Datlechin\TagPasswords;

use Datlechin\TagPasswords\Access\ScopeDiscussionVisibilityForAbility;
use Datlechin\TagPasswords\Api\Controller\AuthController;
use Datlechin\TagPasswords\Listener\AddTagAttributes;
use Datlechin\TagPasswords\Listener\AddDiscussionAttributes;
use Datlechin\TagPasswords\Listener\AddPostAttributes;
use Datlechin\TagPasswords\Listener\SavePasswordToDatabase;
use Flarum\Discussion\Discussion;
use Flarum\Tags\Tag;
use Flarum\Extend;
use Flarum\Tags\Api\Serializer\TagSerializer;
use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Api\Serializer\BasicDiscussionSerializer;
use Flarum\Api\Serializer\BasicPostSerializer;
use Flarum\Tags\Event\Saving;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js'),

    new Extend\Locales(__DIR__ . '/locale'),

    (new Extend\Event())
        ->listen(Saving::class, SavePasswordToDatabase::class),

    (new Extend\ApiSerializer(TagSerializer::class))
        ->attributes(AddTagAttributes::class),

    (new Extend\ApiSerializer(BasicDiscussionSerializer::class))
        ->attributes(AddDiscussionAttributes::class),

    (new Extend\ApiSerializer(BasicPostSerializer::class))
        ->attributes(AddPostAttributes::class),

    (new Extend\Policy())
        ->modelPolicy(Discussion::class, Policy\DiscussionPolicy::class)
        ->modelPolicy(Tag::class, Policy\TagPolicy::class),

    (new Extend\Routes('api'))
        ->post('/datlechin/tag-passwords/auth', 'datlechin-tag-passwords.auth', AuthController::class),

    (new Extend\ModelVisibility(Discussion::class))
        ->scopeAll(ScopeDiscussionVisibilityForAbility::class),

    (new Extend\Settings())
        ->default('flarum-tag-passwords.display_unlock_icon', true)
        ->default('flarum-tag-passwords.display_protected_tag_from_sidebar', true)
        ->default('flarum-tag-passwords.display_protected_tag_from_tags_page', true)
        ->default('flarum-tag-passwords.display_protected_tag_from_discussion_list', false)
        ->default('flarum-tag-passwords.display_discussion_avator', false)
        ->default('flarum-tag-passwords.display_protected_tag_from_post_list', false)
        ->default('flarum-tag-passwords.display_protected_tag_from_discussion_page', true)
];
