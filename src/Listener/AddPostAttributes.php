<?php

namespace Datlechin\TagPasswords\Listener;

use Datlechin\TagPasswords\Utils\ReferrerFinder;
use Flarum\Api\Serializer\BasicPostSerializer;
use Flarum\Post\Post;
use Flarum\Settings\SettingsRepositoryInterface;

class AddPostAttributes
{
    protected SettingsRepositoryInterface $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    public function __invoke(BasicPostSerializer $serializer, Post $post, array $attributes): array
    {
        $actor = $serializer->getActor();
        $isUnlocked = $actor->can('isDiscussionUnlocked', $post->discussion);
        $restrictData = false;
        if (! $isUnlocked) {
            if (ReferrerFinder::findDiscussion($serializer->getRequest(), $post->discussion_id)) {
                $restrictData = ! $actor->hasPermission('flarum-tag-passwords.display_protected_tag_from_discussion_page');
            } else {
                $restrictData = true;
            }
        }
        if ($restrictData) {
            // Content is empty to restricting data from API usage, to ensure compatibility with other extension that are using truncate on string. Content must be an empty string '', for example truncate(firstPost.contentPlain()) to stop breakage.
            $attributes['id'] = null;
            $attributes['content'] = '';
            $attributes['contentHtml'] = '';
            $attributes['ipAddress'] = null;
        }
        $attributes['isUnlocked'] = $isUnlocked;

        return $attributes;
    }
}
