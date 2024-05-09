<?php

namespace Datlechin\TagPasswords\Listener;

use Flarum\Api\Serializer\BasicPostSerializer;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Post\Post;
use Flarum\Tags\Tag;
use Datlechin\TagPasswords\Utils\ReferrerFinder;

class AddPostAttributes
{
    protected SettingsRepositoryInterface $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    /**
     * @param BasicPostSerializer $serializer
     * @param Post $post
     * @param array $attributes
     * @return array
     */
    public function __invoke(BasicPostSerializer $serializer, Post $post, array $attributes): array
    {
        $actor = $serializer->getActor();
        $isUnlocked = $actor->can('isDiscussionUnlocked', $post->discussion);
        $restrictData = false;
        if (!$isUnlocked) {
            if (ReferrerFinder::findDiscussion($serializer->getRequest(), $post->discussion_id)) {
                $restrictData = !$actor->hasPermission('flarum-tag-passwords.display_protected_tag_from_discussion_page');
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