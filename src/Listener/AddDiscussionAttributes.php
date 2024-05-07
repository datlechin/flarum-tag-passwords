<?php

namespace Datlechin\TagPasswords\Listener;

use Flarum\Api\Serializer\BasicDiscussionSerializer;
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
     * @param BasicDiscussionSerializer $serializer
     * @param Discussion $discussion
     * @param array $attributes
     * @return array
     */
    public function __invoke(BasicDiscussionSerializer $serializer, Discussion $discussion, array $attributes): array
    {
        $actor = $serializer->getActor();

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
        $totalProtectedTags = count($protectedPasswordTags) + count($protectedGroupPermissionTags);
        $attributes['protectedPasswordTags'] = $protectedPasswordTags;
        $attributes['protectedGroupPermissionTags'] = $protectedGroupPermissionTags;
        $attributes['numberOfProtectedTags'] = $totalProtectedTags;

        $displayProtectedTagForDiscussionList = false;
        $displayDiscussionAvator = false;
        if($totalProtectedTags > 0) {
            $displayProtectedTagForDiscussionList = $actor->hasPermission('flarum-tag-passwords.display_protected_tag_from_discussion_list');
            $displayDiscussionAvator = $actor->hasPermission('flarum-tag-passwords.display_discussion_avator');
        }
        $attributes['displayProtectedTagForDiscussionList'] = $displayProtectedTagForDiscussionList;
        $attributes['displayDiscussionAvator'] = $displayDiscussionAvator;
        return $attributes;
    }
}