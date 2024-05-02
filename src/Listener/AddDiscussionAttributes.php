<?php

namespace Datlechin\TagPasswords\Listener;

use Flarum\Api\Serializer\DiscussionSerializer;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\Discussion\Discussion;
use Flarum\Tags\Tag;

class AddDiscussionAttributes
{
    protected SettingsRepositoryInterface $settings;

    public function __construct(SettingsRepositoryInterface $settings)
    {
        $this->settings = $settings;
    }

    /**
     * @param DiscussionSerializer $serializer
     * @param Discussion $discussion
     * @param array $attributes
     * @return array
     */
    public function __invoke(DiscussionSerializer $serializer, Discussion $discussion, array $attributes): array
    {
        $actor = $serializer->getActor();
        $state = $discussion->stateFor($actor);
        $protectedPasswordTags = [];
        $protectedGroupPermissionTags = [];
        foreach ($discussion->tags as &$tag) {
            $isPasswordProtected = (bool) $tag->password;
            $isGroupPermissionProtected = (bool) $tag->protected_groups;
            if ($isPasswordProtected || $isGroupPermissionProtected) {
                // Only do actor checks if tag has any protection
                $state = $tag->stateFor($actor);
                $isUnlocked =  (bool) $state->is_unlocked;
                if (!$isUnlocked) {
                    if ($isPasswordProtected) {
                        array_push($protectedPasswordTags, $tag);
                    } else {
                        array_push($protectedGroupPermissionTags, $tag);
                    }
                }
            }
        }
        $attributes['protectedPasswordTags'] = $protectedPasswordTags;
        $attributes['protectedGroupPermissionTags'] = $protectedGroupPermissionTags;
        $attributes['numberOfProtectedTags'] = count($protectedPasswordTags) + count($protectedGroupPermissionTags);
        return $attributes;
    }
}
