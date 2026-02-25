<?php

namespace Datlechin\TagPasswords\Api;

use Datlechin\TagPasswords\Utils\ReferrerFinder;
use Flarum\Api\Context;
use Flarum\Api\Schema;
use Flarum\Post\Post;

class PostResourceFields
{
    public function __invoke(): array
    {
        return [
            Schema\Boolean::make('isUnlocked')
                ->get(fn (Post $post, Context $context) => $context->getActor()->can('isDiscussionUnlocked', $post->discussion)),
        ];
    }

    public static function content(Schema\Str $field): Schema\Str
    {
        return $field->get(function (Post $post, Context $context) {
            if (static::shouldRestrictData($post, $context)) {
                return '';
            }

            return $post->content;
        });
    }

    public static function contentHtml(Schema\Str $field): Schema\Str
    {
        return $field->get(function (Post $post, Context $context) {
            if (static::shouldRestrictData($post, $context)) {
                return '';
            }

            return $post->formatContent($context->request);
        });
    }

    protected static function shouldRestrictData(Post $post, Context $context): bool
    {
        $actor = $context->getActor();

        if (! $actor->can('isDiscussionUnlocked', $post->discussion)) {
            if (ReferrerFinder::findDiscussion($context->request, $post->discussion_id)) {
                return ! $actor->hasPermission('flarum-tag-passwords.display_protected_tag_from_discussion_page');
            }

            return true;
        }

        return false;
    }
}
